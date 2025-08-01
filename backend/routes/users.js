const express = require('express');
const router = express.Router();
const { createNewUser, loginUser } = require('../controllers/UserController');

router.post('/register', createNewUser);
router.post('/login', loginUser);

module.exports = router;
