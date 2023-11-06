const express = require('express')
const userController = require('../controllers/userController')

const router = express.Router()

router.get('/', userController.getBlogList)

// router.get('/', userController.getBlog)
// router.post('/signup', userController.signup)
// router.post('/signin', userController.signin)
// router.post('/blog/getOne', userController.getSingleBlog)
// router.post('/tag/create', userController.createTag)


module.exports = router