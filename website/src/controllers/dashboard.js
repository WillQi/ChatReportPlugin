const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { loggedIn } = require('../middleware/session');

const reportModel = require('../models/reports');

const dashboardView = require('../views/dashboard/dashboard.marko').default;
const reportView = require('../views/dashboard/report.marko').default;

const router = new Router();

// Is a report claimed, assigned, or open to the user?
function getReportStatus(user, report) {
    if (report.resolvedAt !== null) {
        return 'completed';
    }
    
    switch (report.assignedTo) {
        case user.id:
            return 'assigned';
        case null:
            return 'unclaimed';
        default:
            return 'claimed';
    }
}

// View reports to take on
router.get('/dashboard', loggedIn, async function (request, response) {
    try {
        const reports = await reportModel.getOpenReports();
        response.marko(dashboardView, {
            reports,
            user: request.user
        });
    } catch (error) {
        console.error(error);
        response.sendStatus(500);
    }
});

// View a report
router.get('/dashboard/reports/:id', loggedIn, csrf, async function (request, response) {
    const reportId = parseInt(request.params.id);
    if (isNaN(reportId) || !isFinite(reportId)) {
        response.redirect('/dashboard');
        return;
    }

    try {
        const report = await reportModel.getReport(reportId);
        if (!report) {
            response.redirect('/dashboard');
            return;
        }

        const chatLog = await reportModel.getReportChatLog(reportId);

        const status = getReportStatus(request.user, report);

        response.marko(reportView, {
            chatLog,
            reportId,
            status,
            csrfToken: request.csrfToken()
        });
    } catch (error) {
        console.error(error);
        response.sendStatus(500);
    }
});

// Process moderation action
router.post('/dashboard/reports/:id', loggedIn, csrf, async function (request, response) {
    const reportId = parseInt(request.params.id);
    if (isNaN(reportId) || !isFinite(reportId)) {
        response.redirect('/dashboard');
        return;
    }

    try {
        const report = await reportModel.getReport(reportId);
        if (!report) {
            response.redirect('/dashboard');
            return;
        }

        const length = parseInt(request.body.length);
        if (isNaN(length) || !isFinite(length)) {
            response.redirect('/dashboard');
            return;
        }

        const status = getReportStatus(request.user, report);
        switch (status) {
            case 'assigned':
                // TODO: check punishment type and dish it out
                if (report.assignedTo === request.user.id) {
                    const punishment = request.body.punishment;
                    switch (punishment) {
                        case 'ban':
                            await reportModel.completeReport(reportId, 'ban', length); 
                        break;
                        case 'mute':
                            await reportModel.completeReport(reportId, 'mute', length); 
                        break;
                        default:
                            await reportModel.completeReport(reportId, 'reject'); 
                        break;
                    }
                }
            break;
            case 'unclaimed':
                if (report.assignedTo === null) { // we're claiming the report
                    await reportModel.assignReport(reportId, request.user.id);
                }
            break;
        }
        response.redirect(`/dashboard/reports/${reportId}`);



    } catch (error) {
        console.error(error);
        response.sendStatus(500);
    }
});

module.exports = router;