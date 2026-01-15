const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true // hashed (bcrypt)
  },

  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user"
  },
  
  isSuperAdmin: {
  type: Boolean,
  default: false
  },

  isActive: {
    type: Boolean,
    default: true
  }


}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
