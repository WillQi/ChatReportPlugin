const { Router } = require('express');

const router = new Router();

router.get('/server/punishments/:uuid', function (request, response) {
    // Authenticate secret key and fetch punishments of player
});

router.post('/server/reports', function (request, response) {
    // Authenticate secret key and submit a new report on a player
});

module.exports = router;