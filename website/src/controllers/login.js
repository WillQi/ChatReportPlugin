const { Router } = require('express');
const csrf = require('../utility/csrf');

const router = new Router();

// login point
router.get('/login', csrf, function (request, response) {
    response.marko(require('../views/login').default, {
        csrfToken: request.csrfToken()
    });
});

// validate login
router.post('/login', csrf, function (request, response) {
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