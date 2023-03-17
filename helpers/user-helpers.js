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
      await db.get().collection(collection.USER_COLLECTIONS).findOne({_id: new ObjectId(userId)}).then((response) =>{
        resolve(response);
      })
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
    
      // let addressData = [];
      // addressData.push(address);
      db.get().collection(collection.USER_COLLECTIONS).updateOne({_id: new ObjectId(userId)}, {
        $push: {
          address: addressData
        }
      })
      //   .then((response) =>{
      //   resolve(response);
      // })
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
  }

};
