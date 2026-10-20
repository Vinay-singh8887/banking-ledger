const mongoose = require("mongoose");
const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Ledger must be associated with an account"],
        index: true,
        immutable: true,
    },
    amount: {
        type: Number,
        required: [true, "Ledger must have an amount"],
    },

    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: [true, "Ledger must be associated with a transaction"],
        index: true,
        immutable: true,
    },
    type: {
        type: String,
        enum: {
            values: ["credit", "debit"],
            message: "Ledger type must be either credit or debit",
        },
        required: [true, "Ledger must have a type"],
        immutable: true
    } 
})

function preventledgerModification() {

    throw new Error("Ledger entries are immutable and cannot be modified or deleted");
     
}

ledgerSchema.pre('findoneAndUpdate',preventledgerModification);
ledgerSchema.pre('upadateOne',preventledgerModification);
ledgerSchema.pre('deleteOne',preventledgerModification);
ledgerSchema.pre('remove',preventledgerModification);
ledgerSchema.pre('deleteMany',preventledgerModification);
ledgerSchema.pre('updateMany',preventledgerModification);
ledgerSchema.pre('findOneAndDelete',preventledgerModification);
ledgerSchema.pre('findOneAndReplace',preventledgerModification);

const ledgermodel = mongoose.model('ledger',ledgerSchema);

module.exports = ledgermodel;