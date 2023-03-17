const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectId } = require('mongodb-legacy');
// const { response } = require('express');

module.exports = {

    addProducts : (products, callback) =>{
        console.log(products.category);
        console.log("#$%^&*IUTREERTI",new ObjectId(products.category));
        products.category = new ObjectId(products.category);
        products.price = Number(products.price);
        products.listed = true;
        console.log(products);
        
        db.get().collection(collection.PRODUCT_COLLECTIONS).insertOne(products).then((data) =>{
            console.log("inserted   idddddd................",data.insertedId);
           callback(data.insertedId);
        })
    },

    addProductImg : (prodId, imgUrls) =>{
        console.log("product id .............................",prodId);
        db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id: prodId},
            {
                $set: {image:imgUrls}
            });
    },
  
    getAllProducts : () =>{
        return new Promise(async(resolve, reject) =>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray();
            resolve(products);
        })
    },

    getProductDetails : (prodId) =>{
        console.log(prodId);
        return new Promise ((resolve, reject) => {
            console.log(prodId);
            db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id: new ObjectId(prodId)}).then((product) =>{
                console.log(product)
                resolve(product);
            })
        })
    },

    updateProduct : (product,prodId) =>{
        console.log("update product visited .......", product);
        product.price = Number(product.price);
        console.log("update product object id......,,,,,", new ObjectId(product.category));
        product.category = new ObjectId(product.category);
        product.listed = true;

        return new Promise( async(resolve, reject)=>{
            console.log("update promise visited .......",prodId);
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
        console.log("Update product id ..............",prodId);
        db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id: new ObjectId(prodId)},
            {
                $set:{image: imgUrls}
            })
    }
    

    
}