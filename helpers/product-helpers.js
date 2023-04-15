const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectId } = require('mongodb-legacy');
// const async = require('hbs/lib/async');
// const { response } = require('express');

module.exports = {

    addProducts : (products, callback) =>{
        console.log(products.url);
        products.category = new ObjectId(products.category);
        products.quantity = Number(products.quantity);
        products.listed = true;
        products.price = Number(products.price);
        products.offer = Number(products.discount);
        products.discount = (products.discount / 100) * products.price;
        products.total = products.price - products.discount;

        console.log(products);
        
        db.get().collection(collection.PRODUCT_COLLECTIONS).insertOne(products).then((data) =>{
           callback(data.insertedId);
        })
    },

    addProductImg : (prodId, imgUrls) =>{
        db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id: prodId},
            {
                $set: {image:imgUrls}
            });
    },
  
    getAllProducts : () =>{
        return new Promise(async(resolve, reject) =>{

            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([{
                $lookup:{
                    from: collection.CATEGORY_COLLECTIONS,
                    localField: "category",
                    foreignField: "_id",
                    as: "proDetails"
                  }
                }
                ,{
                    $unwind: {
                        path: '$proDetails'
                    }
                }
            ]).toArray();
                console.log(products)
                resolve(products);
            })
    },

    getShopItems : (category) =>{
        return new Promise(async(resolve, reject) =>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([{
                $lookup:{
                    from: collection.CATEGORY_COLLECTIONS,
                    localField: "category",
                    foreignField: "_id",
                    as: "proDetails"
                  }
                },{
                    $unwind: {
                        path: '$proDetails'
                    }
                },{
                    $match:{
                      'proDetails.main': category
                    }
                }

            ]).toArray();
            resolve(products);
        })
    },

    getShopItemsSub : (catId) => {
        return new Promise(async(resolve, reject) =>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([
               {
                $match: { category: new ObjectId(catId) }
               }
            ]).toArray();
            resolve(products);
        })
    },

    getProductsLowToHigh : (category) =>{
        return new Promise(async(resolve, reject) =>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([{
                $lookup:{
                    from: collection.CATEGORY_COLLECTIONS,
                    localField: "category",
                    foreignField: "_id",
                    as: "proDetails"
                  }
                },{
                    $unwind: {
                        path: '$proDetails'
                    }
                },{
                    $match:{
                      'proDetails.main': category
                    }
                },{ 
                    $sort: { total: 1 } 
                }
            ]).toArray();
            resolve(products)
        })
    },

    getProductsHighToLow : (category) =>{
        return new Promise(async(resolve, reject) =>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([{
                $lookup:{
                    from: collection.CATEGORY_COLLECTIONS,
                    localField: "category",
                    foreignField: "_id",
                    as: "proDetails"
                  }
                },{
                    $unwind: {
                        path: '$proDetails'
                    }
                },{
                    $match:{
                      'proDetails.main': category
                    }
                },{ 
                    $sort: { total: -1 } 
                }
            ]).toArray();
            resolve(products)
        })
    },



    getProductDetails : (prodId) =>{
        return new Promise ((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({url: prodId}).then((product) =>{
                resolve(product);
            })
        })
    },

    updateProduct : (product,prodId) =>{
        product.price = Number(product.price);
        product.quantity = Number(product.quantity);
        product.category = new ObjectId(product.category);
        product.listed = true;
        product.offer = Number(product.discount);
        product.discount = (product.discount / 100) * product.price;
        product.total = product.price - product.discount;
        console.log(product.url)

        return new Promise( async(resolve, reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id: new ObjectId(prodId)},{
                $set:{
                    url: product.url,
                    name: product.name,
                    category: product.category,
                    brand : product.brand,
                    description: product.description,
                    quantity: product.quantity,
                    price: product.price,
                    offer: product.offer,
                    discount: product.discount,
                    total: product.total
                }
            })
        })
    },

    updateImage : (prodId, imgUrls) =>{
        db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id: new ObjectId(prodId)},
            {
                $set:{image: imgUrls}
            })
    },

    categoryService : (categoryId) =>{
        return new Promise(async(resolve, reject) =>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([
            {
                $match :{
                    category: new ObjectId(categoryId)
                }
            }]).toArray();
            console.log(products);
            resolve(products);
        })
    },

    decrementQuantity : (products) =>{
        console.log("this is products from decrement quuantity  foreach ----------", products.item)
        return new Promise((resolve, reject) =>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne(
                { _id: products.item },
                { $inc: { quantity : -products.quantity } }
            )
        })
    },

    filterProductsMain : (low, high, category) =>{
        low = Number(low)
        high = Number(high)
        console.log("this is console from filter -----", low, high, category);
        return new Promise(async(resolve, reject) =>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([{
                $lookup:{
                    from: collection.CATEGORY_COLLECTIONS,
                    localField: "category",
                    foreignField: "_id",
                    as: "proDetails"
                  }
                },{
                    $unwind: {
                        path: '$proDetails'
                    }
                },{
                    $match: {
                      'proDetails.main': category
                    }
                  },{
                    $match:{
                       total:{$lte:high,$gte:low}
                    }
                }
            ]).toArray();
        console.log("this is console from filter -----", products);

            resolve(products)
        })
    },

    filterProductsSub : (low, high, category) => {
        low = Number(low)
        high = Number(high)
        console.log("this is console from filter -----", low, high);
        return new Promise(async(resolve, reject) =>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([
               {
                $match: { 
                    category: new ObjectId(category),
                }
               },
               {
                $match: {
                   total:{ $lte: high, $gte: low }
                }
               }
            ]).toArray();
            console.log("this is products from filtered page-----------------------", products);

            resolve(products);
        })
    },

    searchProducts : (key) =>{
        return new Promise(async(resolve, reject) =>{
            let Data = await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([
                {
                  '$lookup': {
                    'from': 'category', 
                    'localField': 'category', 
                    'foreignField': '_id', 
                    'as': 'result'
                  }
                }, {
                  '$unwind': {
                    'path': '$result'
                  }
                },
                {
                  $match: {
                    // 'name': { $regex: new RegExp(key, 'i') } 
                    $or: [
                      { name: { $regex: new RegExp(key, 'i') } },
                      { 'result.main': { $regex: new RegExp(key, 'i') } },
                      { 'result.sub': { $regex: new RegExp(key, 'i') } }
                    ]
                  }
                }
              ]).toArray();
            console.log("this is search result ------" , Data);
            resolve(Data)
              
        })
    }
   
    

    
}