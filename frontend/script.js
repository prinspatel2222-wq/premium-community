const BASE_URL = "https://premium-community.onrender.com";

let isProcessing = false;

async function payNow() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    let name = document.getElementById("name").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let email = document.getElementById("email").value.trim();
    let business = document.getElementById("business").value;

    if (!name || !phone || !email || business === "Select Business Type") {
      alert("Please fill all fields");
      isProcessing = false;
      return;
    }

    let res = await fetch(`${BASE_URL}/create-order`, {
      method: "POST",
    });

    let order = await res.json();

    const options = {
      key: "rzp_live_SnYFfx1IaSaQPP",
      amount: order.amount,
      currency: "INR",
      order_id: order.id,

      handler: function (response) {
        console.log("PAYMENT RESPONSE:", response);
        verifyPayment(response, name, phone, email, business);
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    console.log(err);
    alert("Payment Error ❌");
  } finally {
    isProcessing = false;
  }
}

// 🔥 VERIFY PAYMENT
function verifyPayment(response, name, phone, email, business) {
  fetch(`${BASE_URL}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success" || data === "Payment Verified") {
        return fetch(`${BASE_URL}/save-data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone,
            email,
            business,
            payment_id: response.razorpay_payment_id,
          }),
        });
      } else {
        throw new Error("Payment Failed");
      }
    })
    .then(() => {
      let msg = `Payment successful 🎉`;

      window.location.href = `https://wa.me/91${phone}?text=${encodeURIComponent(
        msg
      )}`;
    })
    .catch((err) => {
      console.log(err);
      alert("Payment Failed ❌");
    });
}