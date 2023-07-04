var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { ObjectId, Db } = require("mongodb-legacy");
const Razorpay = require('razorpay');
const crypto = require('crypto');
const productHelpers = require("./product-helpers");





module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.status = Boolean(userData.status);
      userData.mobile = Number(userData.mobile);
      let email = await db.get().collection(collection.USER_COLLECTIONS).aggregate([
        { $match: {  email: userData.email  }}
      ]).toArray();
      let mobile = await db.get().collection(collection.USER_COLLECTIONS).aggregate([
        { $match: {  mobile: { $eq: userData.mobile }  }}
      ]).toArray();
      
      if(email.length > 0){
        resolve({status: false, message: "This is email is already taken !"})
      }else{
        if(mobile.length > 0){
          resolve({status: false, message: "This is Mobile is already registered !"})
        }else{
          userData.password1 = await bcrypt.hash(userData.password1, 10);
          db.get().collection(collection.USER_COLLECTIONS).insertOne(userData).then((data) => {
            resolve({status: true, userData});
          });
        }
      }
      
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({ email: userData.email });
      if (user) {
        if (user.status) {
          response.unblocked = true;
          bcrypt.compare(userData.password1, user.password1).then((status) => {
            if (status) {
              console.log("Login success...");
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              console.log("Login Failed...");
              resolve({ status: false });
            }
          });
        }else{
            console.log("Blocked user....");
            response.unblocked = false;
            resolve({ status: true,response });
        }
      } else {
        console.log("Login Failed...");
        resolve({ status: false });
      }
    });
  },

  findUser : (userId) =>{
    return new Promise(async(resolve, reject) =>{
      let user =  await db.get().collection(collection.USER_COLLECTIONS).findOne({_id: new ObjectId(userId)})
        resolve(user);
    })
  },

  updateUserData : (userId, userData) =>{
    return new Promise((resolve, reject) =>{
      db.get().collection(collection.USER_COLLECTIONS).updateOne({_id: new ObjectId(userId)},
      {
        $set: {
          Username: userData.Username,
          gender: userData.gender
        }
      }).then((response) =>{
        resolve();
      })
    })
  },

  updateAddress : (addressData, userId) =>{
    return new Promise((resolve, reject) =>{
    addressData._id = new ObjectId();
      db.get().collection(collection.USER_COLLECTIONS).updateOne({_id: new ObjectId(userId)}, 
      {
        $push: {
          address: addressData
        }
      }).then((response) =>{
       resolve(response);
     })
    })
  },

  editAddress : (addressData, addressId, userId) =>{
    return new Promise(async(resolve, reject) =>{
      await db.get().collection(collection.USER_COLLECTIONS).updateOne({
        _id:new ObjectId(userId),
        address: {$elemMatch:{_id: new ObjectId(addressId)}}
          },
          {
              $set:{
                  'address.$.name' : addressData.name,
                  'address.$.email' : addressData.email,
                  'address.$.address' : addressData.address,
                  'address.$.district' : addressData.district,
                  'address.$.city' : addressData.city,
                  'address.$.pincode' : addressData.pincode,
                  'address.$.mobile' : addressData.mobile
              }
          }).then((response)=>{
              resolve(response);
          })

    })
  },

  varifyPassword : (userId, userData) =>{
    return new Promise(async(resolve, reject) =>{
      let response ={};
      let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({_id: new ObjectId(userId)});
      bcrypt.compare(userData.password, user.password1).then((status) =>{
        if(status){
          response.status = true;
          resolve(response);
        }else{
          resolve({status: false});
        }
      })
    })
  },

  changePassword : (userId, userData)=>{
    return new Promise(async (resolve, reject) =>{
      userData.password1 = await bcrypt.hash(userData.password1, 10);
      db.get().collection(collection.USER_COLLECTIONS).updateOne({_id: new ObjectId(userId)},
      {
        $set: {
          password1: userData.password1
        }}).then((response) =>{
          resolve(response);
        })
    })
  },

  checkMobile : (Mobile) =>{
    return new Promise(async (resolve, reject) =>{
      Mobile = Mobile.replace("+91", "");
      Mobile = Number(Mobile);
      let response = {}
      let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({mobile: Mobile});
      if(user){
        response.user = user;
        response.status = true;
        resolve(response);
      }else{
        response.status = false;
        resolve(response);
      }
    })
  },

  getUserMobiledetails : (Mobile) =>{
    return new Promise(async (resolve, reject) =>{
      Mobile = Number(Mobile);
      let response = {}
      let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({mobile: Mobile});
      response.user = user;
      response.status = true;
      resolve(response);
      
    })
  },


  updateCart : (proId, userId) =>{
    let proObj = {
      item: new ObjectId(proId),
      quantity: 1
    }
    return new Promise(async(resolve, reject) =>{
      let product = await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id: new ObjectId(proId)})
      let userCart = await db.get().collection(collection.CART_COLLECTIONS).findOne({user: new ObjectId(userId)});
      
      if(userCart){
        let proExist = userCart.products.findIndex(product => product.item == proId);
        if(proExist != -1){

          let cart = await db.get().collection(collection.CART_COLLECTIONS).aggregate([
            {
              '$match': {
                user: new ObjectId(userId)
              }
            }, {
              '$unwind': {
                'path': '$products'
              }
            }, {
              '$match': {
                'products.item': new ObjectId(proId)
              }
            }
          ]).toArray();

          if((product.quantity - (cart[0].products.quantity + 1)) >= 0){

            db.get().collection(collection.CART_COLLECTIONS).updateOne({ user:new ObjectId(userId),
              'products.item': new ObjectId(proId)},
            {
              $inc: {'products.$.quantity': 1}
            })
            .then(() =>{
              resolve({status: true})
            })

          }else{
            resolve({status: false})
          }

        }else{
          db.get().collection(collection.CART_COLLECTIONS).updateOne({user: new ObjectId(userId)},
          {
            $push: {products: proObj}
          })
          .then(() =>{
            resolve({status: true});
          })
        } 

      }else{
        let cartObj = {
          user: new ObjectId(userId),
          products: [proObj]
        }
        db.get().collection(collection.CART_COLLECTIONS).insertOne(cartObj).then((response) =>{
          resolve({status: true});
        })
      }
    })
  },

  getCartproducts : (userId) =>{
    return new Promise(async(resolve, reject) => {
      let cartItems = await db.get().collection(collection.CART_COLLECTIONS).aggregate([
        {
          $match: {user: new ObjectId(userId)}
        },{
          $unwind: '$products'
        },{
          $project:{
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },{
          $lookup:{
            from: collection.PRODUCT_COLLECTIONS,
            localField: 'item',
            foreignField: '_id',
            as: 'productDetails'
          }
        },{
          $project: {
            item: 1, quantity: 1,
            productDetails:{
              $arrayElemAt: ['$productDetails', 0]
            }
          }
        },{
          $addFields: {
            'productDetails.subTotal': { $multiply: ["$productDetails.total", "$quantity"] }
          }
        }
      ])
      .toArray();
      resolve(cartItems);
    })
  },


  getCartCount : (userId) => {
    return new Promise (async(resolve, reject) =>{
      let count = 0;
      let cart = await db.get().collection(collection.CART_COLLECTIONS).findOne({user: new ObjectId(userId)});
      if(cart){
        count = cart.products.length;
      }
      resolve(count);
    })
  },

  changeProductQuantity : (details) =>{
    return new Promise(async(resolve, reject) =>{
      details.count = parseInt(details.count);
      details.quantity = parseInt(details.quantity);
      let product = await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id: new ObjectId(details.product)});

      if(details.count == -1 && details.quantity == 1){
          
        db.get().collection(collection.CART_COLLECTIONS).updateOne({_id: new ObjectId(details.cart)},
        {
          $pull: {products: {item: new ObjectId(details.product)}}
        }).then((response) =>{
          resolve({removeProduct: true})
        })

      }else{

          let cart = await db.get().collection(collection.CART_COLLECTIONS).aggregate([
            {
              '$match': {
                '_id': new ObjectId(details.cart)
              }
            }, {
              '$unwind': {
                'path': '$products'
              }
            }, {
              '$match': {
                'products.item': new ObjectId(details.product)
              }
            }
        ]).toArray()

        if((product.quantity - (cart[0].products.quantity + details.count)) >= 0){

          db.get().collection(collection.CART_COLLECTIONS).updateOne({_id: new ObjectId(details.cart),
            'products.item':new ObjectId(details.product)},
            {
                $inc:{'products.$.quantity': details.count}
            })
            .then(async()=>{
              resolve({status: true})
            })
          
        }else{
          resolve({status: false});
        }
        
      }
    })
  },

  removeCart : (details) =>{
    try {
      return new Promise((resolve, reject) =>{
        db.get().collection(collection.CART_COLLECTIONS).updateOne({_id:new ObjectId(details.cart),
          'products.item':new ObjectId(details.product)},
          {
            $pull: {products: {item: new ObjectId(details.product)}}
          })
          .then((response) =>{
            resolve({removeProduct: true})
          })
      })
    } catch (error) {
      console.log(error)
    }
    
  },

  getTotalAmount : (userId) =>{
    return new Promise(async(resolve, reject) => {
      let cartTotal = await db.get().collection(collection.CART_COLLECTIONS).aggregate([
        {
          $match: {user: new ObjectId(userId)}
        },{
          $unwind: '$products'
        },{
          $project:{
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },{
          $lookup:{
            from: collection.PRODUCT_COLLECTIONS,
            localField: 'item',
            foreignField: '_id',
            as: 'productDetails'
          }
        },{
          $project: {
            item: 1, quantity: 1,
            productDetails:{
              $arrayElemAt: ['$productDetails', 0]
            }
          }
        },{
          $group:{
            _id: null,
            total: {$sum: {$multiply: ['$quantity','$productDetails.total']}}
          }
          
        }
      ]).toArray();
      try{
        resolve(cartTotal[0].total);
      }catch(err){
        resolve(err);
      }
    })
  },

  AddressDelete : (addressId, userId) =>{
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTIONS).updateOne({_id:new ObjectId(userId)},
      {
        $pull:{
          address: {
            _id: new ObjectId(addressId)
          }
        }
      })
      .then((response) =>{
        resolve();
      })
    })
  },

  addWishList : (proId, userId) =>{
    return new Promise(async(resolve, reject) =>{
      let wishlist = await db.get().collection(collection.WISHLIST_COLLECTIONS).findOne({user: new ObjectId(userId)});
      
      let prodExist = await db.get().collection(collection.WISHLIST_COLLECTIONS).findOne({user: new ObjectId(userId),
        products: { $in: [new ObjectId(proId)]}
      });
         
      if(wishlist){

        if(prodExist){
            db.get().collection(collection.WISHLIST_COLLECTIONS).updateOne({user: new ObjectId(userId)},{
              $pull: {
                products: new ObjectId(proId) 
              }
            })
            resolve({status: false});
        }else{
          db.get().collection(collection.WISHLIST_COLLECTIONS).updateOne({user: new ObjectId(userId)},{
            $push: {
              products: new ObjectId(proId) 
            }
          }).then((response)=>{
            resolve({status: true})
          })
        }
      }else{
        let wishlistObj = {
          user: new ObjectId(userId),
          products: [new ObjectId(proId)]
        }
        db.get().collection(collection.WISHLIST_COLLECTIONS).insertOne(wishlistObj).then((response) =>{
          resolve({status: true})
        })
      }
    })
  },

  getWishListItems : (userId) =>{
    return new Promise(async(resolve, reject) =>{
      let WishlistItems = await db.get().collection(collection.WISHLIST_COLLECTIONS).aggregate(
        [
          {
            '$match': {
              'user': new ObjectId(userId)
            }
          }, {
            '$unwind': {
              'path': '$products'
            }
          }, {
            '$lookup': {
              'from': 'products', 
              'localField': 'products', 
              'foreignField': '_id', 
              'as': 'result'
            }
          }, {
            '$project': {
              'result': 1, 
              '_id': 0
            }
          }
        ]
    ).toArray();
    resolve(WishlistItems);
    })
  },

  
 

};


