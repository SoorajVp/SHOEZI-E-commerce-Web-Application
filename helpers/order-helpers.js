const { ObjectId } = require("mongodb-legacy");
var collection = require("../config/collection");
var db = require("../config/connection");
const Razorpay = require('razorpay');
const crypto = require('crypto');
// const { default: items } = require("razorpay/dist/types/items");
var instance = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID, 
   key_secret: process.env.RAZORPAY_KEY_SECRET 
})

module.exports = {

  placeOrder : async(order, products) =>{
    return new Promise(async(resolve, reject) => {
      if(order.couponCode){
        console.log("coupon exists ")

         db.get().collection(collection.COUPON_COLLECTIONS).updateOne({code: order.couponCode}, 
          { 
            $push: {
              users: new ObjectId(order.userId) 
            } 
          })
          .then(()=>{})

      }else{
        console.log("coupon not exists ")
      }
      console.log("this is ordered price :---------------");
      console.log("this is ordered price :---------------",order);
      
      order.total = parseInt(order.total.replace(/[^\d.-]/g, ''));
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
      
      let status = order.payment == 'COD'?'PLACED':'PENDING'
      let orderObj = {
        deliveryDetails:{
          name: UserDetails[0].address.name,
          mobile: UserDetails[0].address.mobile,
          address: UserDetails[0].address.address,
          city: UserDetails[0].address.city,
          district: UserDetails[0].address.district,
          pincode: Number(UserDetails[0].address.pincode)
        },
        userId: new ObjectId(order.userId),
        paymentMethod: order.payment,
        products: products,
        status: status,
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        total: Number(order.total),
        createdOn: new Date()
      }
      console.log("this order Object===",orderObj)
      await db.get().collection(collection.ORDER_COLLECTIONS).insertOne(orderObj)
      .then((response) => {
        response.status = orderObj.paymentMethod;
        db.get().collection(collection.CART_COLLECTIONS).deleteOne({user: new ObjectId(order.userId)}).then(()=>{
          resolve(response);
        })
       
      })
    })
  },

  getOrderCartProducts : (userId) =>{
    return new Promise(async(resolve, reject) =>{
      let cart = await db.get().collection(collection.CART_COLLECTIONS).findOne({user: new ObjectId(userId)});
      resolve(cart.products);
    })
  },

  
  generateRazorpay : (orderId, total) =>{
    total = parseInt(total);
    return new Promise((resolve, reject) =>{
      const options = {
        amount: total*100,
        currency: "INR",
        receipt: orderId,
        notes: {
          key1: "value3",
          key2: "value2"
        }
      };
      instance.orders.create(options, function(err, order) {
        console.log("NEW order",order);
        resolve(order)
      });
    })
  },

  
  verifyOrderPayment : (details) =>{
    return new Promise((resolve, reject) =>{
      console.log("this function is reached--------------------");
      let hmac = crypto.createHmac('sha256', 'TjTh7QEfolm1HOt4AG4hjemH') //createHmac('sha256', 'TjTh7QEfolm1HOt4AG4hjemH');
      hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
      hmac = hmac.digest('hex');
      console.log(hmac)
      console.log(details['payment[razorpay_signature]'])
      if(hmac === details['payment[razorpay_signature]']){
        console.log("condition truewwwww");
        resolve();
      }else{
        console.log("condition falseeee");
        reject()
      }
    })
  },

  ordersList : () =>{
    return new Promise(async(resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTIONS).find().sort({ createdOn: -1 }).toArray();
      resolve(orders);
    })
  },

  getUserOrder : (orderId) =>{
    return new Promise(async(resolve, reject) =>{
      await db.get().collection(collection.ORDER_COLLECTIONS).findOne({_id: new ObjectId(orderId)}).then((response)=>{
        resolve(response);
      })
      
    })
  },

  
  myOrderList : (userId) =>{
    return new Promise(async(resolve, reject) =>{
      let orderList = await db.get().collection(collection.ORDER_COLLECTIONS).find({userId: new ObjectId(userId)}).sort({ createdOn: -1 }).toArray();
      resolve(orderList);
    })
  },

  changeOrderStatus : (orderId, orderStatus) =>{
    return new Promise((resolve, reject) =>{
      console.log("this is order status changing", orderId, orderStatus)
      db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id: new ObjectId(orderId)},{$set: {status: orderStatus}})
      .then((response) =>{
        console.log("changed status-----",response)
        resolve(response);
      })
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
    },

    dailySales : async(today)=>{
        return new Promise(async (resolve, reject) => {
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          let orders = await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
            {
                $match:{
                    $and: [
                      { createdOn: { $gte: startOfDay, $lt: endOfDay }},
                      { status: 'DELIVERED' }
                    ]
                }
            },{
                $group: {
                    _id: null,
                    total: { $sum: '$total' }
                  }
            }
          ]).toArray()

          if(orders[0]){
            console.log(orders[0].total);
            resolve(orders[0].total);
          }else{
            resolve(0);
          }
        }) 
      },

      weeklySales : async(today)=>{
        return new Promise(async (resolve, reject) => {
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()-7);
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          let orders = await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
            {
                $match:{
                    $and: [
                      { createdOn: { $gte: startOfDay, $lt: endOfDay }},
                      { status: 'DELIVERED' }
                    ]
                }
            },{
                $group: {
                    _id: null,
                    total: { $sum: '$total' }
                  }
            }
          ]).toArray()
          if(orders[0]){
            console.log(orders[0].total);
            resolve(orders[0].total);
          }else{
            resolve(0);
          }
        }) 
      },

      monthlySales : async(today)=>{
        return new Promise(async (resolve, reject) => {
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          let orders = await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
            {
                $match:{
                    $and: [
                      { createdOn: { $gte: startOfMonth, $lt: endOfMonth }},
                      { status: 'DELIVERED' }
                    ]
                }
            },{
                $group: {
                    _id: null,
                    total: { $sum: '$total' }
                  }
            }
          ]).toArray()
          if(orders[0]){
            console.log(orders[0].total);
            resolve(orders[0].total);
          }else{
            resolve(0);
          }
        
        }) 
      },


    getTotalMoney : () =>{
        return new Promise(async(resolve, reject) =>{
          let money = await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
            {
                $match:{
                    status: "DELIVERED"
                }
            },{
                $group: { 
                  _id: null,
                  total: {
                     $sum: "$total" 
                    } 
                  }
            }
          ]).toArray()
          console.log("price",money[0].total);
          resolve(money[0].total);
        })
    },
    
      getTotalUsers: () =>{
        return new Promise(async(resolve, reject) =>{
          const count = await db.get().collection(collection.USER_COLLECTIONS).countDocuments();
          console.log("users",count);
          resolve(count);
        })
      },

      getTotalOrders: () =>{
        return new Promise(async(resolve, reject) =>{
          const count = await db.get().collection(collection.ORDER_COLLECTIONS).countDocuments();
          console.log("orders",count);
          resolve(count);
        })
      },

      deliveredOrders : () =>{
        return new Promise(async(resolve,  reject) =>{
          let orders = await db.get().collection(collection.ORDER_COLLECTIONS).find({status: 'DELIVERED'}).sort({ createdOn: -1 }).toArray()
          console.log("delivered products----",orders)
          for(let i=0; i<orders.length; i++){
            orders[i].items = orders[i].products.length;
          }
          // orders.items = orders.products.length
          resolve(orders);
        })
      },

      filterReport : (start, end) =>{
    
        return new Promise(async(resolve, reject) =>{
          const startDate = new Date(start);
          const endDate = new Date(end);
          console.log(startDate, endDate)
    
          let orders = await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
            {
              $match: {
                createdOn: {
                  $gte: startDate,
                  $lte: endDate
                }
              }
            },{
              $match: {
                status: 'DELIVERED'
              }
            }
          ]).sort({ createdOn: -1 }).toArray()
    
          console.log("this is filtered order ---", orders);
          resolve(orders)
        })
      },
    


}