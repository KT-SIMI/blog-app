const express = require('express')
const verifiedController = require('../controllers/verifiedUserController')

const router = express.Router()

router.get('/profile', verifiedController.getProfile)
router.post('/blog/create', verifiedController.createBlog)
router.post('/blog/change/state', verifiedController.changeBlogState)
router.post('/blog/update', verifiedController.updateBlog)
router.post('/blog/delete', verifiedController.deleteBlog)

module.exports = router