const express = require('express')
const userController = require('../controllers/userController')

const router = express.Router()

router.get('/tag/get', userController.getTags)
router.get('/blog/get', userController.getBlog)
router.post('/signup', userController.signup)
router.post('/signin', userController.signin)
router.post('/tag/create', userController.createTag)


module.exports = router