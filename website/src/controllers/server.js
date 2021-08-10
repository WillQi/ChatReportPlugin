const { Router } = require('express');

const serverSecret = require('../middleware/serverSecret');

const router = new Router();

router.get('/server/punishments/:uuid', serverSecret, function(request, response) {
    // Authenticate secret key and fetch punishments of player
});

router.post('/server/reports', serverSecret, function(request, response) {
    // Authenticate secret key and submit a new report on a player
});

module.exports = router;