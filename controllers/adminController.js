var db = require('../config/connection');
var collection = require('../config/collection');
const userHelpers = require('../helpers/user-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const productHelpers = require('../helpers/product-helpers');
const cloudinary = require('../utils/cloudinary');
const path = require('path');
const { ObjectId } = require('mongodb-legacy');
const async = require('hbs/lib/async');
// const { map } = require('../app');
const objectId = require('mongodb-legacy').ObjectId;

module.exports = {

    adminlogin : (req,res) =>{   
        if(req.session.adminloggedin){
            res.redirect('/admin');
            // res.render('admin/dashboard', {admin:true});
        }else{
            res.render('admin/admin-login', {admlogErr: req.session.admlogErr, loginForm: true});
            req.session.admlogErr = false;        
        }
    },

    dashboard : (req, res) =>{
        res.render('admin/dashboard', {admin:true});
    },

    postAdminlogin : async(req, res) => {
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
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
        console.log(req.body)
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
    
    getCoupons : (req, res) =>{
        res.render('admin/view-coupons', {admin: true});
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
            console.log("try fond error",err);
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
        console.log(req.body);
        adminHelpers.addCatergory(req.body).then((response) =>{
            if(response.status == false){
                req.session.categoryErr = "This category is already Exist";
            }else{
                res.redirect('/admin/category');
            }
            
        })
    },

    editCategory :  async(req, res) =>{
        await adminHelpers.updateCategory(req.params.id, req.body.name).then(()=>{
            res.redirect('/admin/category');
        })
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
        let orders = await adminHelpers.ordersList();
        console.log(orders)
        orders.map((order)=>{
            order.createdOn = (order.createdOn).toLocaleDateString('es-ES')
        })
        res.render('admin/order-list', {admin: true, orders});
    },

    OrderStatus : (req, res) =>{
        console.log("ooooooooooooooooooooooooo");
        console.log( req.body.userId , req.body.status)
        adminHelpers.changeOrderStatus(req.body.userId, req.body.status).then((response) =>{
            // res.redirect('/admin/order-list');
            console.log("ooooooooooooooooooooooooo");
            console.log(response);
            response.status = true;
            res.json(response)
        })
    },

    getOrderDetails : async(req, res) =>{
        let products = await productHelpers.getOrderedProducts(req.params.id);
         adminHelpers.getUserOrder(req.params.id).then((orderDetails)=>{
            console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKKKK",orderDetails)
            // orderDetails.map((order)=>{
            //     order.createdOn = (order.createdOn).toLocaleDateString('es-ES')
            // })
            res.render('admin/order-details', {admin: true, products, orderDetails})
        })
        
    },




    

    


}