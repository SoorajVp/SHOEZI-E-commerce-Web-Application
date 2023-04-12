

jQuery('#loginForm').validate({
    rules:{
        emailId:{
            require: true,
            email: true
        }
    },
    messages:{
        emailId:{
            email:"* Please Enter a Valid Email"
        }
    }
})


jQuery('#formValidate').validate({
    rules:{
        password1: {
            required : true,
            minlength : 8
        },
        password2: {
            required : true,
            equalTo : '#password1'
        }
    },
    messages:{
        password1: {
            required : '* Please enter your new Password',
            //minlength : '* Enter atleast 8 characters',
        },
        password2: {
            required : '* Please repeat that Password',
            equalTo : '* Password not Matching ...'
        }
    }
})



jQuery('#addressValidate').validate({
    rules:{
        name: required,
        mobile: number,
        address: required,
        city: required,
        district: required,
        pincode: required
    },
    messages:{
        name: "enter your name"
    }
})


