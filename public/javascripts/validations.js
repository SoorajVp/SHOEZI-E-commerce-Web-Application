


jQuery('#addressForm').validate({
    rules:{
        name:required,
        mobile:{
            required: true,
            number: true,
            minlength: 10,
            maxlength: 10
        },
        city: required,
        address: required,
        pincode: {
            required: true,
            number: true,
            minlength: 6
        }
    },
    messages:{
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

