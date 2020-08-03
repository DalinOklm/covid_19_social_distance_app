const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')


mongoose.connect('mongodb+srv://new_user_one:%39%30%30%31%30%30@customercouter-uk7nd.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex:true,
    useUnifiedTopology:true
})

// mongoose.connect('mongodb://127.0.0.1:27017/NolineUp', {
//     useNewUrlParser: true,
//     useCreateIndex:true,
//     useUnifiedTopology:true
// })

const admin_schema = new mongoose.Schema({
    storename: {
        type: String
    },
    address: {
        type: String
    },
    shoppingcenter: {
        type: String
    },
    username: {
        type: String
    },
    storemanager: {
        type: String
    },
    password: {
        type: String,
        required: true,
        // must be at least 7 characters
        minlength: 7,
        trim: true
    }
},
{
    timestamps: true
})

// using middleware to encrypt password
admin_schema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})



admin_schema.statics.findBy_Identity = async (username, password) => {
    const admin = await admin_line.findOne({ username })

    if (!admin) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return admin
}

const admin_line = mongoose.model('admin_line', admin_schema)

module.exports = admin_line 