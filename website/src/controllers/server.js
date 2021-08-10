const { Router } = require('express');

const serverSecret = require('../middleware/serverSecret');

const registrationModel = require('../models/registration');
const userModel = require('../models/users');

const router = new Router();

router.get('/server/punishments/:uuid', serverSecret, function(request, response) {
    // Authenticate secret key and fetch punishments of player
});

router.post('/server/reports', serverSecret, function(request, response) {
    // Authenticate secret key and submit a new report on a player
});

// Verify a registration
router.post('/server/verify', serverSecret, async function(request, response) {
    if (!request.body.code) {
        response.sendStatus(400);
        return;
    }

    try {
        // get registration
        const registration = await registrationModel.getRegistrationByCode(request.body.code);
        if (!registration) {
            response.json({
                status: 400,
                message: 'unable to match verification code'
            });
            return;
        }
    
        // register account as a user
        await registrationModel.deleteRegistrationByCode(request.body.code);
        await userModel.createUser(registration.username, registration.password);
    
        response.json({
            status: 200,
            message: 'successfully registered account'
        });
    } catch (error) {
        console.error(error);
        response.json({
            status: 500,
            message: 'Internal Server Error'
        });
    }
});

module.exports = router;