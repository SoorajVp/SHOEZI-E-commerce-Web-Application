// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure



const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_SID;
const client = require('twilio')(accountSid, authToken);

module.exports = {



sendOtp : (mobile) =>{
    return new Promise((resolve, reject) =>{
        mobile = Number(mobile);
        console.log(mobile);
        client.verify.v2.services(serviceId)
        .verifications
        .create({to: `+91${mobile}`, channel: 'sms'})
        .then(verification => {
            console.log("Then console varification status...",verification.status);
            resolve(verification.status)
        })         
        .catch((err)=>{
            console.log(`console error: ${err}`);
        });
    })
},

verifyOtp : (mobile, otp) =>{
    return new Promise((resolve, reject) =>{
        mobile = Number(mobile);
        console.log("entered otp ---", otp);
        client.verify.v2.services(serviceId)
        .verificationChecks
        .create({to: `+91${mobile}`, code: `${otp}`})
        .then(verification_check => {
            console.log("Then varification checking  status...",verification_check.status)
          
            resolve(verification_check.status);
            
        });
    })
}


}
