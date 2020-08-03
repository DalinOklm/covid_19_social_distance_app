const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')


const in_storeUser_schema = new mongoose.Schema({
    name: {
        type: String
    },
    surname: {
        type: String
    },
    cellnumber: {
        type: String
    },
    age: {
        type: String
    },
    item: {
        type: String
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
// store Token from jwt here
tokens: [{
    token: {
        type: String,
        required: true
          }
     }]

},
{
    timestamps: true
    
})

const in_storeUser = mongoose.model('in_storeUser', in_storeUser_schema)

module.exports = in_storeUser 
