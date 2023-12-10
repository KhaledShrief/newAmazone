const Products = require("../models/Products")
const mongoose = require("mongoose")
const dbUrl =   'mongodb://127.0.0.1:27017/amazone'
const {categorysArray,titleArray,imagesArray} = require("./seedsHelper")
const{search_results_beauty}= require("./openApiBeauty")
const{search_results_Electronics}= require("./openApiElectronics")
const{search_results_topJacts}= require("./openApiFashonTopJacts")
const{search_results_pants}= require("./openApiFashonPants")
const{search_results_toys}= require("./openApiToys")

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

const SeedDb = async()=>{
  await Products.deleteMany({})
  const sample = (array)=> array[Math.floor(Math.random()*array.length)];
  
  for(let i = 0; i<25; i++){
    p = Math.floor(Math.random()*500)+1000
    const productsBeauty = new Products({
      position: `${sample(search_results_beauty).position}`,
        title: `${sample(search_results_beauty).title}`,
        des: `${sample(search_results_beauty).title}`,
        price:sample(search_results_beauty).price.value,
        image:`${sample(search_results_beauty).image}`,
        category:`${sample(search_results_beauty).categories[0].name}`

    })
    const productsElectronics = new Products({
      position: `${sample(search_results_Electronics).position}`,
      title: `${sample(search_results_Electronics).title}`,
        des: `${sample(search_results_Electronics).title}`,
        price:p,
        image:`${sample(search_results_Electronics).image}`,
        category:`${sample(search_results_Electronics).categories[0].name}`
    })
    const productstopJacts = new Products({
      position: `${sample(search_results_topJacts).position}`,
      title: `${sample(search_results_topJacts).title}`,
        des: `${sample(search_results_topJacts).title}`,
        price:sample(search_results_topJacts).price.value,
        image:`${sample(search_results_topJacts).image}`,
        category:`${sample(search_results_topJacts).categories[0].name}`
    })
    const productsPants = new Products({
      position: `${sample(search_results_pants).position}`,
      title: `${sample(search_results_pants).title}`,
        des: `${sample(search_results_pants).title}`,
        price:sample(search_results_pants).price.value,
        image:`${sample(search_results_pants).image}`,
        category:`${sample(search_results_pants).categories[0].name}`
    })
    const productsToys = new Products({
      position: `${sample(search_results_toys).position}`,
      title: `${sample(search_results_toys).title}`,
        des: `${sample(search_results_toys).title}`,
        price:sample(search_results_toys).price.value,
        image:`${sample(search_results_toys).image}`,
        category:`${sample(search_results_toys).categories[0].name}`
    })
    // console.log(productsBeauty,productsElectronics,productstopJacts,productsPants,productsToys)
    await productsBeauty.save()
    await productsElectronics.save()
    await productsToys.save()
    await productsPants.save()
    await productstopJacts.save()
  }

}
SeedDb();