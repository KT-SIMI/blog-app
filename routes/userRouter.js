const express = require("express")
const user = require("../controllers/userController")

const router = express.Router()

router.get("/", user.getHome)
router.get("/signup", user.getSignup)
router.get("/logout", user.getLogout)
router.get("/signin", user.getSignin)
router.get("/getSingleBlog/:blogId", user.getSingleBlog)
router.get("/getSingleTag/:tagId", user.getSingleTag)
router.get("/getSingleAuthor/:authorId", user.getSingleAuthor)

router.post("/signup", user.signup)
router.post("/signin", user.signin)


module.exports = router