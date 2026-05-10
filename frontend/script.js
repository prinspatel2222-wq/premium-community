const { response } = require("express");

const BASE_URL = "https://premium-community.onrender.com";

async function payNow() {

  let name = document.getElementById("name").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let email = document.getElementById("email").value.trim();
  let business = document.getElementById("business").value;

  let res = await fetch(`${BASE_URL}/create-order`, {
    method: "POST"
  });

  let order = await res.json();

  var options = {
    key: "rzp_live_SnYFfx1IaSaQPP",
    amount: order.amount,
    currency: "INR",
    order_id: order.id,

    handler: function (response) {
      verifyPayment(response, name, phone, email, business);
    }
  };

  new Razorpay(options).open();
}

function verifyPayment(response, name, phone, email, business) {

  fetch(`${BASE_URL}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response)
  })
  .then(res => res.text())
  .then(data => {

    if (data === "Payment Verified") {

      return fetch(`${BASE_URL}/save-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, email, business,
          payment_id: response.razorpay_payment_id
        })
      });

    } else {
      throw new Error("Failed");
    }

  })
  .then(() => {

    window.location.href =
      `https://wa.me/91${phone}?text=${encodeURIComponent(
        "Payment successful 🎉"
      )}`;

  })
  .catch(err => {
    console.log(err);
    alert("Payment Failed");
  });
}


