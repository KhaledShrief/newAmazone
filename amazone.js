if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
 };
//  const {fetch} = require("node-fetch");
const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));

const express = require("express");
const amazone = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const dbUrl = process.env.DB_URL ||  'mongodb://127.0.0.1:27017/amazone';
const Products = require("./models/Products.js");
const Cart = require("./models/cart.js")
const methodOverride = require("method-override")
const passport=require("passport")
const passportLocal=require("passport-local")

const flash = require("connect-flash")
const User = require("./models/user.js")
const Orders =require("./models/orders.js")
const secret = process.env.SECRET || "secret"
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const port = process.env.PORT || 3000
mongoose.connect(dbUrl,{
    // useNewUrlParser:true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
})
.then(()=>{
    console.log("welcome to mongo")
})
.catch((err)=>{
    console.log("ouch error from mongo",err)
})
// host static files
amazone.use(express.static("client"));
  
// parse post params sent in body in json format

amazone.use(express.json());

amazone.use(express.urlencoded({extended:true}))
amazone.set("view engine","ejs")
amazone.set("views",path.join(__dirname,"views"))
amazone.engine("ejs", ejsMate)
amazone.use(methodOverride("_method"))
//session middleware
const store = new MongoStore({
  url: dbUrl,
  secret,
  touchAfter: 24*60*60
})

store.on("error",function(e){
 console.log("session store error =",e)
})
const sessionSecret ={
    store,
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
amazone.use((err,req,res,next)=>{
    const {statusCode = 500 ,message = "Somthing Went Wrong"} = err
     res.status(statusCode).render("error.ejs",{err});

 })
amazone.use(session(sessionSecret))
amazone.use(flash());
//passport middleware
amazone.use(passport.initialize())
amazone.use(passport.session())
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());
amazone.use((req,res,next)=>{
    
    res.locals.currentUser = req.user
    res.locals.success =req.flash("success")
    res.locals.error =req.flash("error")
    next()
})
const isLoggedin = (req,res,next)=>{
    
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash("success","You Must Signin")
        return res.redirect("/login");
    }
    next()
}

// wierd
var paypal = require('paypal-rest-sdk');
const environment =process.env.ENVIRONMENT;
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET  } = process.env;
const access_token = process.env.PAYPAL_ACCESS_TOKEN
const base = "https://api-m.sandbox.paypal.com";
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id':"AYSk5vunQhIyGTIZ3QddFQdJMaaQazFcslxZdnG_AiCBpak77EnyslARCVctUWZrHGK6EWIi48RbtMos",
  'client_secret':"EC2H_hnkqCCC3-0-3dAoKOR6LKEdjHGTzds8ta2Nnvgi72hJXbH2-Zc9mTWt6mqLpxULXf9OCUyNR9l5"
});




// wierd

amazone.get("/", async(req,res)=>{
  
    const products = await Products.find({});
    
    res.render("home.ejs",{products})
})

amazone.get("/logout",(req,res)=>{
    req.logout(function(err) {
        if (err) { 
          return next(err); 
          }
          req.flash("success","Goodbye!");

        res.redirect('/');
      });
})
amazone.get("/register",(req,res)=>{
  
    res.render("register.ejs")
})
amazone.post("/register",async(req,res)=>{
    
    const {username,email,password} = req.body
    
    const user = new User({email,username})
    const newUser = await User.register(user,password)
  
    req.login(newUser,(err)=>{
        if(err) return next(err)
        req.flash("success","welcome to Fake Amazon")
        res.redirect("/")
    })
})
amazone.get("/login",(req,res)=>{
   
    res.render("login.ejs")

})
amazone.post("/login", passport.authenticate('local', { failureRedirect:"/login"}),(req,res)=>{
    
    req.flash("success","Welcome back to Fake Amazon")
    const returnUrl =req.session.returnTo || "/cart";
    delete req.session.returnTo
    res.redirect(returnUrl)
  })

amazone.get("/cart",async(req,res)=>{
    const carts = await Cart.find({})
    res.render("cart.ejs",{carts})
   })
amazone.get("/deals",async(req,res)=>{
const products = await Products.find({category:'LED & LCD TVs'})
res.render("deals.ejs",{products})
})
amazone.get("/toys",async(req,res)=>{
    const products = await Products.find({category:'Hammering & Pounding Toys'})
    res.render("toys.ejs",{products})
})
amazone.get("/makeup",async(req,res)=>{
    const products = await Products.find({category:'Lip Gloss'})
    res.render("makeup.ejs",{products})
})
amazone.get("/fashon",async(req,res)=>{
    const products = await Products.find({category:"Boys' Outerwear Jackets"})
    res.render("fashon.ejs",{products})
})
amazone.get("/returnsorders",isLoggedin,async(req,res)=>{
  const {id} = req.user
  const submitted = await Orders.find({userId:id})
  
  // console.log(submitted[0].cart[0][0].image)
  res.render("returnsorders.ejs",{submitted})
});
amazone.delete("/returnsorders",async(req,res)=>{
  const {order}= req.body
  const {id} = order
  await Orders.findByIdAndDelete(id)
  res.redirect("/cart")
})

amazone.get("/paymentform/credit",isLoggedin,async(req,res)=>{
  const {id} = req.user
  const orders = await Orders.find({userId:id})
  // console.log(orders[orders.length-1].tottal)
  res.render("credit.ejs",{orders})
 })

 amazone.post("/pay",async(req,res)=>{
  const {id} = req.user
  const orders = await Orders.find({userId:id})
  console.log(orders)
  console.log(orders[0].cart)
  const create_payment_json = {
    
    'intent': 'sale',
    'payer': {
      'payment_method': 'paypal'
    },
    'redirect_urls': {
      'return_url': 'http://localhost:3000/success',
      'cancel_url': 'http://localhost:3000/cancel'
    },
    'transactions': [{
      "item_list":{
        "items":[{
          "name":"Red Sox Hat",
          "sku":"001",
          "price":`${orders[orders.length-1].tottal}`,
          "currency":"USD",
          "quantity":1
        }]
      },
      'amount': {
        'currency': 'USD',
        'total': `${orders[orders.length-1].tottal}`
      },
      'description': 'This is the payment description.'
    }]
  };
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error
    } else {
      for(let i = 0 ; i<payment.links.length;i++){
        if(payment.links[i].rel ==="approval_url"){
         res.redirect(payment.links[i].href)
        }
      }
      // console.log(payment);
    }
  });
 })

 amazone.get("/success",(req,res)=>{
  const payerId = req.query.PayerID;
  const paymentId = req.query.PaymentId;

  const execute_payment_json={
    "payer_id":payerId,
    "transactions":[{
      'amount': {
        'currency': 'USD',
        'total': '25.00'
      }
    }]
  };
  paypal.payment.execute(paymentId,execute_payment_json,function (error, payment) {
    if(error){
      console.log(error.response)
      throw error
    }else{
      console.log(JSON.stringify(payment))
      res.render("Success.ejs")
    }
  })
 })

 amazone.get("/cancel",(req,res)=>{
  res.send("cancel");
 })

amazone.get("/paymentform",isLoggedin,async(req,res)=>{
    const cart = await Cart.find({})
    // console.log(cart)
    res.render("paymentform.ejs",{cart})

})
amazone.get("/:id",async(req,res)=>{
    
  const products = await Products.findById(req.params.id);
  
  res.render("show.ejs",{products});
  })
amazone.post("/paymentform",isLoggedin,async(req,res)=>{
    const cart = await Cart.find({});
    const {order} = req.body
    if(order.country ===""||order.fullname ===""||order.phonenumber ===""||order.address ===""|| order.city ===""){
      res.redirect("/paymentform")
    }
    const {id} = req.user
    function tottal(){
      const myarr=[]
        for(let i =0;i<cart.length;i++){
    // console.log( cart[i].price)
            myarr.push(cart[i].price)
    
        }
        if(myarr.length===1){
          return myarr[0]
        }
        else if(myarr.length === 2){
    return myarr[0]+myarr[1]
        }
        else if(myarr.length === 3){
          return myarr[0]+myarr[1]+myarr[2]
        }
        else if(myarr.length === 4){
          return myarr[0]+myarr[1]+myarr[2]+myarr[3]
        }
    else if(myarr.length === 5){
          return myarr[0]+myarr[1]+myarr[2]+myarr[3]+myarr[4]
        }
        else if(myarr.length === 6){
          return(myarr[0]+myarr[1]+myarr[2]+myarr[3]+myarr[4]+myarr[5])
        }
        else if(myarr.length === 7){
          return(myarr[0]+myarr[1]+myarr[2]+myarr[3]+myarr[4]+myarr[5]+myarr[6])
        }
        else if(myarr.length === 8){
          return(myarr[0]+myarr[1]+myarr[2]+myarr[3]+myarr[4]+myarr[5]+myarr[6]+myarr[7])
        } else if(myarr.length === 9){
          return(myarr[0]+myarr[1]+myarr[2]+myarr[3]+myarr[4]+myarr[5]+myarr[6]+myarr[7]+myarr[8])
        }
         else if(myarr.length === 10){
          return(myarr[0]+myarr[1]+myarr[2]+myarr[3]+myarr[4]+myarr[5]+myarr[6]+myarr[7]+myarr[8]+myarr[9])
        }
    // console.log(myarr)
    return 'na'
    }
    console.log(tottal())
    const newOrder = new Orders({
      user:req.user,
      userId:id,
      country:order.country,
      fullname:order.fullname,
      phonenumber:order.phonenumber,
      address:order.address,
      city:order.city,
      cart:cart,
      tottal:`${tottal()}`
    })
  console.log(newOrder)
   await newOrder.save()
    res.redirect("/paymentform/credit")
 })
 



amazone.delete("/cart",async(req,res)=>{
    const {cart}= req.body
    const {id} = cart
    await Cart.findByIdAndDelete(id)
    res.redirect("/cart")
})

amazone.post("/:id",async(req,res)=>{
    const {id} =req.params

    const cart =  await Products.findById(id)
                           
   
    const carts = new Cart({
        sec_id: cart._id,
        title: cart.title,
          des: cart.des,
          price:cart.price,
          image:cart.image,
          category:cart.category,
          item:  cart.position
          
    })
    await carts.save()

    // req.flash("success","One product added to your Cart")
    res.redirect("/cart")
})

//  post pay now
// amazone.post("/:id",async(req,res)=>{
//   const {id} =req.params

//   const cart =  await Products.findById(id)
                         
 
//   const carts = new Cart({
//       sec_id: cart._id,
//       title: cart.title,
//         des: cart.des,
//         price:cart.price,
//         image:cart.image,
//         category:cart.category,
//         item:  cart.position
        
//   })
//   await carts.save()

//   // req.flash("success","One product added to your Cart")
//   res.redirect("/cart")
// })
          
//  weird-stuff





amazone.listen(port,()=>{
    console.log(`serving on port ${port}`)
})