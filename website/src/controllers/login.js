const { Router } = require('express');
const csrf = require('../middleware/csrf');

const userModel = require('../models/users');
const registrationModel = require('../models/registration');


const loginView = require('../views/login').default;
const registerView = require('../views/register').default;
const registerSuccessView = require('../views/registerSuccess').default;

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

router.get('/register', csrf, function(request, response) {
    response.marko(registerView, {
        csrfToken: request.csrfToken()
    });
});

router.post('/register', csrf, async function(request, response) {
    if (!(request.body.username && request.body.password && request.body['confirm-password'])) {
        response.marko(registerView, {
            csrfToken: request.csrfToken(),
            error: 'Missing fields'
        });
        return;
    }

    const { username, password, 'confirm-password': confirmPassword } = request.body;

    if (password !== confirmPassword) {
        response.marko(registerView, {
            csrfToken: request.csrfToken(),
            error: 'Passwords do not match'
        });
        return;
    }
    
    // Check if existing user exists
    try {
        const user = await userModel.getUserByUsername(username);
        if (user !== null) {
            response.marko(registerView, {
                csrfToken: request.csrfToken(),
                error: 'Existing account'
            });
            return;
        }
    
        // Generate code for player to run in-game
        const code = await registrationModel.createRegistrationCode(username, password);
        response.marko(registerSuccessView, {
            code
        });
    } catch (error) {
        console.error(error);
        response.sendStatus(500);
    }
});

module.exports = router;