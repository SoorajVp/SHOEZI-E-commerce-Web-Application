var express = require('express');
var router = express.Router();
var controller = require('../controllers/adminController');
const upload = require('../utils/multer');


/* GET home page. */
router.get('/login', controller.adminlogin);

router.post('/login', controller.postAdminlogin);

router.get('/logout', controller.adminlogout);

router.get('/', controller.dashboard);

router.get('/users', controller.viewUsers);

router.get('/users/:id', controller.blockUser);

router.get('/usersblocked/:id', controller.unblockUser);

router.get('/products', controller.getAllProducts);

router.get('/add-products', controller.addProducts);

router.post('/add-products', upload.array('image',4), controller.addProductsPost);

router.get('/edit-products/:id', controller.editProduct);

router.post('/edit-products/:id', upload.array('image',4), controller.editProductPost);

router.get('/listed/:id', controller.productList);

router.get('/unlist/:id', controller.productUnlist);

router.get('/coupons', controller.getCoupons);

router.get('/banners', controller.findBanners);

router.get('/add-banner', controller.addBanners);

router.post('/add-banner',upload.single("image"), controller.bannerPost);

router.get('/unlist-banner/:id', controller.unlistBannner);

router.get('/list-banner/:id', controller.listBannner);

router.get('/edit-banner/:id', controller.editBannner);

router.post('/edit-banner/:id',upload.single("image"), controller.editBannerPost);

router.get('/category', controller.categoryView);

router.post('/category', controller.categoryPost);

router.post('/edit-category/:id', controller.editCategory);

router.get('/list-category/:id', controller.categoryList);

router.get('/unlist-category/:id', controller.categoryUnlist);




module.exports = router;
