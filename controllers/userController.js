// const { response } = require("../app");
// const { response } = require("express");
// const { Db } = require("mongodb");
const adminHelpers = require("../helpers/admin-helpers");
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const orderHelpers = require("../helpers/order-helpers");
const slug = require('slugify');
// const otpVarify = require('../api/twilio');
// const { getOrderProductList } = require("../helpers/user-helpers");
// const Swal = require('sweetalert');
// const async = require("hbs/lib/async");
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
    try {
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
    } catch (error) {
      console.log(error)
    }
    
  },


  signup: (req, res) => {
    if (req.session.loggedin) {
      res.redirect("/");
    } else {
      res.render("users/user-signup", { loginForm: true});
    }
  },
  postSignup: (req, res) => {
    try {
      userHelpers.doSignup(req.body).then((response) => {
        req.session.loggedin = true;
        req.session.user = response;
        console.log(req.session);
        res.redirect("/");
      });
    } catch (error) {
      console.log(error)
    }
  },



  shop: async(req, res) => {

    console.log("param by search function ---------------", req.params.id);

    try {
      let value = req.params.id
      if(value === value.toUpperCase()){
          console.log("Filter from Main category---------")
          req.session.main = value; 
          req.session.sub = false;
        
          let category = await adminHelpers.getItemCategory(req.session.main);
          let products = await productHelpers.getShopItems(req.session.main);
        
          for(let i=0; i< products.length; i++){
            products[i].price = products[i].price.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
            if(products[i].offer){
              products[i].total = products[i].total.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
            }
          }
          if (req.session.loggedin) {
            let user = req.session.user; 
            let cartCount = await userHelpers.getCartCount(req.session.user._id);

            if(req.session.filteredProducts){
              products=req.session.filteredProducts;
              res.render("users/shop-page", { products, category, logged: true, user, cartCount, sessionCategory: req.session.main});
              req.session.filteredProducts = false
            }else{
              console.log("this is filtered products---------------------------------nulllllll")
              res.render("users/shop-page", { products, category, logged: true, user, cartCount, sessionCategory: req.session.main});
            }
          
          } else {

            if(req.session.filteredProducts){
              products=req.session.filteredProducts;
              res.render('users/shop-page',{ products, category, sessionCategory: req.session.main });
              req.session.filteredProducts = false
            }else{
              res.render('users/shop-page',{ products, category, sessionCategory: req.session.main });
            }
          }
      
      }else if(req.params.id == 'low-to-high'){
      
          let category = await adminHelpers.getItemCategory(req.session.main);
          let products = await productHelpers.getProductsLowToHigh(req.session.main);
          for(let i=0; i< products.length; i++ ){
            products[i].price = products[i].price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
          }
        
          if (req.session.loggedin) {
            let user = req.session.user; 
            let cartCount = await userHelpers.getCartCount(req.session.user._id);
          
            if(req.session.filteredProducts){
              products=req.session.filteredProducts;
              res.render("users/shop-page", { products, category, logged: true, user, cartCount, sessionCategory: req.params.id});
              req.session.filteredProducts = false
            }else{
              res.render("users/shop-page", { products, category, logged: true, user, cartCount, sessionCategory: req.params.id});
            }
          
          } else {
          
            if(req.session.filteredProducts){
              products=req.session.filteredProducts;
              res.render('users/shop-page',{ products, category, sessionCategory: req.params.id });
              req.session.filteredProducts = false
            }else{
              res.render('users/shop-page',{ products, category, sessionCategory: req.params.id });
            }
          }
      
      }else if(req.params.id == 'high-to-low'){
        
          let category = await adminHelpers.getItemCategory(req.session.main);
          let products = await productHelpers.getProductsHighToLow(req.session.main);
          for(let i=0; i< products.length; i++){
            products[i].price = products[i].price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
          }
          if (req.session.loggedin) {
            let user = req.session.user; 
            let cartCount = await userHelpers.getCartCount(req.session.user._id);
          
            if(req.session.filteredProducts){
              products=req.session.filteredProducts;
              res.render("users/shop-page", { products, category, logged: true, user, cartCount, sessionCategory: req.params.id});
              req.session.filteredProducts = false
            }else{
              res.render("users/shop-page", { products, category, logged: true, user, cartCount, sessionCategory: req.params.id});
            }
          
          } else {
            if(req.session.filteredProducts){
              products=req.session.filteredProducts;
              res.render('users/shop-page',{ products, category, sessionCategory: req.params.id });
              req.session.filteredProducts = false
            }else{
              res.render('users/shop-page',{ products, category, sessionCategory: req.params.id });
            }
          }
      
      }else if(req.params.id == 'search'){

          if(req.session.loggedin) {
            let user = req.session.user; 
            let category = await adminHelpers.getItemCategory(req.session.main);
            let cartCount = await userHelpers.getCartCount(req.session.user._id);
            products = req.session.filteredProducts;
            for(let i=0; i< products.length; i++){
              products[i].price = products[i].price.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
              if(products[i].offer){
                products[i].total = products[i].total.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
              }
            }
            res.render("users/shop-page", { products, category, logged: true, user, cartCount, sessionCategory: req.session.main});
            req.session.filteredProducts = false;

          }else{

            let category = await adminHelpers.getItemCategory(req.session.main);
            products = req.session.filteredProducts;
            for(let i=0; i< products.length; i++){
              products[i].price = products[i].price.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
              if(products[i].offer){
                products[i].total = products[i].total.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
              }
            }
            res.render("users/shop-page", { products, category, sessionCategory: req.session.main});
            req.session.filteredProducts = false;

          }

      }else{
      
          req.session.sub = req.params.id;
          let category = await adminHelpers.getItemCategory(req.session.main);
          let products = await productHelpers.getShopItemsSub(req.params.id);
          for(let i=0; i< products.length; i++){
            products[i].price = products[i].price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
          }
        
          if (req.session.loggedin) {
            let user = req.session.user; 
            let cartCount = await userHelpers.getCartCount(req.session.user._id);
            if(req.session.filteredProducts){
              products=req.session.filteredProducts;
              res.render("users/shop-page", { products, category, logged: true, user, cartCount, sessionCategory: req.params.id});
              req.session.filteredProducts = false
            }else{
              res.render("users/shop-page", { products, category, logged: true, user, cartCount, sessionCategory: req.params.id});
            }
          
          } else {
          
            if(req.session.filteredProducts){
              products=req.session.filteredProducts;
              res.render('users/shop-page',{ products, category , sessionCategory: req.params.id});
              req.session.filteredProducts = false
            }else{
              res.render('users/shop-page',{ products, category , sessionCategory: req.params.id});
            }

          }
      }
    } catch (error) {
      console.log("shop page error", error);
    }
    
    
  },





  shopFilter : async(req, res) =>{
    
    try {
      console.log("this is console from filter -----", req.body);
      console.log("this is sub", req.session.sub)
      if(req.session.sub){
        console.log("this is console from  sub catogory filter-------- -----")

        let products = await productHelpers.filterProductsSub(req.body.low, req.body.high, req.session.sub);
        req.session.filteredProducts = products
        res.json({response: true})
      }else{
        console.log("this is console from  main catogory filter-------- -----")
        let products = await productHelpers.filterProductsMain(req.body.low, req.body.high, req.body.category);
        req.session.filteredProducts = products
        res.json({response: true})
      }

    } catch (error) {
      console.log(error)
    }
    
  },

 

  productDetails : async(req, res) =>{
    let product = await productHelpers.getProductDetails(req.params.id);
    let related = await productHelpers.getShopItems(req.session.main);
    
    if(product.offer){
      product.total = product.total.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
    }
    product.price = product.price.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
    if(req.session.loggedin){
      let user = req.session.user; 
      let cartCount = await userHelpers.getCartCount(req.session.user._id);
      res.render('users/product-details', {product, logged: true, user, cartCount, related});
    }else{
      res.render('users/product-details', {product, related})
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
    try {
      let userId = req.params.id;
      userHelpers.updateUserData(userId, req.body);
      res.redirect('/profile');
    } catch (error) {
      console.log(error)
    }
  },

  addAddress : async(req, res) =>{
      let user = req.session.user;
      let cartCount = await userHelpers.getCartCount(req.session.user._id);
      res.render('users/user-addAddress', {user, cartCount})
  },

  addAddressPost : async(req, res) =>{
    try {
      userHelpers.updateAddress(req.body, req.params.id);
      res.redirect('/address');
    } catch (error) {
      console.log(error)
    }
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
    try {
      userHelpers.varifyPassword(req.params.id, req.body).then((response) =>{
        console.log("varified response....", response.status);
        if(response.status){
          res.redirect('/new-password');
        }else{
          req.session.varifyErr = "Incorrect Password !";
          res.redirect('/change-password');
        }
      })
    } catch (error) {
      console.log(error)
    }
    
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
    try {
      userHelpers.changePassword(req.params.id, req.body).then((response) =>{
        res.redirect('/profile');
      })
    } catch (error) {
      console.log(error)
    }
  },

  otpLogin : (req, res) =>{ 
    res.render('users/otp-login');
    req.session.logErr = false;   
  },

  otpVerify : async(req, res) =>{
    try {
      console.log("this is otp number----", req.body);
      await userHelpers.checkMobile(req.body.mobile).then((response) =>{
        console.log("This is reponse from find user mobile", response)
        if(response.status){
          req.session.otpMobile = response.user.mobile;
          res.json(response);
        }else{
          res.json(response);
        }
      })
    } catch (error) {
      console.log(error)
    }
    
  },

  otpUserData : async(req, res) =>{

    try {
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
    } catch (error) {
      console.log(error)
    }
    
  },
  
  cartDetails : async(req, res) =>{
    let user = req.session.user;
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    if(cartCount > 0){
      let products = await userHelpers.getCartproducts(user._id);
      let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
      totalValue = totalValue.toLocaleString('en-in', { style: 'currency', currency: 'INR' });

      if(user.walletAmount){
        user.walletAmount = user.walletAmount.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
      }else{
        user.walletAmount = 0;
        user.walletAmount = user.walletAmount.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
      }

      res.render('users/cart-details', {user, products, cartCount, totalValue});
    }else{
      res.render('users/empty-cart', {user, cartCount})
    }
    
  },

  addToCart : (req, res) =>{
    userHelpers.updateCart(req.params.id, req.session.user._id).then((response) =>{
      res.json(response);
    }).catch((err)=>{
      console.log(err);
    })
  },

  homeAddToCart : async(req, res) => {
    await userHelpers.updateCart(req.body.proId, req.session.user._id).then((response) =>{
      console.log("this is reponse from add to cart---------------------", response)

      res.json(response);
    })
  },

  cartQuantity : (req, res) =>{
    try {
      console.log(req.body);
      userHelpers.changeProductQuantity(req.body).then(async(response)=>{
        response.total = await userHelpers.getTotalAmount(req.body.user)
        res.json(response)
      })
    } catch (error) {
      console.log(error)
    }
    
  },

  cartRemove : (req, res) =>{
    try {
      userHelpers.removeCart(req.body).then((response)=>{
        res.json(response)
      })
    } catch (error) {
      console.log(error)
    }
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
    try {
      userHelpers.updateAddress(req.body, req.params.id);
      userHelpers.findUser(req.params.id).then((user) =>{
          req.session.user = user;
          res.redirect('/address');
      })
    } catch (error) {
      console.log(error)
    }
  },

  removeAddress : async(req, res) =>{
    console.log(req.params.id)
    let addressId = req.params.id;
    await userHelpers.AddressDelete(addressId, req.session.user._id);
    let user = await userHelpers.findUser(req.session.user._id);
    req.session.user = user;
    res.json({status: true});
    
  },

  addDeliveryAddress : (req, res) =>{
    try {
      userHelpers.updateAddress(req.body, req.params.id);
      userHelpers.findUser(req.params.id).then((user) =>{
        req.session.user = user;
        res.redirect('/check-out');
      })
    } catch (error) {
      console.log(error)
    }
    
  },

  placeOrderPost : async(req, res) =>{

    try {

      let products = await orderHelpers.getOrderCartProducts(req.body.userId);
      console.log("this is prooducts from the cart side----" , products)

      orderHelpers.placeOrder(req.body, products).then((response) => {
        console.log("+++++++++++++++++++++++++++", response)
        
        response.insertedId = ""+response.insertedId
        console.log(response);

        if(response.status == 'COD'){

          products.forEach(function(values) {
            productHelpers.decrementQuantity(values)
          })

          orderHelpers.EmptyCart(req.body.userId);
          response.method = 'COD'
          res.json(response);

        }else if(response.status == 'WALLET'){

          orderHelpers.changeWalletAmount(req.body.userId, req.body.total);
          products.forEach(function(values) {
            productHelpers.decrementQuantity(values)
          })
          orderHelpers.EmptyCart(req.body.userId);

          response.method = 'COD'
          res.json(response);

        }else if(response.status == 'RAZORPAY'){
          console.log("rezorpay----")
          orderHelpers.generateRazorpay(response.insertedId, req.body.total).then((response) =>{
            response.method = 'RAZORPAY' 
            console.log("this is response from razorpay----",response);
            res.json(response);
          })
        }else{
          res.json(response);
        }
        
      })
    } catch (error) {
      console.log(error)
    }
    
  },

  applyCoupon : (req, res) =>{
    try {
      adminHelpers.couponApply(req.body.code, req.body.userId).then((response) =>{
        if(response.status){
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
    } catch (error) {
      console.log(error)
    }
  },

  MyOrders : async(req, res) =>{
    let user = req.session.user;
    let orders = await orderHelpers.myOrderList(user._id);
    let cartCount = await userHelpers.getCartCount(user._id);

    orders.forEach(order => {
      order.createdOn = new Date(order.createdOn).toLocaleDateString('es-ES', { timeZone: 'UTC' });
      order.total = order.total.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
    });
    res.render('users/order-list', {user, orders, cartCount});

  },

  orderDetails : async(req, res) =>{
    let user = req.session.user;
    let orderDetails = await orderHelpers.getUserOrder(req.params.id);
    let products = await orderHelpers.getOrderedProducts(req.params.id);
    let cartCount = await userHelpers.getCartCount(user._id);
    orderDetails.createdOn = new Date(orderDetails.createdOn).toLocaleDateString('es-ES', { timeZone: 'UTC' });
    console.log("!!!!!!!",orderDetails);
    res.render('users/order-details', {user, cartCount, products, orderDetails});
  },

  myOrderStatus : async(req, res) =>{
    try {
      console.log(req.body.userId , req.body.status);
      await orderHelpers.changeOrderStatus(req.body.userId, req.body.status).then((response) =>{
        console.log("@@", response);
        response.status = true;
        res.json(response)
      })
    } catch (error) {
      console.log(error)
    }
  },

  varifyPayment : async(req, res) =>{

    try {

      let products = await orderHelpers.getOrderCartProducts(req.session.user._id);
      console.log("this is prooducts from the cart side----" , products)

      console.log("this is the last log", req.body);
      orderHelpers.verifyOrderPayment(req.body).then(async() =>{
        console.log("condition truewwwww");

        products.forEach(function(values) {
          productHelpers.decrementQuantity(values)
        })

        orderHelpers.EmptyCart(req.session.user._id);

        let orderStatus = 'PLACED'
        console.log('this is the last console and the order id is',req.body['order[receipt]']);
        await orderHelpers.changeOrderStatus(req.body['order[receipt]'], orderStatus).then(() =>{
          console.log("payment successfull");
          res.json({status: true});
        })
      }).catch((err) =>{
        console.log("condition falseeee");
        res.json({status: false})
      })
    } catch (error) {
      console.log(error)
    }
    
  },


  successPage : (req, res) =>{
    let user = req.session.user;
    let cartCount = 0;
    res.render('users/order-success', {user, cartCount});
  },

  wishList : async(req, res) =>{
    let user = req.session.user;
    let cartCount = await userHelpers.getCartCount(user._id);
    let items = await userHelpers.getWishListItems(user._id);
    console.log(items)

    items.forEach(item => {
      console.log(item)
      // item.result[0].total = item[0].total.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
      item.result[0].price = item.result[0].price.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
      if(item.result[0].total){
        item.result[0].total = item.result[0].total.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
      }
    });

    res.render('users/wishlist', {user, cartCount, items});
  },

  wishListPost : (req, res) =>{
    try {
      console.log(req.body);
      userHelpers.addWishList(req.body.proId, req.body.userId).then((response) =>{
        res.json(response);
      })
    } catch (error) {
      console.log(error)
    }
  },

  removeWishlist : (req, res) =>{
    try {
      userHelpers.addWishList(req.body.proId, req.body.userId).then((response) =>{
        res.json(response);
      })
    } catch (error) {
      console.log(error)
    }
    
  },

  myWallet : async(req, res) =>{
    let user = req.session.user;
    let cartCount = await userHelpers.getCartCount(user._id);
    if(user.walletAmount){
      user.walletAmount = user.walletAmount.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
      res.render('users/user-wallet', {user, cartCount})
    }else{
      user.walletAmount = 0;
      user.walletAmount = user.walletAmount.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
      res.render('users/user-wallet', {user, cartCount})
    }
  },

  search : async(req, res) =>{
    
    let products = await productHelpers.searchProducts(req.body.key);
    req.session.filteredProducts = products;
    res.redirect('/shop/search');

  }

  
  

  



};
