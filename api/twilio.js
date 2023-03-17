// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_SID;
const client = require('twilio')(accountSid, authToken);



sendOtp : (mobile) =>{
    return new Promise((resolve, reject) =>{
        client.verify.v2.services(serviceId)
        .verifications
        .create({to: `+91${mobile}`, channel: 'sms'})
        .then(verification =>
            console.log(verification.status))
            resolve(verification.status);
    })
}

