

// Fire base otp

const firebaseConfig = {
    apiKey: "AIzaSyC3MIN64hy_oTQfQWUHl0lID-CJkIfci0M",
    authDomain: "yt-project-a29f8.firebaseapp.com",
    projectId: "yt-project-a29f8",
    storageBucket: "yt-project-a29f8.appspot.com",
    messagingSenderId: "159898773748",
    appId: "1:159898773748:web:2985334de4f06ff73356a1",
    measurementId: "G-DLWR9M5SJC"
  };
  // initializing firebase SDK
  firebase.initializeApp(firebaseConfig);
  
  // render recaptcha verifier
  render();
  function render() {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    recaptchaVerifier.render();
  }
  
  // function for send OTP

  function phoneAuth() {
    var number = "+91 "+document.getElementById('number').value;
    console.log(number)
    axios({
      url:'/otp-verify',
      method: 'post',
      data:{
        mobile: number
      },
    })
      .then((response) =>{
        console.log(response);
        if(response.data.status){
          console.log("user fond--------");
  
          firebase.auth().signInWithPhoneNumber(number, window.recaptchaVerifier).then(function (confirmationResult) {
            console.log("this is confirmation result------")
            window.confirmationResult = confirmationResult;
            coderesult = confirmationResult;
            document.getElementById('sender').style.display = 'none';
            document.getElementById('verifier').style.display = 'block';
            console.log('OTP Sent ......');
  
            var time_limit = 30;
            var time_out = setInterval(() => {
  
              if(time_limit == 0) {
               $('#timer').html('<p class="text-primary"> Resend OTP</p>')
              } else {
                if(time_limit < 10) {
                  time_limit = 0 + '' + time_limit;
                }
                $('#timer').html('00:' + time_limit);
                time_limit -= 1;
              }
  
            }, 1000);
  
          }).catch(function (error) {
            // error in sending OTP
            console.log("this is otp error-----")
            alert(error.message);
          });
  
        }else{
          console.log("user not fount --------")
          document.getElementById('senderErr').innerHTML = "This Number is not registered yet!"
          //alert("user not found");
        }
      })
  }
  
  // function for OTP verify
  function codeverify() {
    var code = document.getElementById('verificationcode').value;
    console.log(code)
    
    coderesult.confirm(code).then(function () {
       // document.getElementById('verifySuccess').innerHTML = "OTP Verified"
       // document.getElementById('p-conf').style.display = 'block';
       // document.getElementById('n-conf').style.display = 'none';
        console.log('OTP Verified');
        axios({
          url: '/otp-user-data',
          method: 'post'
        })
        location.href = '/'; 
  
    }).catch(function () {
         document.getElementById('verifyErr').innerHTML = "Incorrect OTP"
         //document.getElementById('p-conf').style.display = 'none';
         //document.getElementById('n-conf').style.display = 'block';
        console.log('OTP Not correct');
    })
  }
  