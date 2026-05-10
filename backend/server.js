require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const fetch = require("node-fetch");

const app = express();

// 🔐 Middlewares
app.use(cors());
app.use(express.json());

// ✅ Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Server OK ✅");
});

// 🔥 Create Order
app.post("/create-order", async (req, res) => {

  try {

    const order = await razorpay.orders.create({

      amount: 1000, // ₹1199 in paise

      currency: "INR",

    });

    res.json(order);

  } catch (err) {

    console.log("CREATE ORDER ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Order creation failed"
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

    // ✅ Check missing fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {

      return res.status(400).send("Payment Data Missing");

    }

    // ✅ Generate Signature
    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto

      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )

      .update(body.toString())

      .digest("hex");

    // ✅ Compare
    if (expectedSignature === razorpay_signature) {

      res.send("Payment Verified");

    } else {

      res.status(400).send("Invalid Payment");

    }

  } catch (err) {

    console.log("VERIFY ERROR:", err);

    res.status(500).send("Verification Failed");

  }

});

// 🔥 Save Data To Google Sheet
app.post("/save-data", async (req, res) => {

  try {

    // ✅ Google Apps Script URL
    const GOOGLE_SCRIPT_URL =
      process.env.GOOGLE_SCRIPT_URL;

    if (!GOOGLE_SCRIPT_URL) {

      return res.status(500).send("Google Script URL Missing");

    }

    // ✅ Send Data
    const response = await fetch(

      GOOGLE_SCRIPT_URL,

      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(req.body),

      }

    );

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

  console.log(
    `Server running on port ${PORT}`
  );

});