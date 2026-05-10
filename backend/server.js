require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Test
app.get("/", (req, res) => {
  res.send("Server OK");
});

// 🔥 Create Order
app.post("/create-order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 1000,
      currency: "INR",
    });

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).send("Order Error");
  }
});

// 🔥 Verify Payment (OLD SIMPLE WORKING STYLE)
app.post("/verify-payment", (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected === razorpay_signature) {
    res.send("Payment Verified");
  } else {
    res.status(400).send("Invalid Payment");
  }
});

// 🔥 Save Google Sheet (OLD STYLE)
app.post("/save-data", async (req, res) => {
  try {
    const response = await fetch(process.env.GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    console.log("Google:", text);

    res.send("Saved");
  } catch (err) {
    console.log(err);
    res.status(500).send("Save Error");
  }
});

// 🚀 Start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});