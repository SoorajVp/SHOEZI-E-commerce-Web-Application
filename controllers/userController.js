// const { response } = require("../app");
// const { response } = require("express");
const { Db } = require("mongodb");
const adminHelpers = require("../helpers/admin-helpers");
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const otpVarify = require('../api/twilio');
const { getOrderProductList } = require("../helpers/user-helpers");
const Swal = require('sweetalert2');
const async = require("hbs/lib/async");
// const async = require("hbs/lib/async");

module.exports = {
  homepage: async(req, res) => {
     let banners = await adminHelpers.getAllBanners();
      if (req.session.loggedin) {
        let cartCount = await userHelpers.getCartCount(req.session.user._id);
        let user = req.session.user;
        res.render("users/home-page", { logged: true, user ,banners, cartCount});
      } else {
        res.render("users/home-page", {banners});
      }
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
      if (response.status) {
        if (response.unblocked) {
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
    userHelpers.doSignup(req.body).then((response) => {
      req.session.loggedin = true;
      req.session.user = response;
      console.log(req.session);
      res.redirect("/");
    });
  },

  shop: async(req, res) => {

    let value = req.params.id
    console.log(req.params.id)

    if(value === value.toUpperCase()){
      req.session.category = value;
      console.log("this is string uppercase");
      let category = await adminHelpers.getItemCategory(req.params.id);
      let products = await productHelpers.getShopItems(req.params.id);

      for(let i=0; i< products.length; i++){
        products[i].price = products[i].price.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
      }

      if (req.session.loggedin) {
        let user = req.session.user; 
        let cartCount = await userHelpers.getCartCount(req.session.user._id);
        res.render("users/shop-page", { products, category, logged: true, user, cartCount});
      } else {
        res.render('users/shop-page',{ products, category });
      }

    }else{

      console.log("this is not string uppercase", req.body);
      let category = await adminHelpers.getItemCategory(req.session.category);
      let products = await productHelpers.getShopItemsSub(req.params.id);
      console.log(products)

      for(let i=0; i< products.length; i++){
        products[i].price = products[i].price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      }
      
        if (req.session.loggedin) {
          let user = req.session.user; 
          let cartCount = await userHelpers.getCartCount(req.session.user._id);
          res.render("users/shop-page", { products, category, logged: true, user, cartCount});
        } else {
          res.render('users/shop-page',{ products, category });
        }
    }
    
    
   
    
  },

  productDetails : async(req, res) =>{
    let product = await productHelpers.getProductDetails(req.params.id);
    product.price = product.price.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
    if(req.session.loggedin){
      let user = req.session.user; 
      let cartCount = await userHelpers.getCartCount(req.session.user._id);
      res.render('users/product-details', {product, logged: true, user, cartCount});
    }else{
      res.render('users/product-details', {product})
    }
  },

  userProfile : async(req, res) =>{
    if(req.session.loggedin){
      let userData = req.session.user;
      let user = await userHelpers.findUser(userData._id);
      let cartCount = await userHelpers.getCartCount(req.session.user._id);
      res.render('users/user-profile', {user, cartCount});
    }else{
      res.redirect('/');
    }
  },

  editUserData : (req, res) =>{
    let userId = req.params.id;
    userHelpers.updateUserData(userId, req.body);
    res.redirect('/profile');
  },

  addAddress : async(req, res) =>{
     if(req.session.loggedin){
      let user = req.session.user;
      let cartCount = await userHelpers.getCartCount(req.session.user._id);
      res.render('users/user-addAddress', {user, cartCount})
     }else{
      res.redirect('/');
     }
  },

  addAddressPost : async(req, res) =>{
    userHelpers.updateAddress(req.body, req.params.id);
    res.redirect('/address');
    
  },

  getAddress : async(req, res) =>{
    if(req.session.user){
      let user = req.session.user;
      let cartCount = await userHelpers.getCartCount(req.session.user._id);
      res.render('users/user-address', {user, cartCount});
    }else{
      res.redirect('/');
    }
  },

  changePassword : async(req, res) =>{
    if(req.session.loggedin){
      let user = req.session.user;
      let cartCount = await userHelpers.getCartCount(req.session.user._id);
      res.render('users/change-password', {user, err: req.session.varifyErr, cartCount});
      req.session.varifyErr = false;
    }else{
      res.redirect('/');
    }    
  },

  changePasswordPost : (req, res) =>{
    console.log(req.body.password)
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

  newPassword : async(req, res) =>{
    if(req.session.loggedin){
      let user = req.session.user;
      let cartCount = await userHelpers.getCartCount(req.session.user._id);
      res.render('users/new-password', {user, cartCount});
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
    res.render('users/otp-login');
    req.session.logErr = false;   
  },

  otpVerify : async(req, res) =>{
    console.log("this is otp number----", req.body);
    await userHelpers.checkMobile(req.body.mobile).then((response) =>{
      console.log("This is reponse from find user mobile",response)
      if(response.status){
        req.session.otpMobile = response.user.mobile;
        res.json(response);
      }else{
        res.json(response);
      }
    })
  },

  otpUserData : async(req, res) =>{
    console.log("this is session mobile----", req.session.otpMobile)
    await userHelpers.getUserMobiledetails(req.session.otpMobile).then((response) =>{
      console.log(response);
      if(response.status){
        req.session.loggedin = true;
        req.session.user = response.user;
        res.json(response)
      }else{
        res.json(response)
      }
    })
  },
  
  cartDetails : async(req, res) =>{
    let user = req.session.user;
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    if(cartCount > 0){
      let products = await userHelpers.getCartproducts(user._id);
      let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
      totalValue = totalValue.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
      res.render('users/cart-details', {user, products, cartCount, totalValue});
    }else{
      res.render('users/empty-cart', {user, cartCount})
    }
    
  },

  addToCart : (req, res) =>{
    userHelpers.updateCart(req.params.id, req.session.user._id).then(() =>{
      res.json({
        status: true,
        message: 'added to cart'
      });
    }).catch((err)=>{
      console.log("this is catched error...........",err);
    })
  },

  homeAddToCart : async(req, res) => {
    await userHelpers.updateCart(req.body.proId, req.session.user._id).then((response) =>{
      res.json({status : true,
        message: "item added to cart"
      });
    })
  },

  cartQuantity : (req, res) =>{
    console.log("++++++++++++++++++++++++++");
    console.log(req.body);
    userHelpers.changeProductQuantity(req.body).then(async(response)=>{
      response.total = await userHelpers.getTotalAmount(req.body.user)
      console.log("@@@@@@@@@", response)
      res.json(response)
    })
  },

  cartRemove : (req, res) =>{
    userHelpers.removeCart(req.body).then((response)=>{
      res.json(response)
    })
  },

  placeOrder : async(req, res) =>{
    let user = req.session.user;
    let products = await userHelpers.getCartproducts(user._id);
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    let total = await userHelpers.getTotalAmount(req.session.user._id);
    // total = total.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
    res.render('users/checkout',{total, user, cartCount, products});
  },

  addOrderAddress : (req, res) =>{
    userHelpers.updateAddress(req.body, req.params.id);
    userHelpers.findUser(req.params.id).then((user) =>{
        req.session.user = user;
        res.redirect('/address');
        
    })
  },

  removeAddress : async(req, res) =>{
    console.log(req.params.id)
    let addressId = req.params.id;
    await userHelpers.AddressDelete(addressId, req.session.user._id);
    let user = await userHelpers.findUser(req.session.user._id);
    req.session.user = user;
    // res.redirect('/address');
    res.json({status: true});
    
  },

  addDeliveryAddress : (req, res) =>{
    userHelpers.updateAddress(req.body, req.params.id);
      userHelpers.findUser(req.params.id).then((user) =>{
        req.session.user = user;
        res.redirect('/check-out');
      })
  },

  placeOrderPost : async(req, res) =>{
    console.log("this is req.body");
    console.log("this order datas------",req.body);
    let products = await userHelpers.getOrderProductList(req.body.userId);
   
    userHelpers.placeOrder(req.body, products).then((response) => {
      console.log("+++++++++++++++++++++++++++", response.status)
      response.insertedId = ""+response.insertedId
      console.log(response);
      if(response.status == 'COD'){
        response.method = 'COD'
        res.json(response);
      }else if(response.status == 'RAZORPAY'){
        console.log("rezorpay----")
        userHelpers.generateRazorpay(response.insertedId, req.body.total).then((response) =>{
          response.method = 'RAZORPAY' 
          console.log("this is response from razorpay----",response);
          res.json(response);
        })
      }else{
        res.json(response);
      }
    })
  },

  applyCoupon : (req, res) =>{
    console.log(req.body);
    adminHelpers.couponApply(req.body.code, req.body.userId).then((response) =>{
      console.log("this is response from the coupon---", response);
      if(response.status){
        // const totalAmount = 1000;
        // const percentage = 20;
        const discountValue = (response.offer / 100) * req.body.price;
        console.log(discountValue);
        res.json({
          status: true,
          discount: discountValue
        });
      }else{
        res.json(response);
      }

    })
  },

  MyOrders : async(req, res) =>{
    let user = req.session.user;
    let orders = await userHelpers.myOrderList(user._id);
    let cartCount = await userHelpers.getCartCount(user._id);
    console.log("***" , orders)
    orders.forEach(order => {
      const isoDate = order.createdOn;
      const date = new Date(isoDate);
      const options = { timeZone: 'UTC' };
      const localDateString = date.toLocaleDateString('es-ES', options);
      order.createdOn = localDateString;
    });
    res.render('users/order-list', {user, orders, cartCount});

  },

  orderDetails : async(req, res) =>{
    let user = req.session.user;
    let orderDetails = await adminHelpers.getUserOrder(req.params.id);
    let products = await productHelpers.getOrderedProducts(req.params.id);
    let cartCount = await userHelpers.getCartCount(user._id);
    console.log("!!!!!!!",orderDetails);
    res.render('users/order-details', {user, cartCount, products, orderDetails});
  },

  myOrderStatus : async(req, res) =>{
    console.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY")
    console.log(req.body.userId , req.body.status);


    
    await adminHelpers.changeOrderStatus(req.body.userId, req.body.status).then((response) =>{
      console.log("@@", response);
      response.status = true;
      res.json(response)
      // res.redirect('/my-orders');
    })
  },

  varifyPayment : (req, res) =>{
    console.log("this is the last log", req.body);
    userHelpers.verifyOrderPayment(req.body).then(async() =>{
      console.log("condition truewwwww");
      let orderStatus = 'PLACED'
      console.log('this is the last console and the order id is',req.body['order[receipt]']);
      await adminHelpers.changeOrderStatus(req.body['order[receipt]'], orderStatus).then(() =>{
        console.log("payment successfull");
        res.json({status: true});
      })
    }).catch((err) =>{
      console.log("condition falseeee");
      res.json({status: false})
    })
  },


  successPage : (req, res) =>{
    res.render('users/order-success');
  },

  wishList : async(req, res) =>{
    let user = req.session.user;
    let cartCount = await userHelpers.getCartCount(user._id);
    let items = await userHelpers.getWishListItems(user._id);
    res.render('users/wishlist', {user, cartCount, items});
  },

  wishListPost : (req, res) =>{
    console.log(req.body);
    userHelpers.addWishList(req.body.proId, req.body.userId).then((response) =>{
      res.json(response);
    })
  },

  removeWishlist : (req, res) =>{
    userHelpers.addWishList(req.body.proId, req.body.userId).then((response) =>{
      res.json(response);
    })
  }

  
  

  



};
