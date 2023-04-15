var db = require('../config/connection');
var collection = require('../config/collection');
const userHelpers = require('../helpers/user-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const orderHelpers = require('../helpers/order-helpers');
const productHelpers = require('../helpers/product-helpers');
const cloudinary = require('../utils/cloudinary');
const slugify = require('slugify');
const path = require('path');
const { ObjectId } = require('mongodb-legacy');
const { response } = require('express');
const objectId = require('mongodb-legacy').ObjectId;

module.exports = {

    adminlogin : (req,res) =>{   
        if(req.session.adminloggedin){
            res.redirect('/admin');
        }else{
            res.render('admin/admin-login', {admlogErr: req.session.admlogErr, loginForm: true});
            req.session.admlogErr = false;        
        }
    },  

    dashboard : async(req, res) =>{
        const today = new Date();
         let totalAmount = await orderHelpers.getTotalMoney();
        // let users = await adminHelpers.getTotalUsers();
        // let orders = await adminHelpers.getTotalOrders();
        let dailyOrders = await orderHelpers.dailySales(today)
        let weeklyOrders= await orderHelpers.weeklySales(today)
        let monthlyOrders= await orderHelpers.monthlySales(today)

        totalAmount = totalAmount.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
        dailyOrders = dailyOrders.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
        weeklyOrders = weeklyOrders.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
        monthlyOrders = monthlyOrders.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
        
        res.render('admin/dashboard', {admin:true, dailyOrders, weeklyOrders, monthlyOrders, totalAmount});
    },

    postAdminlogin : async(req, res) => {
        try {
            let admin = await db.get().collection(collection.CREDENTIALS).findOne({email:req.body.email});
            if(admin){
                if(admin.password == req.body.password){
                    req.session.admin = req.body.email;
                    req.session.adminloggedin = true;
                    res.redirect('/admin');
                }else{
                    req.session.admlogErr = "Invalid username or password";
                    res.redirect('/admin/login');
                }
            }else{
                req.session.admlogErr = "Invalid username or password";
                res.redirect('/admin/login')
            }
        } catch (error) {
            console.log(error)
        }
        
    },

    adminlogout : (req, res) =>{
        req.session.adminloggedin = false;
        res.redirect('/admin/login');
    },

    viewUsers : (req, res) =>{
        adminHelpers.getUserData().then((users) =>{
            res.render('admin/view-users', {users, admin:true});
        }) 
        
    },

    blockUser : (req, res) =>{
        let userId = req.params.id;
        adminHelpers.blockUser(userId).then((response) =>{
            res.redirect('/admin/users');
        })
    },

    unblockUser : (req, res) => {
        let userId = req.params.id;
        adminHelpers.unblockUser(userId).then((response) =>{
            res.redirect('/admin/users');
        })
    },

    getAllProducts : (req, res) =>{
        productHelpers.getAllProducts().then((products) => {   
            res.render('admin/view-products', {admin:true, products});
        })
    },

    addProducts : async (req, res) =>{
        let category = await adminHelpers.getCategory();
        let mens = await adminHelpers.getMenCategory();
        let womens = await adminHelpers.getWomenCategory();
        let kids = await adminHelpers.getKidsCategory();
        res.render('admin/add-products', {admin:true, category, mens, womens, kids})
    },

    addProductsPost : async(req, res) =>{

        req.body.url = slugify(req.body.name);

        try{
            productHelpers.addProducts(req.body, async(id) =>{             
                let imgUrls = [];
                for(let i=0; i<req.files.length; i++){
                    let result = await cloudinary.uploader.upload(req.files[i].path);
                    imgUrls.push(result.url);                   
                } 
                if(imgUrls.length !== 0){
                    productHelpers.addProductImg(id, imgUrls);
                }
            })
        }catch(err){
            console.log(err);
        }finally{
            res.redirect('/admin/add-products');
        }
    },

    editProduct :  async(req,res) => {
        let category = await adminHelpers.getCategory();
        let product = await productHelpers.getProductDetails(req.params.id);
        let mens = await adminHelpers.getMenCategory();
        let womens = await adminHelpers.getWomenCategory();
        let kids = await adminHelpers.getKidsCategory();
        res.render('admin/edit-products', {admin: true, product, category, mens, womens, kids});
    },

    editProductPost : async (req, res) =>{
        req.body.url = slugify(req.body.name);
        try{
            let imgUrls = [];
            for(let i=0; i<req.files.length; i++){
                let result = await cloudinary.uploader.upload(req.files[i].path);
                imgUrls.push(result.url);
            } 
            if(imgUrls.length !== 0){
                productHelpers.updateImage(req.params.id, imgUrls);
            }
            productHelpers.updateProduct(req.body, req.params.id);

        }catch(err){ 
            console.log(err);
        }finally{
            res.redirect('/admin/products');
        }
    },



    productUnlist : (req, res) =>{
        let prodId = req.params.id;
        adminHelpers.UnlistProduct(prodId).then((response) =>{
            res.redirect('/admin/products');
        })
    },

    productList : (req, res) =>{
        let prodId = req.params.id;
        adminHelpers.listProduct(prodId).then((response) =>{
            res.redirect('/admin/products');
        })
    },
    
    getCoupons : async(req, res) =>{
        
        let coupons = await adminHelpers.getAllCoupons();
        coupons.forEach(coupons => {
            const created = new Date(coupons.created);
            const expired = new Date(coupons.expired);
            coupons.created = created.toLocaleDateString('es-ES', { timeZone: 'UTC' });
            coupons.expired = expired.toLocaleDateString('es-ES', { timeZone: 'UTC' });
        });
        res.render('admin/view-coupons', {admin: true, coupons , couponExist: req.session.couponErr});
        req.session.couponErr = false;
    },

    addcoupons : (req, res) =>{
        try {
            adminHelpers.addCoupons(req.body).then((response) =>{
                console.log(response)
                if(response.status){
                    res.redirect('/admin/coupons');
                }else{
                    req.session.couponErr = response.message;
                    res.redirect('/admin/coupons');
                }
            })
        } catch (error) {
            console.log(error)
        }
    },

    editCoupons : (req, res) =>{
        try {
            adminHelpers.updateCoupon(req.body, req.params.id)
        } catch (error) {
            console.log(error)
        } finally{
            res.redirect('/admin/coupons');
        }
        
    },

    removeCoupons : (req, res) =>{
        console.log("this is coupon param-----")
        console.log(req.params.id)
        adminHelpers.deleteCoupon(req.params.id).then((response) =>{
            res.json(response)
        })
    },

    addBanners : (req, res) =>{
        res.render('admin/add-banners', {admin: true});
    },

    findBanners : (req, res) =>{
        adminHelpers.getBanners().then((Banners) =>{
            res.render('admin/view-banners', {admin: true, Banners});
        }); 
                  
    },

    bannerPost : (req, res) =>{
        try{
            adminHelpers.addBanners(req.body, async(id) =>{
                let result = await cloudinary.uploader.upload(req.file.path);
                adminHelpers.updateBannerImg(id, result.url);
            })
        }catch(err){
            console.log(err);
        }finally{
            res.redirect('/admin/banners');
        }
    },

    unlistBannner : (req, res) =>{
        adminHelpers.bannerUnlist(req.params.id);
        res.redirect('/admin/banners');
    },
    
    listBannner : (req, res) =>{
        adminHelpers.bannerList(req.params.id);
        res.redirect('/admin/banners');
    },

    editBannner : (req, res) =>{
        adminHelpers.getBannerDetails(req.params.id).then((banner) =>{
            res.render('admin/edit-banners', {admin: true, banner } )
        })     
    },

    editBannerPost : async (req, res) =>{
        try{
            adminHelpers.updateBanner(req.params.id, req.body);
            let result = await cloudinary.uploader.upload(req.file.path);
            if(result.url){
                adminHelpers.updateBannerImg(req.params.id, result.url);
            }
        }catch(err){
            console.log(err);
        }finally{
            res.redirect('/admin/banners');
        }
    },

    categoryView : async(req, res) =>{
        await adminHelpers.getAllCategory().then((category) =>{
            res.render('admin/category', {admin: true, category, Err: req.session.categoryErr});
            req.session.categoryErr = false;
        })        
    },

    categoryPost : (req, res) =>{
        console.log("this is category daata -----", req.body)
        try {
            req.body.url = slugify(req.body.main+" "+req.body.sub, { lower: true });
            adminHelpers.addCatergory(req.body).then((response) =>{
                console.log(response)
                if(response.status){
                    res.redirect('/admin/category');
                }else{
                    req.session.categoryErr = response.message;
                    res.redirect('/admin/category');
                }
            })
        } catch (error) {
            console.log(error)
        }
        
    },

    editCategory :  async(req, res) =>{
        try {
            req.body.url = slugify(req.body.main+" "+req.body.sub, { lower: true });
            await adminHelpers.updateCategory(req.params.id, req.body).then(()=>{
                res.redirect('/admin/category');
            })
        } catch (error) {
            console.log(error)
        }
    },

    categoryList : (req, res) =>{
        adminHelpers.listCategory(req.params.id).then((response) =>{
            res.redirect('/admin/category');
        })
    },

    categoryUnlist : (req, res) =>{
        adminHelpers.UnlistCategory(req.params.id).then((response) =>{
            res.redirect('/admin/category');
        })       
    },

    getOrders : async(req, res) =>{
        let orders = await orderHelpers.ordersList();
        orders.map((order)=>{
            order.total = order.total.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
            order.createdOn = (order.createdOn).toLocaleDateString('es-ES')
        })
        res.render('admin/order-list', {admin: true, orders});
    },

    OrderStatus : (req, res) =>{
        try {
            console.log( req.body.userId , req.body.status)
            orderHelpers.changeOrderStatus(req.body.userId, req.body.status).then((response) =>{
                response.status = true;
                res.json(response)
            })
        } catch (error) {
            console.log(error)
        }
    },

    returnWallet : (req, res) =>{
        console.log("this is return wallet -------", req.body);
        orderHelpers.addReturnWallet(req.body.userId, req.body.orderId).then((response) =>{
            orderHelpers.changeOrderStatus(req.body.orderId, req.body.status).then((resp)=>{
                res.json(response);
            })
        })
    },

    getOrderDetails : async(req, res) =>{
        let products = await orderHelpers.getOrderedProducts(req.params.id);
         orderHelpers.getUserOrder(req.params.id).then((orderDetails)=>{
            orderDetails.createdOn = orderDetails.createdOn.toLocaleDateString('es-ES', { timeZone: 'UTC' });
            res.render('admin/order-details', {admin: true, products, orderDetails})
        })
    },


    salesReport : async(req, res) =>{
        let orders = await orderHelpers.deliveredOrders();
        orders.forEach(order => {
            const date = new Date(order.createdOn);
            order.createdOn = date.toLocaleDateString('es-ES',  { timeZone: 'UTC' });;
            order.total = order.total.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
          });
        res.render('admin/sales-report', {admin: true, orders})
    },

    salesFilter : async(req, res) =>{
        try {
            let orders = await orderHelpers.filterReport(req.body.startDate, req.body.endDate);
            console.log(orders);
            orders.forEach(order => {
                const isoDate = order.createdOn;
                const date = new Date(isoDate);
                const options = { timeZone: 'UTC' };
                const localDateString = date.toLocaleDateString('es-ES', options);
                order.createdOn = localDateString;
            });
            res.render('admin/sales-report', {admin: true, orders});

        } catch (error) {
            console.log(error)
        } finally {
        }
        
        
    },


    


    

    


}