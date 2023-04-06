const { ObjectId } = require("mongodb-legacy");
var collection = require("../config/collection");
var db = require("../config/connection");

module.exports = {

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
          console.log(orders[0].total);
          resolve(orders[0].total)
        
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
          console.log(orders[0].total);
          resolve(orders[0].total)
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
          console.log(orders[0].total);
          resolve(orders[0].total)
        
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
    


}