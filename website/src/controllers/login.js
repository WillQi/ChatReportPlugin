const { Router } = require('express');
const csrf = require('../utility/csrf');

const userModel = require('../models/users');
const usersModel = require('../models/users');

const router = new Router();

// login point
router.get('/login', csrf, function (request, response) {
    response.marko(require('../views/login').default, {
        csrfToken: request.csrfToken()
    });
});

// validate login
router.post('/login', csrf, async function (request, response) {
    const { username, password } = request.body;
    const valid = await userModel.checkLogin(username, password);
    response.send('was valid? ' + valid);
    
    // Validate login
    // Redirect to dashboard
});

router.get('/register', csrf, function(request, response) {
    // Display register page
});

router.post('/register', csrf, function(request, response) {
    // process input and create account
});

module.exports = router;