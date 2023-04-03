const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectId } = require('mongodb-legacy');
const async = require('hbs/lib/async');
// const { response } = require('express');

module.exports = {

    addProducts : (products, callback) =>{
        console.log(products.category);
        products.category = new ObjectId(products.category);
        products.subcategory = new ObjectId(products.subcategory);
        products.price = Number(products.price);
        products.listed = true;
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
            console.log("%%%%---------------------");
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
                }
                ,{
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
                $match: {
                    category: new ObjectId(catId)
                }
               }

            ]).toArray();
            // console.log(products)
            resolve(products);
        })
    },

    getProductDetails : (prodId) =>{
        return new Promise ((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id: new ObjectId(prodId)}).then((product) =>{
                resolve(product);
            })
        })
    },

    updateProduct : (product,prodId) =>{
        product.price = Number(product.price);
        product.category = new ObjectId(product.category);
        product.listed = true;
        console.log(product)
        return new Promise( async(resolve, reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id: new ObjectId(prodId)},{
                $set:{
                    name: product.name,
                    category: product.category,
                    brand : product.brand,
                    description: product.description,
                    price: product.price,
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

    getOrderedProducts : (orderId) =>{
        return new Promise(async(resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
                {
                    $match: {
                        _id: new ObjectId(orderId)
                    }
                },{
                    $unwind:"$products"
                },{
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },{
                    $lookup: {
                        from: collection.PRODUCT_COLLECTIONS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },{
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product',0]
                        }
                    }
                }
            ]).toArray();
            resolve(orderItems);
        })
    }
    

    
}