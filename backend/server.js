require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const fetch = require("node-fetch");

const app = express();

// 🔐 CORS (abhi open, baad me domain restrict kar dena)
app.use(cors());
app.use(express.json());

// 🔍 DEBUG (temporary check)
console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);
console.log("KEY SECRET:", process.env.RAZORPAY_KEY_SECRET ? "Loaded ✅" : "Missing ❌");

// 🔥 Razorpay (ENV se)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Server OK");
});

// 🔥 Create Order
app.post("/create-order", async (req, res) => {
  try {

    const order = await razorpay.orders.create({
      amount: 119900, // ₹1199
      currency: "INR"
    });

    res.json(order);

  } catch (err) {
    console.log("ORDER ERROR:", err);
    res.status(500).send("Order Error");
  }
});

// 🔥 Verify Payment
app.post("/verify-payment", (req, res) => {

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.send("Payment Verified");
  } else {
    res.status(400).send("Invalid Payment");
  }

});

// 🔥 Save to Google Sheet
app.post("/save-data", async (req, res) => {
  try {

    const response = await fetch("https://script.google.com/macros/s/AKfycbyvKGvgL17s9LULg432BnJe0SF7jKNjl7cKwRcRWKDn1SJVtA8wNF4fsgBuXAjlKOya/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();
    console.log("GOOGLE RESPONSE:", text);

    res.send("Saved");

  } catch (err) {
    console.log("SAVE ERROR:", err);
    res.status(500).send("Save Error");
  }
});

// 🚀 Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});