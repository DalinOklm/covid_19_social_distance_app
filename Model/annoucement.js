const mongoose = require('mongoose')

const annoucement_schema = new mongoose.Schema({
    title: {
        type: String
    },
    subtitle: {
        type: String
    },
    paragraph: {
        type: String
    }
},
{
    timestamps: true
})


const annoucement = mongoose.model('annoucement', annoucement_schema)

module.exports = annoucement