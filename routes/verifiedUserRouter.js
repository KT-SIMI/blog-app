const express = require('express')
const verifiedController = require('../controllers/verifiedUserController')

const router = express.Router()

router.get('/profile', verifiedController.getProfile)
router.post('/blog/create', verifiedController.createBlog)

module.exports = router