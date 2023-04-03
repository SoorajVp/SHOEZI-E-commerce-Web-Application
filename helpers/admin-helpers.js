const { ObjectId } = require("mongodb-legacy");
var collection = require("../config/collection");
var db = require("../config/connection");
const { reject } = require("bcrypt/promises");
const async = require("hbs/lib/async");
// const { objectId } = require("mongodb-legacy").ObjectId;

module.exports = {

  getUserData: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db.get().collection(collection.USER_COLLECTIONS).find().toArray();
      resolve(users);
    });
  },

  blockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
        console.log(userId);
      db.get().collection(collection.USER_COLLECTIONS).updateOne({_id:new ObjectId(userId)},{ $set: { status: false } })
        .then((response) => {
          resolve(response);
          console.log(response);
        });
    });
  },

  unblockUser: (userId) =>{
    return new Promise(async(resolve, reject) =>{
        db.get().collection(collection.USER_COLLECTIONS)
        .updateOne({_id: new ObjectId(userId)},{$set:{status: true}})
        .then((response) =>{
            resolve(response);
        }) 
    })
  },

  UnlistProduct : (prodId) =>{
    return new Promise (async (resolve, reject) =>{
      db.get().collection(collection.PRODUCT_COLLECTIONS)
      .updateOne({_id: new ObjectId(prodId)},{$set: {listed: false}})
      .then((response) =>{
        resolve(response);
      })
    })
  },

  listProduct : (prodId) =>{
    return new Promise( async (resolve, reject) =>{
      db.get().collection(collection.PRODUCT_COLLECTIONS)
      .updateOne({_id: new ObjectId(prodId)},{$set: {listed: true}})
      .then((response) =>{
        resolve(response);
      })
    })
  },

  addBanners : (banner, callback)=>{
    return new Promise((resolve, reject) =>{
      banner.status = true;
      db.get().collection(collection.BANNER_COLLECTIONS).insertOne(banner).then((data) =>{
          console.log("Banner   idddddd................",data.insertedId);
          callback(data.insertedId);
      })
    })
  },

  // addBannerImg : (banId, bannerUrl) =>{
  //   console.log("!@#$%^&*()_)(*&^%",banId, bannerUrl);
  //   return new Promise((resolve, reject) => {
  //     db.get().collection(collection.BANNER_COLLECTIONS).updateOne({_id: banId},{
  //       $set: {image: bannerUrl}
  //     })
  //   })
  // },

  getBanners : () =>{
    return new Promise(async(resolve, reject) =>{
      let banners = await db.get().collection(collection.BANNER_COLLECTIONS).find().toArray();
      resolve(banners);
    })
  },

  bannerUnlist : (banId) =>{
    return new Promise((resolve, reject) =>{
      db.get().collection(collection.BANNER_COLLECTIONS).updateOne({_id: new ObjectId(banId)},{$set: {status: false}}).then((response)=>{
        resolve();
      })
    })
  },

  bannerList : (banId) =>{
    return new Promise((resolve, reject) =>{
      db.get().collection(collection.BANNER_COLLECTIONS).updateOne({_id: new ObjectId(banId)},{$set: {status: true}}).then((response)=>{
        resolve();
      })
    })
  },

  getBannerDetails : (banId) =>{
    return new Promise((resolve, reject) =>{
      db.get().collection(collection.BANNER_COLLECTIONS).findOne({_id: new ObjectId(banId)}).then((response)=>{
        resolve(response);
      })
    })
  },

  updateBanner : (banId, banner) =>{
    return new Promise((resolve, reject) =>{
      console.log("helpers banners update id.....", banId);
      db.get().collection(collection.BANNER_COLLECTIONS).updateOne({_id: new ObjectId(banId)},
      {
        $set: {
          head: banner.head,
          text: banner.text
        }
      });
    })
  },

  updateBannerImg : (banId, bannerUrl) =>{
    return new Promise((resolve, reject) =>{
      db.get().collection(collection.BANNER_COLLECTIONS).updateOne({_id: new ObjectId(banId)},{
        $set: {image: bannerUrl}
      })
    })
  },

  getAllBanners : () =>{
    return new Promise(async(resolve, reject) =>{
      let banners = await db.get().collection(collection.BANNER_COLLECTIONS).find().toArray();
      resolve(banners);
    })
  },

  addCatergory : (category) =>{
    return new Promise(async(resolve, reject) => {
      console.log("))))))", category.main, category.sub)
      category.listed = true;
      let categoryExist = await db.get().collection(collection.CATEGORY_COLLECTIONS).findOne({main: category.main , sub: category.sub})
      if(categoryExist) {
        resolve({status: false})
      }else{
        db.get().collection(collection.CATEGORY_COLLECTIONS).insertOne(category).then((response) =>{
          resolve({status: true})
        })
      }
      
    })
  },

  getCategory : () =>{
    return new Promise(async(resolve,  reject) =>{
      // let category = await db.get().collection(collection.CATEGORY_COLLECTIONS).find().toArray();
      let category = await db.get().collection(collection.CATEGORY_COLLECTIONS).aggregate([
        {
          $lookup: {
            from: 'category',
            localField: 'category',
            foreignField: '_id',
            as: 'catList'
          }
        }
      ])
      console.log("this is categoory console ----",category)
      resolve(category);
    })
  },

  updateCategory : (catgoryId, categoryName) =>{
    return new Promise((resolve, reject) =>{
      db.get().collection(collection.CATEGORY_COLLECTIONS).updateOne({_id: new ObjectId(catgoryId)}, {$set: {name: categoryName}});
      resolve();
    })
  },

  listCategory : (categoryId) =>{
    return new Promise((resolve, reject) =>{
      db.get().collection(collection.CATEGORY_COLLECTIONS).updateOne({_id: new ObjectId(categoryId)},{$set: {listed: true}}).then((response)=>{
        resolve();
      })
    })
  },

  UnlistCategory : (categoryId) =>{
    return new Promise((resolve, reject) =>{
      db.get().collection(collection.CATEGORY_COLLECTIONS).updateOne({_id: new ObjectId(categoryId)},{$set: {listed: false}}).then((response)=>{
        resolve();
      })
    })
  },

  ordersList : () =>{
    return new Promise(async(resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTIONS).find().toArray();
      resolve(orders);
    })
  },

  changeOrderStatus : (orderId, status) =>{
    return new Promise((resolve, reject) =>{
      db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id: new ObjectId(orderId)},{$set: {status: status}})
      .then((response) =>{
        resolve(response);
      })
    })
  },

  getUserOrder : (orderId) =>{
    return new Promise(async(resolve, reject) =>{
      await db.get().collection(collection.ORDER_COLLECTIONS).findOne({_id: new ObjectId(orderId)}).then((response)=>{
        resolve(response);
      })
      
    })
  },

  getItemCategory : (category) =>{
    return new Promise(async(resolve, reject) =>{
      let catList1 = await db.get().collection(collection.CATEGORY_COLLECTIONS).find({main: category}).toArray();
      console.log(catList1);
      resolve(catList1);
    })
  },


  

  getAllCategory : () =>{
    return new Promise(async(resolve, reject) =>{

      let category = await db.get().collection(collection.CATEGORY_COLLECTIONS).find().toArray();

      // let category = await db.get().collection(collection.CATEGORY_COLLECTIONS).aggregate([
      //    {
      //     '$unwind': {
      //       'path': '$sub'
      //     }
      //   }, {
      //     '$lookup': {
      //       'from': 'subcategory', 
      //       'localField': 'sub', 
      //       'foreignField': '_id', 
      //       'as': 'subList'
      //     }
      //   }, {
      //     '$project': {
      //       'subList': 1, 
      //       'name': 1
      //     }
      //   }
      // ]).toArray();
      console.log(category)
      resolve(category)
    })
  },

  getMenCategory : () =>{
    return new Promise(async(resolve,  reject) =>{
      let mens = await db.get().collection(collection.CATEGORY_COLLECTIONS).find({main: 'MENS'}).toArray()
      resolve(mens);
    })
  },

  getWomenCategory : () =>{
    return new Promise(async(resolve,  reject) =>{
      let women = await db.get().collection(collection.CATEGORY_COLLECTIONS).find({main: 'WOMENS'}).toArray()
      resolve(women);
    })
  },

  getKidsCategory : () =>{
    return new Promise(async(resolve,  reject) =>{
      let kids = await db.get().collection(collection.CATEGORY_COLLECTIONS).find({main: 'KIDS'}).toArray()
      resolve(kids);
    })
  },
  
  

};
