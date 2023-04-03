var express = require('express');
var router = express.Router();
var userAuth = require('../middlewares/userAuth');
var controller = require('../controllers/userController');

const client = require('twilio')('ACfcf5b2f4b1d55c97b0540ad72f1e704c', '8fb497f938d4dc4923b2bc1e556825eb');


router.get('/', controller.homepage);

router.get('/login', controller.login);

router.get ('/logout', controller.logout);

router.post('/login', controller.postLogin)

router.get('/signup', controller.signup);

router.post('/signup', controller.postSignup);

router.get('/shop/:id', controller.shop);

// router.post('/shop/:id', controller.shop);

router.get('/product-details/:id', controller.productDetails);

router.get('/profile', userAuth.varifyLogin, controller.userProfile);

router.post('/personal-datas/:id', controller.editUserData);

router.get('/address', userAuth.varifyLogin, controller.getAddress);

router.get('/add-address', userAuth.varifyLogin, controller.addAddress);

router.post('/add-address/:id', controller.addAddressPost);

router.post('/add-delivery-address/:id', controller.addDeliveryAddress);

router.get('/remove-address/:id', controller.removeAddress);

router.get('/change-password', userAuth.varifyLogin, controller.changePassword);

router.post('/change-password/:id', controller.changePasswordPost);

router.get('/new-password', userAuth.varifyLogin, controller.newPassword);

router.post('/new-password/:id', controller.newPasswordPost);

router.get('/otp-login', controller.otpLogin);

router.post('/otp-login', controller.otpLoginPost);

router.get('/varify-otp', userAuth.varifyLogin, controller.getOTP);

router.post('/varify-otp', controller.OTPvarify);

// router.get('/category-filter/:id', controller.filterCategory);

router.get('/cart-products', userAuth.varifyLogin, controller.cartDetails);

router.get('/add-to-cart/:id', userAuth.varifyLogin, controller.addToCart);

router.get('/shop-add-to-cart', userAuth.varifyLogin, controller.homeAddToCart);

router.post('/change-product-quantity', controller.cartQuantity);

router.post('/remove-cartproducts', controller.cartRemove);

router.get('/check-out', userAuth.varifyLogin, controller.placeOrder);

router.post('/check-out-address', userAuth.varifyLogin, controller.addOrderAddress);

router.post('/post-order', userAuth.varifyLogin, controller.placeOrderPost);

router.get('/my-orders', userAuth.varifyLogin, controller.MyOrders);

router.get('/order-details/:id', userAuth.varifyLogin, controller.orderDetails);

router.post('/change-order-status', userAuth.varifyLogin, controller.myOrderStatus);

router.post('/verify-payment', userAuth.varifyLogin, controller.varifyPayment);

router.get('/order-success', userAuth.varifyLogin, controller.successPage);

router.get('/wishList', userAuth.varifyLogin, controller.wishList);

router.post('/wishList', userAuth.varifyLogin, controller.wishListPost);

router.post('/remove-wishlist', controller.removeWishlist);


module.exports = router;
