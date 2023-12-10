const mongoose = require("mongoose")
const CartSchema = new mongoose.Schema({
  sec_id:{
        type:String,
        required:true
    },
    title:{
        type: String,
        required:true
      },
      des:{
        type:String,
        required:true
      },
      price:{
        type: Number,
        required:true,
        
      },
      image:{
        type:String,
        required:true
      },
      category:{
        type: String,
        required:true
      },
      item:{
        type:Number,
        required:true
      }

})
module.exports = mongoose.model("Cart",CartSchema)