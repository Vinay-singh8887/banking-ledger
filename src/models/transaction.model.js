const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "Transaction must be associated with an account"],
    index: true,
  },

  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "Transaction must be associated with an account"],
    index: true,
  },

  status: {
    type: String,
    enum: {
      values: ["pending", "completed", "failed", "reversed"],
      message: "Status must be either pending, completed, failed or reversed",
    },
    default: "pending",
  },

  amount: {
    type: Number,
    required: [true, "Transaction must have an amount"],
    min: [0, "Transaction amount must be greater than or equal to 0"],
  },
  idempotencyKey: {
    type: String,
    required: [true, "Transaction must have an idempotency key"],
    index: true,
    unique: true,
  }
},{
    timestamps: true,
});

const transcationModel = mongoose.model("transaction", transactionSchema);
module.exports = transcationModel;
