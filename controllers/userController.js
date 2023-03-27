// const { response } = require("../app");
const { response } = require("express");
const { Db } = require("mongodb");
const adminHelpers = require("../helpers/admin-helpers");
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const otpVarify = require('../api/twilio');
const { getOrderProductList } = require("../helpers/user-helpers");

module.exports = {
  homepage: async(req, res) => {
    
     let banners = await adminHelpers.getAllBanners()
      if (req.session.loggedin) {
        let cartCount = await userHelpers.getCartCount(req.session.user._id);
        let user = req.session.user;
        
        console.log("cartCount is  found.......................",cartCount);
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

  shop: async(req, res) => {
    let category = await adminHelpers.getCategory();
    console.log("PPPPPPPPPPPPPPPPPPPPPPP");
    console.log("PPPPPPPPPPPPPPPPPPPPPPP", category);
    let products = await productHelpers.getAllProducts()
    console.log('------------------------------------------------------------------------------------');
    console.log(products);
      if (req.session.loggedin) {
        let user = req.session.user; 
        let cartCount = await userHelpers.getCartCount(req.session.user._id);
        res.render("users/shop-page", { products, category, logged: true, user, cartCount});
            
      } else {
        res.render('users/shop-page',{ products, category });
      }
   
    
  },

  productDetails : async(req, res) =>{
    console.log(req.params.id)
    let product = await productHelpers.getProductDetails(req.params.id);
    if(req.session.loggedin){
      let user = req.session.user; 
      let cartCount = await userHelpers.getCartCount(req.session.user._id);
      res.render('users/product-details', {product, logged: true, user, cartCount});
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
      let cartCount = await userHelpers.getCartCount(req.session.user._id);

      console.log("User Profile finded data....", user);
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

    console.log(req.params.id);
    console.log(req.body);

    userHelpers.updateAddress(req.body, req.params.id);
    let user = await userHelpers.findUser(req.params.id);
    req.session.user = user;
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
    res.render('users/otp-login', {logErr: req.session.logErr});
    req.session.logErr = false;   
  },

  getOTP : (req, res) =>{
    console.log("============",req.session.otpNumber);
    if(req.session.otpNumber){
      res.redirect('/varify-otp')
    }else{
      res.redirect('/otp-login');
    }
    
  },

  otpLoginPost : async(req, res) =>{
    console.log("!@#$%^&*)(*&^!@#$%^&",req.body.mobile);
    let response = await userHelpers.checkMobile(req.body.mobile)
      if(response.status){
        console.log("55555555555555555555555555", response.status);
        console.log(response.user.mobile);
        req.session.otpNumber = response.user.mobile;
        await otpVarify.sendOtp(response.user.mobile).then((result) =>{
          console.log("88888888888888888888888888", result);
          if(result){
            res.render('users/otp-enter', {logErr: req.session.logErr});
            req.session.logErr = false; 
          }else{
            console.log("OTP is not sended .......");
            console.log("999999999999999999999", result);
            res.redirect('/varify-otp');
          }
          
        })        
      }else{
        console.log("66666666666666666666", response.status);
        req.session.logErr = "Mobile is not Registered";
        res.redirect('/otp-login');
      }
  },

  

  OTPvarify : async(req, res) =>{
    console.log("current otp number---",req.session.otpNumber);
    let response = await otpVarify.verifyOtp(req.session.otpNumber, req.body.otp);
    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    console.log(response);
    if(response){
      let result = await userHelpers.checkMobile(req.session.otpNumber);
      console.log("This is result of mobile find ---",result);
      req.session.user = result.user;
      req.session.loggedin = true;
      res.redirect('/');
    }else{
      req.session.logErr = "Invalid OTP"
      res.redirect('/varify-otp');
    }
  },

  filterCategory : async(req, res) =>{
    console.log("ttttttttttttttttttttttttttttt", req.params.id);
    let category = await adminHelpers.getCategory();
    await productHelpers.categoryService(req.params.id).then((products) =>{
      res.render('users/category-products', {products, category });
    })
  },

  cartDetails : async(req, res) =>{
    let user = req.session.user;
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    if(cartCount > 0){
      let products = await userHelpers.getCartproducts(user._id);
      let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
      console.log('mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', cartCount);
      console.log('mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', products);
      console.log('mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', totalValue);
      res.render('users/cart-details', {user, products, cartCount, totalValue});
    }else{
      res.render('users/empty-cart', {user, cartCount})
    }
    
  },

  addToCart : (req, res) =>{
    console.log("^^^^^^^^^^^^^^^^^^^ API CALL ^^^^^^^^^^^^^^^^^^^^^^^^");
    console.log(req.params.id);
    userHelpers.updateCart(req.params.id, req.session.user._id).then(() =>{
      console.log("end reached ---------------------------------",);
      res.json({
        status: true,
        message: 'added to cart'
      });
    }).catch((err)=>{
      console.log("this is catched error...........",err);
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
    console.log("BBBBBBBBB", products)
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
    let addressId = req.params.id;
    await userHelpers.AddressDelete(addressId, req.session.user._id);
    let user = await userHelpers.findUser(req.session.user._id);
    req.session.user = user;
    res.redirect('/address');
    
  },

  addDeliveryAddress : (req, res) =>{
    userHelpers.updateAddress(req.body, req.params.id);
      userHelpers.findUser(req.params.id).then((user) =>{
        req.session.user = user;
        res.redirect('/check-out');
      })
  },

  placeOrderPost : async(req, res) =>{
    console.log("+++++++++++++++++++++++++++")

    console.log(req.body);
    let products = await userHelpers.getOrderProductList(req.body.userId);
    // let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
    // console.log("total------------", totalPrice)
    // let address = await userHelpers.getAddress(req.body.userId, req.body.addressId);
    userHelpers.placeOrder(req.body, products).then((status) => {
      console.log("+++++++++++++++++++++++++++")
      console.log(status);
      if(status == 'PLACED'){
        res.render('users/order-success', {success: true});
      }else{
        res.json({status: true});
      }
    })
  },

  MyOrders : async(req, res) =>{
    let user = req.session.user;
    let orders = await userHelpers.myOrderList(user._id);
    let cartCount = await userHelpers.getCartCount(user._id);
    console.log("***" , orders)
    orders.map((order)=>{
      order.createdOn = (order.createdOn).toLocaleDateString('es-ES')
    })
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
    console.log(req.params.id , req.body);
    await adminHelpers.changeOrderStatus(req.params.id, req.body.status).then((response) =>{
      res.redirect('/my-orders');
    })
  }
  

  



};
