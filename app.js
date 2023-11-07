const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");

require("dotenv").config();

(async () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    console.log(`DB connected`);
  } catch (err) {
    console.log("DB error :::::::", err);
    process.exit(1);
  }
})();

const { auth } = require("./middleware/auth");
const User = require("./models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Tag = require("./models/tagModel");
const Blog = require("./models/blogModel");

const app = express();
const sessOption = {
  secret: process.env.SESSION_SECRET,
  // proxy: true,
  cookie: {
    // sameSite: "none",
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, //3 days
  },
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_STORE,
    ttl: 14 * 24 * 60 * 60,
    autoRemove: "native",
  }),
};

// sessOption.cookie.secure = false;

const corsOptions = {
  origin: ["http://localhost:4004"],
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  // methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
  // exposedHeaders: ["set-cookie"]
};

app.use(cors(corsOptions));
app.set("Content-Type", "application/json");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessOption));
app.set("view engine", "ejs");

app.get("/homepage", async (req, res) => {
  // const page = req.query.page || 1;
  // const perPage = 20;
  // const start = (page - 1) * perPage;
  // console.log(start);
  // const end = start + perPage;
  const blog = await Blog.find({ state: "published" }).sort({
    // readCount: -1,
    readingCount: -1,
    timeStamp: -1,
  });

  // const paginatedBlogs = blog.slice(start, end);
  // const totalPages = Math.ceil(blog.length / perPage);
  // const UserId = req.user.userId;
  // const user = await User.findOne({ _id: UserId });
  const tags = await Tag.find();

  const authors = [];

  for (let i = 0; i < blog.length; i++) {
    const singleBlog = blog[i];
    const author = await User.findOne({ _id: singleBlog.author });
    authors.push(author);
  }

  res.render("homepage.ejs", {
    blogs: blog,
    // totalPages,
    authors: authors,
    tags: tags,
    // currentPage: page,
  });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const password = req.body.password;

  const emailExist = await User.findOne({ email: email });

  if (emailExist) {
    res.status(401).send("email does not exist");
  }

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

  res.status(200).redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Invalid email and/or password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).send("Invalid email and/or password");
  }

  const isPasswordValid = bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).send("Invalid email and/or password");
  }

  const payload = { userId: user._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  req.session.token = token;

  res.status(200).redirect("/");
});

app.get("/logout", (req, res) => {
  req.session.token = null;
  req.session.save(function (err) {
    if (err) next(err);

    req.session.regenerate(function (err) {
      if (err) next(err);

      res.redirect("/login");
    });
  });
});

app.get("/", auth, async (req, res) => {
  // const page = req.query.page || 1;
  // const perPage = 20;
  // const start = (page - 1) * perPage;
  // console.log(start);
  // const end = start + perPage;
  const blog = await Blog.find({ state: "published" });
  // console.log(blog)

  // .sort({
  //   readCount: -1,
  //   readingCount: -1,
  //   timeStamp: -1,
  // });

  // const paginatedBlogs = blog.slice(start, end);
  // const totalPages = Math.ceil(blog.length / perPage);
  const UserId = req.user.userId;
  const user = await User.findOne({ _id: UserId });
  const tags = await Tag.find();

  const authors = [];

  for (let i = 0; i < blog.length; i++) {
    const singleBlog = blog[i];
    const author = await User.findOne({ _id: singleBlog.author });
    authors.push(author);
  }

  // console.log(authors)

  res.render("index.ejs", {
    blogs: blog,
    // totalPages,
    authors: authors,
    user: user,
    tags: tags,
    // currentPage: page,
  });
});

app.get("/blogCreate", auth, async (req, res) => {
  const UserId = req.user.userId;
  const tags = await Tag.find();

  const s = await User.findOne({ _id: UserId });
  res.render("writeBlog.ejs", {
    tags: tags,
    user: s,
  });
});

app.post("/blogCreate", auth, async (req, res) => {
  // console.log(req.body)
  const title = req.body.title;
  const selectedTags = req.body.tags;
  const body = req.body.body;
  const state = req.body.state;
  // console.log(body)
  const UserId = req.user.userId;
  const user = await User.findOne({ _id: UserId });
  const words = body.split(" ");
  const wordNumber = words.length;
  const readingTime = Math.ceil(wordNumber / 30);
  const titleExists = await Blog.findOne({ title: title });

  // console.log(title);
  // console.log(selectedTags);

  if (titleExists) {
    res.status(401).render("/blogCreate");
  }

  const blog = new Blog({
    title: title,
    description: req.body.description,
    author: UserId,
    tags: selectedTags,
    body: body,
    readingTime: readingTime,
    state: state,
    authorName: `${user.firstname} ${user.lastname}`,
  });

  for (let i = 0; i < selectedTags.length; i++) {
    const tagId = selectedTags[i];

    await Tag.updateOne(
      { _id: tagId },
      {
        $push: { blogs: blog._id },
      }
    );
  }
  await User.updateOne(
    { _id: blog.author },
    {
      $push: { blogs: blog._id },
    }
  );

  await blog.save();
  res.set("Content-Type", "application/json");

  res.status(200).redirect("/");
});

app.get("/profile", auth, async (req, res, next) => {
  const UserId = req.user.userId;

  const user = await User.findOne({ _id: UserId });

  const userBlogs = user.blogs;

  const blogs = [];

  for (let i = 0; i < userBlogs.length; i++) {
    const singleBlogId = userBlogs[i];
    const blog = await Blog.findOne({ _id: singleBlogId });

    if (blog == null) {
      await User.updateOne(
        { _id: user._id },
        {
          $pull: { blogs: singleBlogId },
        }
      );
    }
    blogs.push(blog);
  }

  // console.log(blogs)
  res.status(200).render("profile.ejs", {
    user: user,
    blogs: blogs,
  });
});

app.get("/getSingleBlog/:id", async (req, res) => {
  const blogId = req.params.id;

  const blog = await Blog.findOne({ _id: blogId });

  await Blog.updateOne(
    { _id: blog._id },
    {
      $inc: { readCount: 1 },
    }
  );

  res.status(200).render("blog.ejs", {
    blog,
  });
});

app.get("/getTag/:id", async (req, res, next) => {
  const tagId = req.params.id;

  const tag = await Tag.findOne({ _id: tagId });

  const tagBlogs = tag.blogs;
  const publishedTagBlogs = [];

  for (i = 0; i < tagBlogs.length; i++) {
    const tagBlog = tagBlogs[i];

    const blog = await Blog.findOne({ _id: tagBlog });
    // console.log(blog);
    if (blog == null) {
      await Tag.updateOne(
        { _id: tagBlog },
        {
          $pull: { blogs: tagBlog },
        }
      );
    }
    // if (blog.state == "published") {
    //   publishedTagBlogs.push(blog)
    // }
  }

  res.status(200).render("tag.ejs", {
    tag,
    blogs: publishedTagBlogs,
  });
});

app.get("/getAuthor/:id", async (req, res) => {
  const authorId = req.params.id

  const author = await User.findOne({ _id: authorId });

  const authorBlogs = author.blogs;

  const blogs = [];

  for (let i = 0; i < authorBlogs.length; i++) {
    const singleBlogId = authorBlogs[i];
    const blog = await Blog.findOne({ _id: singleBlogId });

    if (blog == null) {
      await User.updateOne(
        { _id: author._id },
        {
          $pull: { blogs: singleBlogId },
        }
      );
    }
    blogs.push(blog);
  }

  // console.log(blogs)
  res.status(200).render("author.ejs", {
    author,
    blogs,
  });
});
const port = 4004;

app.listen(4004, () => {
  console.log(`Server started on port ${port}`);
});
