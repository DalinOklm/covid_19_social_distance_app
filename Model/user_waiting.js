const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')


const users_waiting_schema = new mongoose.Schema({
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

const users_waiting = mongoose.model('users_waiting', users_waiting_schema)

module.exports = users_waiting 
