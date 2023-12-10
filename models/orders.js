const mongoose = require("mongoose")
const OrdersSchema = new mongoose.Schema({
  user:{
        type:Object,
       
    },
    userId:{
      type:String
    },
    country:{
        type: String,
        
      },
      fullname:{
        type:String,
        
      },
      phonenumber:{
        type: String,
        
        
      },
      address:{
        type:String,
        
      },
      city:{
        type: String,
        
      },
      cart:[{
        type:Array,
    
      }],
      tottal:{
        type:String
      }

})
module.exports = mongoose.model("Orders",OrdersSchema)