const BASE_URL ="https://premium-community.onrender.com";

// 🔒 Prevent multiple clicks
let isProcessing = false;

// 🔒 Phone number only digits
window.onload = function () {
  document.getElementById("phone").addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
  });
};

async function payNow() {

  // 🔒 Prevent double click
  if (isProcessing) return;

  isProcessing = true;

  try {

    let name = document.getElementById("name").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let email = document.getElementById("email").value.trim();
    let business = document.getElementById("business").value;

    // ✅ VALIDATIONS
    if (name === "") {
      alert("Enter your name");
      isProcessing = false;
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Enter valid 10 digit mobile number");
      isProcessing = false;
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Enter valid email");
      isProcessing = false;
      return;
    }

    if (business === "Select Business Type") {
      alert("Select business type");
      isProcessing = false;
      return;
    }

    // 🔥 Create Order
    let res = await fetch(`${BASE_URL}/create-order`, {
      method: "POST"
    });

    if (!res.ok) {
      throw new Error("Order creation failed");
    }

    let order = await res.json();

    // 🔥 Razorpay
    var options = {

      key: "rzp_live_SndvacBJCKpesn",

      amount: order.amount,
      currency: "INR",
      order_id: order.id,

      name: "BGPN Community",

      description: "Premium Membership",

      handler: function (response) {

        verifyPayment(
          response,
          name,
          phone,
          email,
          business
        );

      },

      theme: {
        color: "#3399cc"
      }

    };

    const rzp = new Razorpay(options);

    rzp.on("payment.failed", function () {
      alert("Payment Failed ❌");
      isProcessing = false;
    });

    rzp.open();

  } catch (err) {

    console.log(err);

    alert("Something went wrong ❌");

    isProcessing = false;

  }

}

// 🔥 VERIFY PAYMENT
function verifyPayment(response, name, phone, email, business) {

  fetch(`${BASE_URL}/verify-payment`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(response)

  })

  .then(res => {

    if (!res.ok) {
      throw new Error("Verification failed");
    }

    return res.text();

  })

  .then(data => {

    if (data === "Payment Verified") {

      // 🔥 SAVE DATA
      return fetch(`${BASE_URL}/save-data`, {

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

    } else {

      throw new Error("Payment verify failed");

    }

  })

  .then(() => {

    // ✅ WhatsApp redirect
    let message = `Hi ${name},

Payment successful 🎉

Welcome to BGPN Community 🚀`;

    window.location.href =
      `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

  })

  .catch(err => {

    console.log(err);

    alert("Payment Failed ❌");

  })

  .finally(() => {

    isProcessing = false;

  });

}