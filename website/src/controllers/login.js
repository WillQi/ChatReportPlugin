const { Router } = require('express');
const csrf = require('../middleware/csrf');

const userModel = require('../models/users');


const loginView = require('../views/login').default;

const router = new Router();

// login point
router.get('/login', csrf, function (request, response) {
    response.marko(loginView, {
        csrfToken: request.csrfToken()
    });
});

// validate login
router.post('/login', csrf, async function (request, response) {
    if (!(request.body.username && request.body.password)) {    // do we have the required params?
        response.marko(loginView, {
            csrfToken: request.csrfToken(),
            error: 'Invalid credentials'
        });
        return;
    }

    const { username, password } = request.body;

    // Validate their information
    try {
        const valid = await userModel.checkLogin(username, password);

        if (valid) {
            response.redirect('/dashboard');
        } else {
            response.marko(loginView, {
                csrfToken: request.csrfToken(),
                error: 'Invalid credentials'
            });
        }

    } catch (error) {
        console.error(error);
        response.sendStatus(500);
    }
});

module.exports = router;