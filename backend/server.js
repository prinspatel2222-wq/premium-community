// const express = require("express");
// const cors = require("cors");
// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const fetch = require("node-fetch"); // 👈 IMPORTANT (v2 installed)

// const app = express();

// app.use(cors());
// app.use(express.json());

// // 🔥 Razorpay connect
// const razorpay = new Razorpay({
//   key_id: "rzp_test_Se7Mou7c24a1J0",
//   key_secret: "Lj1TXMexoCPB6L5txJT5qmge"
// });
// // const razorpay = new Razorpay({
// //   key_id: process.env.RAZORPAY_KEY_ID,
// //   key_secret: process.env.RAZORPAY_KEY_SECRET
// // });

// // ✅ Test route
// app.get("/", (req, res) => {
//   res.send("Server OK");
// });

// // 🔥 Order create API
// app.post("/create-order", async (req, res) => {

//   console.log("Order API called");

//   try {
//     const order = await razorpay.orders.create({
//       amount: 119900,
//       currency: "INR"
//     });

//     console.log("ORDER SUCCESS:", order);

//     res.json(order);

//   } catch (err) {
//     console.log("ERROR FULL:", err);
//     res.status(500).send("Error creating order");
//   }

// });

// // 🔥 Payment verify API
// app.post("/verify-payment", (req, res) => {

//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//   const body = razorpay_order_id + "|" + razorpay_payment_id;

//   const expectedSignature = crypto
//     .createHmac("sha256", "Lj1TXMexoCPB6L5txJT5qmge")
//     .update(body.toString())
//     .digest("hex");

//   console.log("VERIFY CHECK:");
//   console.log("EXPECTED:", expectedSignature);
//   console.log("RECEIVED:", razorpay_signature);

//   if (expectedSignature === razorpay_signature) {
//     res.send("Payment Verified");
//   } else {
//     res.status(400).send("Invalid Payment");
//   }

// });

// // 🔥 Save data to Google Sheet
// app.post("/save-data", async (req, res) => {

//   try {
//     console.log("DATA RECEIVED:", req.body); // 👈 DEBUG

//     const response = await fetch("https://script.google.com/macros/s/AKfycbyvKGvgL17s9LULg432BnJe0SF7jKNjl7cKwRcRWKDn1SJVtA8wNF4fsgBuXAjlKOya/exec", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(req.body)
//     });

//     const text = await response.text(); // 👈 DEBUG
//     console.log("GOOGLE RESPONSE:", text);

//     res.send("Saved");

//   } catch (err) {
//     console.log("SAVE ERROR:", err);
//     res.status(500).send("Error saving");
//   }

// });

// app.listen(3000, () => {
//   console.log("Server running on port 3000");
// });

// // const PORT = process.env.PORT || 3000;

// // app.listen(PORT, () => {
// //   console.log("Server running");
// // });
require("dotenv").config(); // 🔥 ADD THIS

const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const fetch = require("node-fetch");

const app = express();

// 🔐 CORS FIX (अपना domain डालना बाद में)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// 🔥 SECURE Razorpay connect (.env से)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Server OK");
});

// 🔥 Order create API (SECURE)
app.post("/create-order", async (req, res) => {

  try {

    // 🔐 FIXED AMOUNT (user change nahi kar sakta)
    const order = await razorpay.orders.create({
      amount: 119900,
      currency: "INR"
    });

    res.json(order);

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).send("Error creating order");
  }

});

// 🔥 Payment verify (SECURE)
app.post("/verify-payment", (req, res) => {

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET) // 🔥 FIX
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.send("Payment Verified");
  } else {
    res.status(400).send("Invalid Payment");
  }

});

// 🔥 Save data
app.post("/save-data", async (req, res) => {

  try {

    const response = await fetch("https://script.google.com/macros/s/AKfycbyvKGvgL17s9LULg432BnJe0SF7jKNjl7cKwRcRWKDn1SJVtA8wNF4fsgBuXAjlKOya/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    res.send("Saved");

  } catch (err) {
    console.log("SAVE ERROR:", err);
    res.status(500).send("Error saving");
  }

});

// 🔥 PORT FIX (Render compatible)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running");
});