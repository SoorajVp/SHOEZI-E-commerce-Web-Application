var express = require('express');
var router = express.Router();

var controller = require('../controllers/userController');


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

router.get('/change-password', controller.changePassword);

router.post('/change-password/:id', controller.changePasswordPost);

router.get('/new-password', controller.newPassword);

router.post('/new-password/:id', controller.newPasswordPost);

router.get('/otp-login', controller.otpLogin);

router.post('/otp-login', controller.otpLoginPost);


module.exports = router;
