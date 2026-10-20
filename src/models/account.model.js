const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model"); 

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Account must be associated with a user"],
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ["Active", "Frozen", "Closed"],
        message: "Status can be either Active, Frozen or Closed",
      },
      default: "Active",
    },
    currency: {
      type: String,
      required: [true, "Currency is Required for creating an account"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);

accountSchema.index({ user: 1, status: 1 });
accountSchema.methods.getBalance = async function () {
  const balanceData = await ledgerModel.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totaldebit: {
           $sum: {
              $cond: [
                { $eq: ["$type", "debit"] },
               "$amount",
                0
             ] 
            } 
          },
        totalcredit: {
          $sum: {
            $cond: [
              { $eq: ["$type", "credit"] },
              "$amount",
              0
            ]
          }
        }      
      }
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ["$totalcredit", "$totaldebit"] }
      }
    }   
  ])

  if (balanceData.length === 0)  return 0;

  return balanceData[0].balance
 
}



const accountmodel = mongoose.model("account", accountSchema);
module.exports = accountmodel;
