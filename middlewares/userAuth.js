const userHelpers = require("../helpers/user-helpers");

module.exports = {
    
    varifyLogin : async(req, res, next) =>{
        if(req.session.loggedin){
            let user = await userHelpers.findUser(req.session.user._id);
            req.session.user = user;
            next();
        }else{
            res.redirect('/login');
        }
    }
}