// 🔥 Create Order
app.post("/create-order", async (req, res) => {
  try {

    const order = await razorpay.orders.create({
      amount: 1000, // ₹1199 = 119900 paise
      currency: "INR",
      receipt: "bgpn_receipt"
    });

    console.log("ORDER CREATED:", order);

    res.json({
      success: true,
      order
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