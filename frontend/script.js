
// 🔒 Phone number digits only
window.onload = function () {
  document.getElementById("phone").addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
};

const BASE_URL = "https://premium-community.onrender.com"; 

// 💰 Payment
async function payNow() {

  let name = document.getElementById("name").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let email = document.getElementById("email").value.trim();
  let business = document.getElementById("business").value;

  if (name === "") return alert("Enter name");
  if (!/^[6-9]\d{9}$/.test(phone)) return alert("Enter valid number");
  if (email === "") return alert("Enter email");
  if (business === "Select Business Type") return alert("Select business");

  try {
    let res = await fetch(`${BASE_URL}/create-order`, { method: "POST" });
    let order = await res.json();

    var options = {
      key: "rzp_test_SlXTJyhyCHv34f",
      amount: order.amount,
      currency: "INR",
      name: "Premium Community",
      order_id: order.id,

      handler: function (response) {
        verifyPayment(response, name, phone, email, business);
      }
    };

    new Razorpay(options).open();

  } catch (err) {
    alert("Error: " + err);
  }
}

// ✅ Verify
function verifyPayment(response, name, phone, email, business) {

  fetch(`${BASE_URL}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response)
  })
  .then(res => res.text())
  .then(data => {

    if (data.trim() === "Payment Verified") {

      return fetch(`${BASE_URL}/save-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, email, business,
          payment_id: response.razorpay_payment_id
        })
      });

    } else {
      throw new Error("Not verified");
    }

  })
  .then(() => {

    let msg = `Hi ${name}, Payment successful 🎉

Join WhatsApp:
https://chat.whatsapp.com/EJoQhmKLCD2KwsefSsZQeA

Join Telegram:
https://t.me/+yOpxsenYUpw4NTA1 

Note : Don’t panic. It may take some time for you to join.
Even if you are unable to join using the link, we will add you from our side.`;

    window.location.href = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;

  })
  .catch(err => {
    console.log(err);
    alert("Error ❌");
  });
}