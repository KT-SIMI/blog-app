const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Tag = require("../models/tagModel");
const Blog = require("../models/blogModel");



exports.getSignup = catchAsync(async (req, res) => {
  res.status(200).render("signup")
})


exports.signup = catchAsync(async (req, ret) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const password = req.body.password;

  const emailExits = await User.findOne({ email });

  if (emailExits)
    return res
      .status(401)
      .json({ status: "error", msg: "Email already exists" });

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.PWD_HASH_LENGTH)
  );

  const user = new User({
    firstname,
    lastname,
    email,
    password: hashedPassword,
  });

  await user.save();



  res.redirect("/views/signin");

});

exports.getSignin = catchAsync(async (req, res) => {
  res.status(200).render("login")
})


exports.signin = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(401).json({ status: "error", msg: "Unautorized" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ status: "error", msg: "Unautorized" });
  }
  const isPasswordValid = bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    ;
    return res.status(401).json({ status: "error", msg: "Unautorized" });
  }

  const payload = { userId: user._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "720h",
  });
  req.session.token = token;


  res.status(200).redirect("/views/verified/")
});


exports.getLogout = catchAsync(async (req, res) => {
  req.session.token = null;
  req.session.save(function (err) {
    if (err) next(err);

    req.session.regenerate(function (err) {
      if (err) next(err);

      res.redirect("/views/login");
    });
  });
});


exports.getHome = catchAsync(async (req, res) => {
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


  res.status(200).render("homepage", {
    blogs,
    authors,
    tags
  })
})

exports.getSingleBlog = catchAsync(async (req, res, next) => {
  const blogId = req.params.blogId

  const blog = await Blog.findOne({ _id: blogId })

  await blog.updateOne({ $inc: { readCount: 1 } })

  res.status(200).render("blog", {
    blog
  })
})

exports.getSingleTag = catchAsync(async (req, res) => {
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

  res.status(200).render("tag", {
    tag,
    blogs
  })
})

exports.getSingleAuthor = catchAsync ( async (req, res) => {
  const authorId = req.params.authorId

  const author = await User.findOne({ _id: authorId })

  const blogs = []
  const blogIds = author.blogs


  for (const blogId of blogIds) {
    const blog = await Blog.findOne({ _id: blogId })

    if (blog === null) { 
      await User.updateOne({ _id: authorId }, { 
        $pull: { blogs: blogId}
      })
    } else {
    blogs.push(blog)
    }
  }

  res.status(200).render("author", {
    author,
    blogs
  })
})


