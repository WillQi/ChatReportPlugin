const { Router } = require('express');

const serverSecret = require('../middleware/serverSecret');

const punishmentModel = require('../models/punishments');
const reportModel = require('../models/reports');

const router = new Router();

router.post('/server/punishments/:uuid', serverSecret, async function(request, response) {
    try {
        const punishments = await punishmentModel.getActivePunishmentsByUUID(request.params.uuid);
        response.json({
            punishments,
            status: 200,
            message: 'Success'
        });
    } catch (error) {
        console.error(error);
        response.json({
            status: 500,
            message: 'Internal Server Error'
        });
    }
});

router.post('/server/reports', serverSecret, async function(request, response) {
    if (!request.body.uuid || !request.body.chat) {
        response.json({
            status: 400,
            message: 'Missing arguments'
        });
        return;
    }

    const { uuid, chat } = request.body;
    try {
        await reportModel.createReport(uuid, chat);
        response.json({
            status: 200,
            message: 'Submitted Report'
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