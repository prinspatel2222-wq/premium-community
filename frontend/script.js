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

  if (!/^[6-9]\d{9}$/.test(phone))
    return alert("Enter valid number");

  if (email === "") return alert("Enter email");

  if (business === "Select Business Type")
    return alert("Select business");

  try {

    let res = await fetch(`${BASE_URL}/create-order`, {
      method: "POST"
    });

    let data = await res.json();

    console.log("CREATE ORDER RESPONSE:", data);

    if (!data.success) {
      return alert("Order creation failed ❌");
    }

    const order = data.order;

    var options = {

      key: "rzp_live_SnKgp6HQ8AXsHZ",

      amount: order.amount,

      currency: order.currency,

      name: "Premium Community",

      description: "BGPN Community Membership",

      order_id: order.id,

      handler: function (response) {

        verifyPayment(
          response,
          name,
          phone,
          email,
          business
        );

      }

    };

    new Razorpay(options).open();

  } catch (err) {

    console.log("PAYMENT ERROR:", err);

    alert("Payment Error ❌");

  }

}

// ✅ Verify Payment
async function verifyPayment(
  response,
  name,
  phone,
  email,
  business
) {

  try {

    const verifyRes = await fetch(
      `${BASE_URL}/verify-payment`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })

      }
    );

    const verifyData = await verifyRes.json();

    console.log("VERIFY RESPONSE:", verifyData);

    if (verifyData.success) {

      // 🔥 Save data
      await fetch(`${BASE_URL}/save-data`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name,
          phone,
          email,
          business,
          payment_id: response.razorpay_payment_id
        })

      });

      // ✅ WhatsApp redirect
      let msg = `Hi ${name}, Payment successful 🎉

Join WhatsApp:
https://chat.whatsapp.com/EJoQhmKLCD2KwsefSsZQeA

Join Telegram:
https://t.me/+yOpxsenYUpw4NTA1

Note : Don’t panic. It may take some time for you to join.
Even if you are unable to join using the link, we will add you from our side.`;

      window.location.href =
        `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;

    } else {

      alert("Payment Verification Failed ❌");

    }

  } catch (err) {

    console.log("VERIFY ERROR:", err);

    alert("Verification Error ❌");

  }

}