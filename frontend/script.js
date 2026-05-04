// // 🔒 Phone number me sirf digits allow
// window.onload = function () {
//   document.getElementById("phone").addEventListener("input", function () {
//     this.value = this.value.replace(/[^0-9]/g, '');
//   });
// };

// // 💰 Payment function
// async function payNow() {

//   let name = document.getElementById("name").value.trim();
//   let phone = document.getElementById("phone").value.trim();
//   let email = document.getElementById("email").value.trim();
//   let business = document.getElementById("business").value;

//   // 🔴 Validations
//   if (name === "") {
//     alert("Please enter your name");
//     return;
//   }

//   let phonePattern = /^[6-9]\d{9}$/;
//   if (!phonePattern.test(phone)) {
//     alert("Enter valid 10-digit mobile number");
//     return;
//   }

//   if (email === "") {
//     alert("Please enter your email");
//     return;
//   }

//   if (business === "Select Business Type") {
//     alert("Please select business type");
//     return;
//   }

//   try {
//     // 🔥 Order create
//     let res = await fetch("http://localhost:3000/create-order", {
//       method: "POST"
//     });

//     let order = await res.json();

//     var options = {
//       key: "rzp_test_Se7Mou7c24a1J0",
//       amount: order.amount,
//       currency: "INR",
//       name: "Premium Community",
//       description: "Membership Payment",
//       order_id: order.id,

//       handler: function (response) {
//         verifyPayment(response, name, phone, email, business);
//       }
//     };

//     var rzp = new Razorpay(options);
//     rzp.open();

//   } catch (err) {
//     alert("Error: " + err);
//   }
// }


// // 🔥 Verify + Save + WhatsApp
// function verifyPayment(response, name, phone, email, business) {

//   fetch("http://localhost:3000/verify-payment", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(response)
//   })
//   .then(res => res.text())
//   .then(data => {

//     // 🔥 FIX: trim use karo
//     if (data.trim() === "Payment Verified") {

//       alert("Payment Verified ✅");

//       // 🔥 SAVE DATA
//       return fetch("http://localhost:3000/save-data", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           name: name,
//           phone: phone,
//           email: email,
//           business: business,
//           payment_id: response.razorpay_payment_id
//         })
//       });

//     } else {
//       throw new Error("Payment not verified");
//     }

//   })
//   .then(res => res.text())
//   .then(data => {

//     console.log("SAVE RESPONSE:", data);
//     alert("Data Saved ✅");

//     // 🔥 FIXED WhatsApp link
//     let message = `Hi ${name}, Payment successful 🎉\nJoin our Premium Community:\nhttps://chat.whatsapp.com/EFFBEZ0hxGdKmNEoUjnzqF`;

//     let url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

//     window.open(url, "_blank");

//   })
//   .catch(err => {
//     console.log("ERROR:", err);
//     alert("Something went wrong ❌");
//   });

// }
// 🔒 Phone number me sirf digits allow
window.onload = function () {
  document.getElementById("phone").addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
};

// 💰 Payment function
async function payNow() {

  let name = document.getElementById("name").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let email = document.getElementById("email").value.trim();
  let business = document.getElementById("business").value;

  // 🔴 Validations
  if (name === "") {
    alert("Please enter your name");
    return;
  }

  let phonePattern = /^[6-9]\d{9}$/;
  if (!phonePattern.test(phone)) {
    alert("Enter valid 10-digit mobile number");
    return;
  }

  if (email === "") {
    alert("Please enter your email");
    return;
  }

  if (business === "Select Business Type") {
    alert("Please select business type");
    return;
  }

  try {
    // 🔥 Order create
    let res = await fetch("http://localhost:3000/create-order", {
      method: "POST"
    });

    let order = await res.json();

    var options = {
      key: "rzp_test_Se7Mou7c24a1J0",
      amount: order.amount,
      currency: "INR",
      name: "Premium Community",
      description: "Membership Payment",
      order_id: order.id,

      handler: function (response) {
        verifyPayment(response, name, phone, email, business);
      }
    };

    var rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    alert("Error: " + err);
  }
}


// 🔥 Verify + Save + WhatsApp (FINAL FIX)
function verifyPayment(response, name, phone, email, business) {

 fetch("https://your-backend-url.onrender.com/create-order"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(response)
  })
  .then(res => res.text())
  .then(data => {

    if (data.trim() === "Payment Verified") {

      alert("Payment Verified ✅");

      // 🔥 SAVE DATA
      return fetch("http://localhost:3000/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          phone: phone,
          email: email,
          business: business,
          payment_id: response.razorpay_payment_id
        })
      });

    } else {
      throw new Error("Payment not verified");
    }

  })
  .then(res => res.text())
  .then(data => {

    console.log("SAVE RESPONSE:", data);
    alert("Data Saved ✅");

    // 🔥 WhatsApp message
    let message = `Hi ${name}, Payment successful 🎉

👉 Click send to confirm your membership

Join WhatsApp Group:
https://chat.whatsapp.com/EJoQhmKLCD2KwsefSsZQeA

Join Telegram Group : 
https://t.me/+yOpxsenYUpw4NTA1`;

    let url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

    // 🔥 BEST FIX (popup block nahi hoga)
    setTimeout(() => {
      window.location.href = url;
    }, 500);

  })
  .catch(err => {
    console.log("ERROR:", err);

    // 🔥 even error ho tab bhi WhatsApp open
    let message = `Hi ${name}, Payment successful 🎉

Join group:
https://chat.whatsapp.com/EFFBEZ0hxGdKmNEoUjnzqF`;

    let url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

    window.location.href = url;
  });

}