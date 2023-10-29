const { default: mongoose } = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  state: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
  readCount: {
    type: Number,
    default: 0,
  },
  readingTime: {
    // type: Date,
    type: Number
  },
  tags: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  timeStamp: {
    type: Date,
    default: new Date(),
  },
  body: {
    type: String,
    required: true,
  },
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
