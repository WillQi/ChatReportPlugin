const { Router } = require('express');
const csrf = require('../utility/csrf');

const router = new Router();

router.get('/login', csrf, function (request, response) {
    // Display login page
});

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