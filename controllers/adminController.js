var db = require('../config/connection');
var collection = require('../config/collection');
const userHelpers = require('../helpers/user-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const productHelpers = require('../helpers/product-helpers');
const cloudinary = require('../utils/cloudinary');
const path = require('path');
const { ObjectId } = require('mongodb-legacy');
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
        if(req.session.adminloggedin){
            res.render('admin/dashboard', {admin:true});
           
        }else{
            res.redirect('/admin/login');
        }     
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
        if(req.session.adminloggedin){
            adminHelpers.getUserData().then((users) =>{
                res.render('admin/view-users', {users, admin:true});
            }) 
        }else{
            res.redirect('/admin/login');
        }
    },

    blockUser : (req, res) =>{
        let userId = req.params.id;
        console.log((userId));
        adminHelpers.blockUser(userId).then((response) =>{

            res.redirect('/admin/users');
        })
    },

    unblockUser : (req, res) => {
        let userId = req.params.id;
        console.log(userId);
        adminHelpers.unblockUser(userId).then((response) =>{
            res.redirect('/admin/users');
        })
    },

    getAllProducts : (req, res) =>{
        if(req.session.adminloggedin){
            productHelpers.getAllProducts().then((products) => {
                console.log("@#$%^%^&^%YU", products.category);
                res.render('admin/view-products', {admin:true, products});
            })
        }else{
            res.redirect('/admin/login');
        }
           
    },

    addProducts : async (req, res) =>{
        if(req.session.adminloggedin){

            await adminHelpers.getCategory().then((category)=>{
                console.log("This is add products category list........",category);
                res.render('admin/add-products', {admin:true, category})
            })
        }else{
            res.redirect('/admin/login');
        }
        
    },

    addProductsPost : async(req, res) =>{
        try{
            productHelpers.addProducts(req.body, async(id) =>{             
                let imgUrls = [];
                for(let i=0; i<req.files.length; i++){
                    
                    let result = await cloudinary.uploader.upload(req.files[i].path);
                    console.log("Cloudinary image url.........", result.url);
                    imgUrls.push(result.url);                   

                } 
                if(imgUrls.length !== 0){
                    console.log("Images exits if condition reached.............id", id);
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
        console.log(req.params.id);
        let category = await adminHelpers.getCategory();
        console.log("edit product category ......", category);
         let product = await productHelpers.getProductDetails(req.params.id);
         console.log(product);
        res.render('admin/edit-products',{admin: true, product, category });
    },

    editProductPost : async (req, res) =>{
        console.log("Editeeeeddd prodd........",req.params.id);
        try{
            
            let imgUrls = [];
                for(let i=0; i<req.files.length; i++){
                    
                    let result = await cloudinary.uploader.upload(req.files[i].path);
                    console.log("Cloudinary image uploaded.........", result.url);
                    imgUrls.push(result.url);
        
                } 
                if(imgUrls.length !== 0){
                    console.log("Images updating condition reached.............id", req.params.id);
                    productHelpers.updateImage(req.params.id, imgUrls);
                }
                console.log(" this is update products id .....", req.params.id);
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
        if(req.session.adminloggedin){
            res.render('admin/add-banners', {admin: true});
        }
    },

    findBanners : (req, res) =>{
        if(req.session.adminloggedin){
            adminHelpers.getBanners().then((Banners) =>{
                res.render('admin/view-banners', {admin: true, Banners});
            }); 
        }else{
            res.redirect('/admin/login');
        }
              
    },

    bannerPost : (req, res) =>{
        try{
            adminHelpers.addBanners(req.body, async(id) =>{
                
                let result = await cloudinary.uploader.upload(req.file.path);
                console.log("Banner image url.........", result.url);

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
        console.log("banner id,,,,,,,,,,", req.params.id);
        console.log("req.file ,,,,,,,,,,", req.file);

        try{

            console.log("banner id,,,,,,,,,,", req.params.id);
            adminHelpers.updateBanner(req.params.id, req.body);
            
            let result = await cloudinary.uploader.upload(req.file.path);
            console.log("updating url......",result.url);
            

            if(result.url){
                console.log("banner image id,,,,,,,,,,", req.params.id);
                adminHelpers.updateBannerImg(req.params.id, result.url);
            }
            
            
        }catch(err){
            console.log("try fond error",err);
        }finally{
            res.redirect('/admin/banners');
        }
    },

    categoryView : async(req, res) =>{
        await adminHelpers.getCategory().then((category) =>{
            res.render('admin/category', {admin: true, category});
        })        
    },

    categoryPost : (req, res) =>{
        console.log("##########################",req.body);
        adminHelpers.addCatergory(req.body).then(() =>{
            res.redirect('/admin/category');
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

    


}