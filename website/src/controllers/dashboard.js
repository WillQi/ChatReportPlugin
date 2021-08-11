const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { loggedIn } = require('../middleware/session');

const reportModel = require('../models/reports');

const dashboardView = require('../views/dashboard/dashboard.marko').default;

const router = new Router();

router.get('/dashboard', loggedIn, async function (request, response) {
    const reports = await reportModel.getOpenReports();
    response.marko(dashboardView, {
        reports
    });
});

router.get('/dashboard/reports/:id', loggedIn, csrf, function (request, response) {
    // TODO: fetch report and display
});

router.post('/dashboard/reports/:id', loggedIn, csrf, function (request, response) {
    // TODO: take verdict and apply to model
});

module.exports = router;