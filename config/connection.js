const mongoClient = require('mongodb-legacy').MongoClient
const state = {
    db : null
}

module.exports.connect = (done) => {
    
    const url = process.env.MONGODB_URL
    const dbname = 'SHOEZI';

    mongoClient.connect(url,(err,data) => {
        if(err)return done(err)
        state.db = data.db(dbname);
        done()
    })
}

module.exports.get = () =>{
    return state.db;
}
