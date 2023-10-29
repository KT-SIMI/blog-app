const Blog = require("../models/blogModel");
const Tag = require("../models/tagModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getProfile = catchAsync(async (req, res, next) => {
  const UserId = req.user.userId;

  const q = await User.findOne({ _id: UserId }, { password: 0 });

  res.status(200).json({ status: "success", msg: "Profile gotten", data: q });
});

exports.createBlog = catchAsync(async (req, res, next) => {
  const title = req.body.title;
  const tags = req.body.tags;
  const body = req.body.body
  
  const words = body.split(' ')
  const wordNumber = words.length;
  const readingTime = Math.cell(wordNumber / 30)
  const titleExists = await Blog.findOne({ title: title });

  if (titleExists) 
    return res
      .status(401)
      .json({ status: "error", msg: "Name already exists" });
    

  const blog = new Blog({
    title: title,
    description: req.body.description,
    author: req.user.userId,
    tags: tags,
    body: body,
    readingTime: readingTime
  });

  for (let i = 0; i < tags.length; i++) {
    const tagId = tags[i];

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

  const q = await Blog.findOne({ _id: blog._id });

  res.status(200).json({ status: "success", msg: "Blog created", data: q });
});

exports.changeState = catchAsync( async (req, res, next) => {
  const blogId = req.user.blogId
  await Blog.updateOne({ _id: blogId }, { state: "published" })
  const q = await Blog.findOne({ _id: blogId })
  res.status(200).json({ })
})

exports.updateBlog = catchAsync(async (req, res, next) => {
  const blogId = req.body.blogId;
  const title = req.body.title;
  const tags = req.body.tags;
  const description = req.body.description;
  const body = req.body.body;

  const titleExists = await Blog.findOne({ title });

  const words = body.split(' ')
  const wordNumber = words.length;
  const readingTime = Math.cell(wordNumber / 30)

  if (titleExists)
    return res
      .status(401)
      .json({ status: "error", msg: "Title already exists" });

  await Blog.updateOne({ _id: blogId}, {
    title,
    $push: { tags: tags },
    description,
    body,
    readingTime,
  })

  const q = await Blog.findOne({ _id: blogId })

  res.status(200).json({ status: 'sucess', msg: 'Updated Blog', data: q })
});

exports.deleteBlog = catchAsync( async (req, res, next) => {
    const blogId = req.body.blogId

    const k = await  Blog.findOne({ _id: blogId })
    const tag = await Tag.find({ $in: { blogs: blogId }}, {})

    for (i = 0; i < tag.length; i++) {
        const eachTag = tag[i]

        await Tag.updateOne({ _id: eachTag._id }, {
            $pull: { blogs: blogId }
        })
    }

    await User.updateOne({ _id: k.author }, {
        $pull: { blogs: blogId }
    })
})
