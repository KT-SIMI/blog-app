const { default: mongoose } = require("mongoose");

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    blogs: {
        type: [mongoose.Schema.Types.ObjectId],

    }
});

const Tag = mongoose.model('Tag', tagSchema)

module.exports = Tag

