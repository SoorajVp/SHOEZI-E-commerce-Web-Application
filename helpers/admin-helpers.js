const { ObjectId } = require("mongodb-legacy");
var collection = require("../config/collection");
var db = require("../config/connection");

module.exports = {

  getUserData: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db.get().collection(collection.USER_COLLECTIONS).find().toArray();
      resolve(users);
    });
  },

  blockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      db.get().collection(collection.USER_COLLECTIONS).updateOne({_id:new ObjectId(userId)},{ $set: { status: false } })
        .then((response) => {
          resolve(response);
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
          callback(data.insertedId);
      })
    })
  },

 
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
      db.get().collection(collection.BANNER_COLLECTIONS).updateOne({_id: new ObjectId(banId)},
      {
        $set: {
          head: banner.head,
          text: banner.text,
          url: banner.url
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
      category.sub = category.sub.toUpperCase()
      category.listed = true;
      if(category.main == "MAIN CATEGORY"){
        resolve({
          status: false,
          message: "* Please select the Main Category"
        })
      }else{
          let categoryExist = await db.get().collection(collection.CATEGORY_COLLECTIONS).findOne({main: category.main , sub: category.sub})
          if(categoryExist) {
            resolve({
              status: false,
              message: "* This category is already Exist"
            })
          }else{
            db.get().collection(collection.CATEGORY_COLLECTIONS).insertOne(category).then((response) =>{
              resolve({status: true})
            })
          }
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
      resolve(category);
    })
  },

  updateCategory : (catgoryId, category) =>{
    return new Promise((resolve, reject) =>{
      db.get().collection(collection.CATEGORY_COLLECTIONS).updateOne({_id: new ObjectId(catgoryId)}, 
      {$set: {
        url: category.url,
        main: category.main,
        sub: category.sub,
      }});
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

  getItemCategory : (category) =>{
    return new Promise(async(resolve, reject) =>{
      let catList1 = await db.get().collection(collection.CATEGORY_COLLECTIONS).find({main: category}).toArray();
      resolve(catList1);
    })
  },

  getAllCategory : () =>{
    return new Promise(async(resolve, reject) =>{
      let category = await db.get().collection(collection.CATEGORY_COLLECTIONS).find().toArray();
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

  weeklyReport: () =>{
    return new Promise(async(resolve,  reject) =>{
      let orders = await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
        {
          $match: {
            date: {
              $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: { $week: "$date" },
            count: { $sum: 1 }
          }
        }
      ]).toArray()
      resolve(orders);
    })
  },

  

 

  
  
  addCoupons : (coupon) =>{
    coupon.created = new Date();
    coupon.discount = Number(coupon.discount);
    coupon.expired = new Date(coupon.expired);

    if(coupon.expired > coupon.created){
      coupon.status = true
    }else{
      coupon.status = false
    }
    return new Promise(async(resolve, reject) =>{
      let flag = 0;
      let couponData = await db.get().collection(collection.COUPON_COLLECTIONS).find({}, {code: 1, _id: 0}).toArray()
      for(let i=0; i< couponData.length; i++) {
        if(couponData[i].code == coupon.code) {
          flag=1;
        }
      }
      if(flag == 1) {
        resolve({ status: false , message: "* Coupon code is already exits ..."})
      }else{
        db.get().collection(collection.COUPON_COLLECTIONS).insertOne(coupon).then(() =>{
          resolve({status: true})
        })
      }
      
    })
  },

  updateCoupon : (coupon , couponId) =>{
    let date = new Date();
    return new Promise((resolve, reject) =>{
      if(coupon.expired > date){
        coupon.status = true
      }else{
        coupon.status = false
      }
      db.get().collection(collection.COUPON_COLLECTIONS).updateOne({_id: new ObjectId(couponId)},
      {
        $set:{
          code: coupon.code,
          discount: Number(coupon.discount),
          expired: new Date(coupon.expired),
          status: coupon.status
        }
      }).then((response) =>{
        resolve(response)
      })
    })
  },

  deleteCoupon : (couponId) =>{
    return new Promise((resolve, reject) =>{
      db.get().collection(collection.COUPON_COLLECTIONS).deleteOne({_id: new ObjectId(couponId)}).then((response)=>{
        resolve(response);
      })
    })
  },

  getAllCoupons : () =>{
    return new Promise(async(resolve, reject) =>{
      let coupons = await db.get().collection(collection.COUPON_COLLECTIONS).find().toArray();
      let date = new Date();
      for(let i=0; i< coupons.length; i++){
        if(coupons[i].expired > date){
          coupons[i].status = true
          db.get().collection(collection.COUPON_COLLECTIONS).updateOne({_id: new ObjectId(coupons[i].Id)},{$set: {status: coupons[i].status}}).then(()=>{})
        }else{
          coupons[i].status = false
          db.get().collection(collection.COUPON_COLLECTIONS).updateOne({_id: new ObjectId(coupons[i].Id)},{$set: {status: coupons[i].status}}).then(()=>{})
        }
      }
      resolve(coupons);
    })
  },

  couponApply : (couponCode, userId) =>{
    return new Promise(async(resolve, reject) =>{
      let date = new Date();
      let coupon = await db.get().collection(collection.COUPON_COLLECTIONS).findOne({code: couponCode});
      if(coupon){
        if(coupon.expired > date){
          let user = await db.get().collection(collection.COUPON_COLLECTIONS).findOne({code: couponCode, users: { $in: [new ObjectId(userId)] } });
          if(user){
            resolve({
              status: false,
              message:"This Coupon Already used !"
            });
          }else{
            
            resolve({
              status: true,
              offer: coupon.discount
            })
          }
  
        }else{
          resolve({
            status: false,
            message:"This Coupon is Expired !"
          });
        }

      }else{
        resolve({
          status: false,
          message:"Invalid Coupon code !"
        });
      }
    })
  },

  usedCoupon : (couponCode, userId) =>{
    return new promises(async(resolve, reject) =>{
      db.get().collection(collection.COUPON_COLLECTIONS).updateOne({code: couponCode}, { $push: { users: new ObjectId(userId) } }).then((response)=>{
        resolve()
      })
      
    })
  }
  
  

};
