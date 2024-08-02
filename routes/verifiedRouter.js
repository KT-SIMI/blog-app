const express = require("express")
const verified = require("../controllers/verifiedUserController")

const router = express.Router()

router.get("/", verified.getIndex)
router.get("/getSingleBlog/:blogId", verified.getSingleBlog)
router.get("/getSingleTag/:tagId", verified.getSingleTag)
router.get("/getSingleAuthor/:authorId", verified.getSingleAuthor)
router.get("/profile", verified.getProfile)
router.get("/blogCreate", verified.getWriteBlog)
router.get("/editBlog/:id", verified.getEditBlog)

router.post("/blogCreate", verified.writeBlog)
router.post("/editBlog/:id", verified.editBlog)

module.exports = router