require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const fetch = require("node-fetch");

const app = express();

// 🔐 CORS
app.use(cors());
app.use(express.json());

// 🔍 DEBUG
console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);
console.log(
  "KEY SECRET:",
  process.env.RAZORPAY_KEY_SECRET ? "Loaded ✅" : "Missing ❌"
);

// 🔥 Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Server OK");
});

// 🔥 Create Order
app.post("/create-order", async (req, res) => {
  try {

    const order = await razorpay.orders.create({
      amount: 100, // ₹1 TEST
      currency: "INR",
      receipt: "bgpn_receipt"
    });

    console.log("ORDER CREATED:", order);

    res.status(200).json({
      success: true,
      order: order
    });

  } catch (err) {

    console.log("ORDER ERROR FULL:", err);

    res.status(500).json({
      success: false,
      message: "Order Error",
      error: err.message
    });

  }
});

// 🔥 Verify Payment
app.post("/verify-payment", (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {

      res.status(200).json({
        success: true,
        message: "Payment Verified"
      });

    } else {

      res.status(400).json({
        success: false,
        message: "Invalid Payment"
      });

    }

  } catch (err) {

    console.log("VERIFY ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Verification Failed"
    });

  }

});

// 🔥 Save Data To Google Sheet
app.post("/save-data", async (req, res) => {

  try {

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyvKGvgL17s9LULg432BnJe0SF7jKNjl7cKwRcRWKDn1SJVtA8wNF4fsgBuXAjlKOya/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const text = await response.text();

    console.log("GOOGLE RESPONSE:", text);

    res.status(200).json({
      success: true,
      message: "Saved"
    });

  } catch (err) {

    console.log("SAVE ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Save Error"
    });

  }

});

// 🚀 Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});