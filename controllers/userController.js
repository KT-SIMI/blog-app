const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Tag = require("../models/tagModel");
const Blog = require("../models/blogModel");

exports.signup = catchAsync(async (req, res, next) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const password = req.body.password;

  const emailExits = await User.findOne({ email: email });

  if (emailExits)
    return res
      .status(401)
      .json({ status: "error", msg: "Email already exists" });

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.PWD_HASH_LENGTH)
  );

  const user = new User({
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: hashedPassword,
  });

  await user.save();

  const q = await User.findOne({ _id: user._id }, { password: 0 });

  res.status(200).json({ status: "success", msg: "signed up", data: q });

  //   res.redirect("/signin");
});

exports.signin = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    //   alert("Invalid email and/or password");
    //   return res.status(400).render("/login");
    return res.status(401).json({ status: "error", msg: "Unautorized" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    //   alert("Invalid email and/or password");
    //   return res.status(401).render("/signup");
    return res.status(401).json({ status: "error", msg: "Unautorized" });
  }

  const isPasswordValid = bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    //   alert("Invalid email and/or password");
    //   return res.status(401).render("/login");
    return res.status(401).json({ status: "error", msg: "Unautorized" });
  }

  const payload = { userId: user._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "400h",
  });
  req.session.token = token;

  const q = { user: `${user.firstname} ${user.lastname}`, email: user.email };

  res.status(200).json({ status: "success", msg: "Signed in", data: q });
});

exports.createTag = catchAsync(async (req, res, next) => {
  const tag = new Tag({
    name: req.body.name,
  });

  await tag.save();

  const q = await Tag.findOne({ _id: tag._id });

  res.status(200).json({ status: "success", msg: "Tag created", data: q });
});

exports.getTags = catchAsync(async (req, res, next) => {
  const q = await Tag.find();

  res
    .status(200)
    .json({ status: "success", msg: "Tags Gotten", data: q ?? null });
});

exports.getBlog = catchAsync(async (req, res, next) => {
  const author = req.body.author;
  const tags = req.body.tags;
  if (author) {
    const authorExists = await User.findOne({ author, state: "published" });

    if (!authorExists)
      return res
        .status(401)
        .json({ status: "success", msg: "Author does not exist" });

    const q = await Blog.find({ author: author, state: "published" }).sort({
      readCount: -1,
      readingCount: -1,
      timeStamp: -1,
    });

    return res
      .status(200)
      .json({ status: "success", msg: "Blogs gotten by author", data: q });
  } else if (tags) {
    const tagExists = await Tag.findOne({ tags });

    if (!tagExists)
      return res
        .status(404)
        .json({ status: "success", msg: "Tag does not exist" });

    const q = await Blog.find({ $in: { tags: tags }, state: "published" }).sort({
      readCount: -1,
      readingCount: -1,
      timeStamp: -1,
    }); // check logic today

    res
      .status(200)
      .json({ status: "success", msg: "Blogs gotten by author", data: q });
  }

  const q = await Blog.find({ state: "published" }).sort({
    readCount: -1,
    readingCount: -1,
    timeStamp: -1,
  });

  res
    .status(200)
    .json({ status: "success", msg: "Blogs gotten", data: q ?? null });
});

exports.getSingleBlog = catchAsync(async (req, res, next) => {});
