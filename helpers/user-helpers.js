var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { ObjectId, Db } = require("mongodb-legacy");

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.status = Boolean(userData.status);
      userData.mobile = Number(userData.mobile);

      userData.password1 = await bcrypt.hash(userData.password1, 10);
      console.log("UserData ....................",userData);

      db.get()
        .collection(collection.USER_COLLECTIONS).insertOne(userData)
        .then((data) => {
          console.log(data.insertedId);
          resolve(userData);
        });
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      // let status = false;
      let response = {};
      let user = await db.get().collection(collection.USER_COLLECTIONS)
        .findOne({ email: userData.email });

      if (user) {
        if (user.status) {

          console.log("User found");
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
    console.log("this is find users userId ", userId);
    return new Promise(async(resolve, reject) =>{
      let user =  await db.get().collection(collection.USER_COLLECTIONS).findOne({_id: new ObjectId(userId)})
        resolve(user);
    })
  },

  updateUserData : (userId, userData) =>{
    return new Promise((resolve, reject) =>{

      userData.mobile = Number(userData.mobile);
      console.log(userData.email);
      db.get().collection(collection.USER_COLLECTIONS).updateOne({_id: new ObjectId(userId)},
      {
        $set: {
          Username: userData.Username,
          email: userData.email,
          mobile: userData.mobile,
          gender: userData.gender
        }
      }).then((response) =>{
        console.log("Personal data updated............");
        resolve();
      })
    })
  },

  updateAddress : (addressData, userId) =>{
    return new Promise((resolve, reject) =>{
    addressData._id = new ObjectId();
    console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkk")
    console.log("this is object id ", addressData._id)
      db.get().collection(collection.USER_COLLECTIONS).updateOne({_id: new ObjectId(userId)}, {
        $push: {
          address: addressData
        }
      }).then((response) =>{
       resolve(response);
     })
    })
  },

  varifyPassword : (userId, userData) =>{
    console.log("varify user id....", userId);
    return new Promise(async(resolve, reject) =>{
      let response ={};
      let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({_id: new ObjectId(userId)});
      console.log("Varify user found......", user);
      
      bcrypt.compare(userData.password, user.password1).then((status) =>{
        if(status){
          console.log("Correct Password....");
          response.status = true;
          resolve(response);
        }else{
          console.log("inCorrect Password....");
          resolve({status: false});
        }
      })
    })
  },

  changePassword : (userId, userData)=>{
    return new Promise(async (resolve, reject) =>{
      userData.password1 = await bcrypt.hash(userData.password1, 10);
      db.get().collection(collection.USER_COLLECTIONS).updateOne({_id: new ObjectId(userId)},{
        $set: {
          password1: userData.password1
        }}).then((response) =>{
          resolve(response);
        })
    })
  },

  checkMobile : (Mobile) =>{
    console.log("!@#$%^&*)(*&^%#", Mobile);
    return new Promise(async (resolve, reject) =>{
      Mobile = Number(Mobile);
      let response = {}
      let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({mobile: Mobile});
      console.log("!@#$%^&*)(*&^%#", user);
      if(user){
        response.user = user;
        response.status = true;
        resolve(response);
      }else{
        console.log("user not found.....");
        response.status = false;
        resolve(response);
      }
    })
  },


  updateCart : (proId, userId) =>{

    let proObj = {
      item: new ObjectId(proId),
      quantity: 1
    }

    return new Promise(async(resolve, reject) =>{
      let userCart = await db.get().collection(collection.CART_COLLECTIONS).findOne({user: new ObjectId(userId)});
      console.log("vvvvvvvvvvvvvvvvvvvvv", userCart);

      if(userCart){

        let proExist = userCart.products.findIndex(product => product.item == proId);
        console.log(proExist);
        if(proExist != -1){
          db.get().collection(collection.CART_COLLECTIONS)
          .updateOne({user:new ObjectId(userId),
            'products.item': new ObjectId(proId)},
          {
            $inc: {'products.$.quantity': 1}
          }).then(() =>{
            resolve()
          })
        }else{
          db.get().collection(collection.CART_COLLECTIONS)
          .updateOne({user: new ObjectId(userId)},
          {
            $push: {products: proObj}
          }).then((response) =>{
            resolve();
          })
        } 

      }else{
        let cartObj = {
          user: new ObjectId(userId),
          products: [proObj]
        }
        db.get().collection(collection.CART_COLLECTIONS).insertOne(cartObj).then((response) =>{
          resolve();
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
        }
      ]).toArray();
      console.log("kkkkkkkkkkkkkkkk", cartItems)
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
      console.log('mmmmmmmmmmmmmmmmmmmmmmmmmmmmcart', count);

      resolve(count);
    })
  },

  changeProductQuantity : (details) =>{
    return new Promise((resolve, reject) =>{
      details.count = parseInt(details.count);
      details.quantity = parseInt(details.quantity);
      console.log(details.cart, details.product,details.count);

      if(details.count == -1 && details.quantity == 1){

        db.get().collection(collection.CART_COLLECTIONS)
        .updateOne({_id: new ObjectId(details.cart)},
        {
          $pull: {products: {item: new ObjectId(details.product)}}
        }).then((response) =>{
          resolve({removeProduct: true})
        })

      }else{

        db.get().collection(collection.CART_COLLECTIONS)
          .updateOne({_id:new ObjectId(details.cart),
          'products.item':new ObjectId(details.product)},
          {
              $inc:{'products.$.quantity':details.count}
          }).then((response)=>{
              resolve({status: true});
          })

      }     
    })
  },

  removeCart : (details) =>{
    console.log("-----------------------------");
    console.log(details)
    return new Promise((resolve, reject) =>{
      db.get().collection(collection.CART_COLLECTIONS)
          .updateOne({_id:new ObjectId(details.cart),
            'products.item':new ObjectId(details.product)},
            {
              $pull: {products: {item: new ObjectId(details.product)}}
            }).then((response) =>{
              resolve({removeProduct: true})
            })
    })
  },

  getTotalAmount : (userId) =>{
    console.log("********", userId);
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
            total: {$sum: {$multiply: ['$quantity','$productDetails.price']}}
          }
          
        }
      ]).toArray();
      console.log(cartTotal[0].total);
      resolve(cartTotal[0].total);
    })
  },

  AddressDelete : (addressId, userId) =>{
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTIONS).updateOne({_id:new ObjectId(userId)},
      {$pull:{address: {_id: new ObjectId(addressId)}}})
      .then((response) =>{
        resolve();
      })
    })
  },

  getOrderProductList : (userId) =>{
    return new Promise(async(resolve, reject) =>{
      let cart = await db.get().collection(collection.CART_COLLECTIONS).findOne({user: new ObjectId(userId)});
      console.log(cart);
      resolve(cart.products);
    })
  },

  placeOrder : (order, products) =>{
    return new Promise(async(resolve, reject) => {
      console.log("SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS")
      console.log(order.userId, order.addressId);
      order.price = Number(order.price);
      let UserDetails = await db.get().collection(collection.USER_COLLECTIONS).aggregate([
        {
          $match:{
            _id: new ObjectId(order.userId)
          }
        },{
          $unwind:{
            path: "$address"
          }
        },{
          $match:{
            "address._id": new ObjectId(order.addressId)
          }
        }
      ]).toArray()
      
      let status = order['payment-method']=='COD'?'PLACED':'PENDING'
      let orderObj = {
        deliveryDetails:{
          name: UserDetails[0].address.name,
          mobile: UserDetails[0].address.mobile,
          address: UserDetails[0].address.address,
          city: UserDetails[0].address.city,
          district: UserDetails[0].address.district,
          pincode: UserDetails[0].address.pincode
        },
        userId: new ObjectId(order.userId),
        paymentMethod: order['payment-method'],
        products: products,
        status: status,
        price: order.price,
        createdOn: new Date()
      }
      console.log("_--------------------------")
      console.log(orderObj);
      db.get().collection(collection.ORDER_COLLECTIONS).insertOne(orderObj)
      .then((response) => {
        db.get().collection(collection.CART_COLLECTIONS).deleteOne({user: new ObjectId(order.userId)}).then(()=>{
          resolve(status);
        })
       
      })
    })
  },

  myOrderList : (userId) =>{
    return new Promise(async(resolve, reject) =>{
      let orderList = await db.get().collection(collection.ORDER_COLLECTIONS).find({userId: new ObjectId(userId)}).toArray();
      resolve(orderList);
    })
  },


  
 

};


