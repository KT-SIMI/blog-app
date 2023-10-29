const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
         required: true,
    },
    lastname: {
        type: String,
         required: true, 
    },
    email: {
        type: String,
         required: true,
         unique: true,
    },
    password: {
        type: String,
         required: true,
    },
    blogs: {
        type: [mongoose.Schema.Types.ObjectId]
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User