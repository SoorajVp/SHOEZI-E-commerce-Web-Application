var express = require('express');
var router = express.Router();
var adminAuth = require('../middlewares/adminAuth');
var controller = require('../controllers/adminController');
const upload = require('../utils/multer');


/* GET home page. */

router.get('/login', controller.adminlogin);

router.post('/login', controller.postAdminlogin);

router.get('/logout', controller.adminlogout);

router.get('/', adminAuth.varifyLogin, controller.dashboard);

router.get('/users',adminAuth.varifyLogin, controller.viewUsers);

router.get('/users/:id',adminAuth.varifyLogin, controller.blockUser);

router.get('/usersblocked/:id',adminAuth.varifyLogin, controller.unblockUser);

router.get('/products',adminAuth.varifyLogin, controller.getAllProducts);

router.get('/add-products',adminAuth.varifyLogin, controller.addProducts);

router.post('/add-products', upload.array('image',4),adminAuth.varifyLogin, controller.addProductsPost);

router.get('/edit-products/:id',adminAuth.varifyLogin, controller.editProduct);

router.post('/edit-products/:id', upload.array('image',4),adminAuth.varifyLogin, controller.editProductPost);

router.get('/listed/:id',adminAuth.varifyLogin, controller.productList);

router.get('/unlist/:id',adminAuth.varifyLogin, controller.productUnlist);

router.get('/coupons',adminAuth.varifyLogin, controller.getCoupons);

router.get('/banners',adminAuth.varifyLogin, controller.findBanners);

router.get('/add-banner',adminAuth.varifyLogin, controller.addBanners);

router.post('/add-banner',upload.single("image"),adminAuth.varifyLogin, controller.bannerPost);

router.get('/unlist-banner/:id',adminAuth.varifyLogin, controller.unlistBannner);

router.get('/list-banner/:id',adminAuth.varifyLogin, controller.listBannner);

router.get('/edit-banner/:id',adminAuth.varifyLogin, controller.editBannner);

router.post('/edit-banner/:id',upload.single("image"),adminAuth.varifyLogin, controller.editBannerPost);

router.get('/category', adminAuth.varifyLogin, controller.categoryView);

router.post('/category',adminAuth.varifyLogin, controller.categoryPost);

router.post('/edit-category/:id',adminAuth.varifyLogin, controller.editCategory);

router.get('/list-category/:id',adminAuth.varifyLogin, controller.categoryList);

router.get('/unlist-category/:id',adminAuth.varifyLogin, controller.categoryUnlist);

router.get('/order-list', adminAuth.varifyLogin, controller.getOrders);

router.get('/order-details/:id', adminAuth.varifyLogin, controller.getOrderDetails);

router.post('/order-status', adminAuth.varifyLogin, controller.OrderStatus);

module.exports = router;
