const Blog = require("../models/blogModel");
const Tag = require("../models/tagModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getIndex = catchAsync(async (req, res) => {
  const userId = req.user.userId

  const user = await User.findOne({ _id: userId })

  const blogs = await Blog.find({ state: "published" })

  const tags = await Tag.find({ blogs: { $ne: [] } });
  const blogId = []
  const authors = [];

  function pushAuthorId(authorId) {
    const idString = authorId.toString()
    if (!blogId.includes(idString)) {
      blogId.push(idString)
    }
  }

  blogs.forEach(blog => pushAuthorId(blog.author))

  for (const singleBlogId of blogId) {
    const author = await User.findOne({ _id: singleBlogId });
    authors.push(author);
  }


  res.status(200).render("index", {
    blogs,
    authors,
    tags,
    user
  })
})

exports.getSingleBlog = catchAsync(async (req, res) => {
  const userId = req.user.userId

  const user = await User.findOne({ _id: userId })

  const blogId = req.params.blogId

  const blog = await Blog.findOne({ _id: blogId })

  await blog.updateOne({ $inc: { readCount: 1 } })

  res.status(200).render("verifiedBlog", {
    user,
    blog
  })
})

exports.getSingleTag = catchAsync(async (req, res) => {
  const userId = req.user.userId

  const user = await User.findOne({ _id: userId })

  const tagId = req.params.tagId

  const tag = await Tag.findOne({ _id: tagId })

  const blogs = []

  const blogIds = tag.blogs


  for (const blogId of blogIds) {
    const blog = await Blog.findOne({ _id: blogId, state: "published" })

    if (blog === null) {
      await Tag.updateOne({ _id: tagId }, {
        $pull: { blogs: blogId }
      })
    } else {
      blogs.push(blog)
    }
  }

  res.status(200).render("verifiedTag", {
    user,
    tag,
    blogs
  })
})

exports.getSingleAuthor = catchAsync(async (req, res) => {
  const userId = req.user.userId

  const user = await User.findOne({ _id: userId })

  const authorId = req.params.authorId

  const author = await User.findOne({ _id: authorId })

  const blogs = []
  const blogIds = author.blogs


  for (const blogId of blogIds) {
    const blog = await Blog.findOne({ _id: blogId })

    if (blog === null) {
      await User.updateOne({ _id: authorId }, {
        $pull: { blogs: blogId }
      })
    } else {
      blogs.push(blog)
    }
  }

  res.status(200).render("verifiedAuthor", {
    author,
    user,
    blogs
  })
})

exports.getProfile = catchAsync(async (req, res) => {
  const userId = req.user.userId

  const user = await User.findOne({ _id: userId })

  const blogIds = user.blogs

  const blogs = []

  for (const blogId of blogIds) {
    const blog = await Blog.findOne({ _id: blogId })
    if (blog === null) {
      await User.updateOne(
        { _id: user._id },
        {
          $pull: { blogs: blogId },
        }
      );
    }
    blogs.push(blog)
  }
  res.status(200).render("profile", {
    user,
    blogs
  })
})

exports.getWriteBlog = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const tags = await Tag.find()

  const user = await User.findOne({ _id: userId })

  res.status(200).render("writeBlog", {
    tags,
    user
  })
})

exports.writeBlog = catchAsync(async (req, res) => {
  const title = req.body.title
  const selectedTags = req.body.tags
   const body = req.body.body
   const state = req.body.state
   const description = req.body.description

  const userId = req.user.userId

  const user = await User.findOne({ _id: userId })

  const words = body.split(" ")
  const wordNumber = words.length;
  const readingTime = Math.ceil(wordNumber / 30)

  const titleExists = await Blog.findOne({ title: title });

  if (titleExists) {
    res.status(401).redirect("/views/verified/blogCreate");
  }


  const blog = new Blog({
    title,
    description,
    author: userId,
    tags: selectedTags,
    body,
    readingTime,
    state,
    authorName: `${user.firstname} ${user.lastname}`
  })

  await blog.save()

  for (const selectedTag of selectedTags) {
    if (selectedTag !== '') {
   
    await Tag.updateOne({ _id: selectedTag }, {
      $push: { blogs: blog._id }
    })

    } else {
      console.log("Tag doesn't exist")
    }
 
  }
  await User.updateOne({ _id: blog.author }, {
    $push: { blogs: blog._id }
  })

  res.set("Content-Type", "application/json")

  res.status(200).redirect(`/views/verified/getSingleBlog/${blog._id}`)
})

exports.getEditBlog = catchAsync (async (req, res) => {
  const userId = req.user.userId
  const blogId = req.params.id

  const blog = await Blog.findOne({ _id: blogId })

  const user = await User.findOne({ _id: userId })
  const tags = await Tag.find()

  res.status(200).render("editBlog", {
    blog,
    tags,
    user,
  })
})

exports.editBlog = catchAsync (async (req, res) => {
  const title = req.body.title
  const selectedTags = req.body.tags
   const body = req.body.body
   const state = req.body.state
   const description = req.body.description

  const blogId = req.params.id
  const words = body.split(" ")
  const wordNumber = words.length;
  const readingTime = Math.ceil(wordNumber / 30)

  // const titleExists = await Blog.findOne({ title: title });

  // if (titleExists) {
  //   res.status(401).redirect("/views/verified/blogCreate");
  // }



  const blog = await Blog.findOne({ _id: blogId })



  await blog.updateOne({
    title: title,
    description: description,
    tags: selectedTags,
    body: body,
    readingTime: readingTime,
    state: state,
  })


  for (const selectedTag of selectedTags) {

    const isBlogAdded = await Tag.findOne({
      _id: selectedTag,
      blogs: { $in: [blogId] }
    });
    

    if (!isBlogAdded) {
    await Tag.updateOne({ _id: selectedTag }, {
      $push: { blogs: blogId }
    })
  }
  }

  // res.set("Content-Type", "application/json")

  res.status(200).redirect(`/views/verified/getSingleBlog/${blogId}`)
})