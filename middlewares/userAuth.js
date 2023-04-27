const userHelpers = require("../helpers/user-helpers");

module.exports = {
    
    varifyLogin : async(req, res, next) =>{
        if(req.session.loggedin){
            let user = await userHelpers.findUser(req.session.user._id);
            console.log("this is user from middleware ---------------------------", user)

            if(user.status) {
                req.session.user = user;
                next();
            }else{
                user = false;
                req.session.loggedin = false;
                req.session.user = false;
                req.session.logErr = "This Account is Blocked";
                res.redirect("/login");
            }

            
        }else{
            res.redirect('/login');
        }
    }
}