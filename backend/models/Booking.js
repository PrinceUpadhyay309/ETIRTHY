const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  packageId: Number,
  date: String,
  passengers: Number,
  amount: Number,

  paymentId: String,
  orderId: String,
  paymentMethod: String,

  status: {
    type: String,
    enum: ["pending", "paid", "cancelled"],
    default: "pending"
  }
}, { timestamps: true }); // createdAt, updatedAt

module.exports = mongoose.model("Booking", bookingSchema);
