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

router.get('/shop', controller.shop);

router.get('/product-details/:id', controller.productDetails);

router.get('/profile', controller.userProfile);

router.post('/personal-datas/:id', controller.editUserData);

router.get('/address', controller.getAddress);

router.get('/add-address', controller.addAddress);

router.post('/add-address/:id', controller.addAddressPost);

router.post('/add-delivery-address/:id', controller.addDeliveryAddress);

router.get('/remove-address/:id', controller.removeAddress);

router.get('/change-password', controller.changePassword);

router.post('/change-password/:id', controller.changePasswordPost);

router.get('/new-password', controller.newPassword);

router.post('/new-password/:id', controller.newPasswordPost);

router.get('/otp-login', controller.otpLogin);

router.post('/otp-login', controller.otpLoginPost);

router.get('/varify-otp', controller.getOTP);

router.post('/varify-otp', controller.OTPvarify);

router.get('/category-filter/:id', controller.filterCategory);

router.get('/cart-products',userAuth.varifyLogin, controller.cartDetails);

router.get('/add-to-cart/:id', userAuth.varifyLogin, controller.addToCart);

router.post('/change-product-quantity', controller.cartQuantity);

router.post('/remove-cartproducts', controller.cartRemove);

router.get('/check-out', userAuth.varifyLogin, controller.placeOrder);

router.post('/check-out-address', userAuth.varifyLogin, controller.addOrderAddress);

router.post('/post-order', userAuth.varifyLogin, controller.placeOrderPost);

router.get('/my-orders', userAuth.varifyLogin, controller.MyOrders);

router.get('/order-details/:id', userAuth.varifyLogin, controller.orderDetails);

router.post('/change-order-status/:id', userAuth.varifyLogin, controller.myOrderStatus);


module.exports = router;
