const { Router } = require('express');
const csrf = require('../utility/csrf');

const router = new Router();

router.get('/dashboard', function (request, response) {
    // TODO: validate login status  (probably create a utility function to do this)
    // TODO: display reports
});

router.get('/dashboard/reports/:id', csrf, function (request, response) {
    // TODO: validate login status
    // TODO: fetch report and display
});

router.post('/dashboard/reports/:id', csrf, function (request, response) {
    // TODO: validate login status
    // TODO: take verdict and apply to model
});

module.exports = router;