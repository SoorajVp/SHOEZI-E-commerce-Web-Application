

jQuery('#loginForm').validate({
    rules:{
        emailId:{
            require: true,
            email: true
        }
    },
    messages:{
        emailId:{
            email:"* Please enter a valid Email"
        }
    },
    submitHandler: function(form) {
        // do something here
        form.submit();
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
            required : '* Please enter your new Password'
        },
        password2: {
            required : '* Please repeat that Password',
            equalTo : '* Password not Matching ...'
        }
    },
    submitHandler: function(form) {
        // do something here
        form.submit();
    }
})



$().ready(() =>{
    $('#addressValidate').validate({
        rules :{
            mobile:{
                required: true,
                number: true,
                noSpace: true,
                minlength: 10,
                maxlength: 10
            },
            district: {
                required: true,
                notEqualTo: '--- District ---'
            },
            pincode: {
                required: true,
                number: true,
                minlength: 6,
                maxlength: 6
            }
        },
        messages: {
            mobile: "Enter a valid mobile number.",
            pincode: "Enter a valid pincode.",
            district: "Choose your district."
        },
        submitHandler: function(form) {
            // do something here
          form.submit();
        }
    });
})



jQuery('#ProductFormValidate').validate({
    rules: {
      discount: {
        required: true,
        range: [0, 100]
      },
      quantity: {
        required: true,
        range: [0, 1000]
      },
    },
    submitHandler: function(form) {
      // do something here
      form.submit();
    }
  });


  jQuery('#CategoryForm').validate({
    submitHandler: function(form) {
        // do something here
        form.submit();
      }
  })

  jQuery('#CategoryEditForm').validate({
    submitHandler: function(form) {
        // do something here
        form.submit();
      }
  })

  jQuery('#BannerForm').validate({
    submitHandler: function(form) {
        // do something here
        form.submit();
      }
  })

  jQuery('#CouponForm').validate({
    rules: {
        discount : {
            required: true,
            range: [0, 100]
        }
    },
    submitHandler: function(form) {
        // do something here
        form.submit();
      }
  })


