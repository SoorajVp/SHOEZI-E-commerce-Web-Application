// const { response } = require("../app");
const { response } = require("express");
const { Db } = require("mongodb");
const adminHelpers = require("../helpers/admin-helpers");
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const otpVarify = require('../api/twilio');

module.exports = {
  homepage: (req, res) => {

    adminHelpers.getAllBanners().then((banners) =>{
      if (req.session.loggedin) {
        let user = req.session.user;
        console.log("user id  found.......................",user);
        res.render("users/home-page", { logged: true, user ,banners});
      } else {
        res.render("users/home-page", {banners});
      }
    })

    
  },
  logout: (req, res) => {
    req.session.loggedin = false;
    res.redirect("/");
  },

  login: (req, res) => {
    if (req.session.loggedin) {
      res.redirect("/");
    } else {
      res.render("users/user-login", {logErr: req.session.logErr, loginForm: true });
      req.session.logErr = false;
    }
  },
  postLogin: (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
      console.log("Response dattaaaaaaaa.............",response);

      if (response.status) {
        if (response.unblocked) {
            console.log("session user name.....",(response.user));
          req.session.loggedin = true;
          req.session.user = response.user;
          res.redirect("/");
        } else {
          req.session.logErr = "This Account is Blocked";
          res.redirect("/login");
        }
      } else {
        req.session.logErr = "Invalid username or Password";
        res.redirect("/login");
      }
    });
  },

  signup: (req, res) => {
    if (req.session.loggedin) {
      res.redirect("/");
    } else {
      res.render("users/user-signup", { loginForm: true});
    }
  },
  postSignup: (req, res) => {
    console.log(req.body);

    userHelpers.doSignup(req.body).then((response) => {
      console.log("Created account  dattaaaaaaaa.............",response);
      req.session.loggedin = true;
      req.session.user = response;
      console.log(req.session);
      res.redirect("/");
    });
  },

  shop: (req, res) => {
    productHelpers.getAllProducts().then((products) => {
      if (req.session.loggedin) {
        let user = req.session.user; 
        res.render("users/shop-page", { products, logged: true, user });
            
      } else {
        // res.redirect("/login");
        res.render('users/shop-page',{products });
      }
    });
    
  },

  productDetails : async(req, res) =>{
    console.log(req.params.id)
    let product = await productHelpers.getProductDetails(req.params.id);
    if(req.session.loggedin){
      let user = req.session.user; 
      res.render('users/product-details', {product, logged: true, user});
    }else{
      res.render('users/product-details', {product})
    }
  },

  userProfile : async(req, res) =>{
    // let user = await userHelpers.getUserDetails(req.params.id);
    // console.log("user found .........", user)
    // console.log("session data .........", req.session.user);

    console.log("User profile on session ...... ", req.session.user);

    if(req.session.loggedin){

      let userData = req.session.user;
      console.log("User Id  from session");
      let user = await userHelpers.findUser(userData._id);

      console.log("User Profile finded data....", user);
      res.render('users/user-profile', {user});
      
      
    }else{
      res.redirect('/');
    }
  },

  editUserData : (req, res) =>{
    let userId = req.params.id;
    userHelpers.updateUserData(userId, req.body);
    res.redirect('/profile');
  },

  addAddress : (req, res) =>{
     if(req.session.loggedin){
      let user = req.session.user;
      res.render('users/user-addAddress', {user})
     }else{
      res.redirect('/');
     }
  },

  addAddressPost : (req, res) =>{

    console.log(req.params.id);
    console.log(req.body);

    userHelpers.updateAddress(req.body, req.params.id);
    // .then((response) =>{
      // console.log("Response data from update address", response);
      // req.session.user = response;
      userHelpers.findUser(req.params.id).then((user) =>{
        req.session.user = user;
        res.redirect('/address');
      })
      
    // })
    
  },

  getAddress : (req, res) =>{
    if(req.session.user){
      let user = req.session.user;
      res.render('users/user-address', {user});
    }else{
      res.redirect('/');
    }
  },

  changePassword : (req, res) =>{
    if(req.session.loggedin){
      let user = req.session.user;
      res.render('users/change-password', {user, err: req.session.varifyErr});
      req.session.varifyErr = false;
    }else{
      res.redirect('/');
    }    
  },

  changePasswordPost : (req, res) =>{
    userHelpers.varifyPassword(req.params.id, req.body).then((response) =>{
      console.log("varified response....", response.status);
      if(response.status){
        res.redirect('/new-password');
      }else{
        req.session.varifyErr = "Incorrect Password !";
        res.redirect('/change-password');
      }
    })
  },

  newPassword : (req, res) =>{
    if(req.session.loggedin){
      let user = req.session.user;
      res.render('users/new-password', {user});
     
    }else{
      res.redirect('/');
    }
  },

  newPasswordPost : (req, res) =>{
    userHelpers.changePassword(req.params.id, req.body).then((response) =>{
      res.redirect('/profile');
    })
  },

  otpLogin : (req, res) =>{ 
    res.render('users/otp-login', {logErr: req.session.logErr});
    req.session.logErr = false;   
  },

  otpLoginPost : async(req, res) =>{
    console.log("!@#$%^&*)(*&^!@#$%^&",req.body.mobile);
    await userHelpers.checkMobile(req.body.mobile).then((response) =>{
      if(response.status){
        
        res.render('users/otp-enter');
      }else{
        req.session.logErr = "Mobile is not Registered";
        res.redirect('/otp-login')
      }
    })
  }



};
