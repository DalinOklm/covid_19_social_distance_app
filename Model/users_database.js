const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')


// mongoose.connect('mongodb://127.0.0.1:27017/lineUp_users', {
//     useNewUrlParser: true,
//     useCreateIndex:true,
//     useUnifiedTopology:true
// })

const users_schema = new mongoose.Schema({
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

//generate token and save in mongoDb doc
users_schema.methods.makeToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisrun')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token


}

// using middleware to encrypt password
users_schema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})



users_schema.statics.findBy_Identity = async (username, password) => {
    const user = await user_line.findOne({ username })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}


const user_line = mongoose.model('user_lines', users_schema)

module.exports = user_line 