const mongoose = require('mongoose')

const ConnectDB = ()=>{
    mongoose.connect(process.env.MONGOOSE_URI).then(()=>{
        console.log('Connected to DB....');
    }).catch(()=>{
        console.log('Failed to Connect to DB');
    })
}

module.exports = ConnectDB;