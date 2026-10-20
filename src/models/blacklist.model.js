const mongoose = require("mongoose");


const blacklistSchema = new mongoose.Schema({
  token: {
    type: String, 
    required:true[true,"Token is required to blacklist"],
    unique:[true,"Token already blacklisted"]
     },

    //  blacklistedAt: {
    //     type: Date,
    //     default: Date.now,
    //     immutable: true
    // }
} ,{
    timestamps: true
});
 
 blacklistSchema.index({ createdAt:1 },{
    expiredAfterSeconds: 60*60*24*3
 });

 const blacklistModel = mongoose.model("Blacklist", blacklistSchema);

module.exports = blacklistModel;