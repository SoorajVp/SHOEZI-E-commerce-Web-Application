
module.exports = {

    varifyLogin : (req, res, next) => {
        if(req.session.adminloggedin){
            next();
        }else{
            res.redirect('/admin/login')
        }
    }
    
}