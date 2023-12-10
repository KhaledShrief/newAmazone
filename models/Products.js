const mongoose = require("mongoose")
const ProductsSchema =  new mongoose.Schema({
  position:{
    type:Number,
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
    
    
  },
  image:{
    type:String,
    required:true
  },
  category:{
    type: String,
    required:true
  }
})
module.exports = mongoose.model("Products",ProductsSchema)