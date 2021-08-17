const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { loggedIn, isAdmin } = require('../middleware/session');

const managementView = require('../views/admin/users.marko').default;

const usersModel = require('../models/users');

const router = new Router();

// See list of all users and the ability to delete them
router.get('/admin/users', csrf, loggedIn, isAdmin, async function(request, response) {
 try {
        const users = await usersModel.getAllUsers();

        response.marko(managementView, {
            users,
            csrfToken: request.csrfToken()
        });
    } catch (error) {
        console.error(error);
        response.sendStatus(500);
    }
});

// Delete non-admin users
router.post('/admin/users', csrf, loggedIn, isAdmin, async function(request, response) {
    const userId = parseInt(request.body.userId);
    if (isNaN(userId) || !isFinite(userId)) {
        response.redirect('/admin/users');
        return;
    }

    try {
        // Ensure account is not an admin account
        const user = await usersModel.getUserById(userId);
        if (!user.isAdmin) {
            await usersModel.deleteUser(userId);
        }

        response.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        response.sendStatus(500);
    }
});

// Create a user form
router.get('/admin/users/create', csrf, loggedIn, isAdmin, function(request, response) {
    // TODO: User creation page
});

// Create user logic
router.post('/admin/users/create', csrf, loggedIn, isAdmin, function(request, response) {
    // TODO: User creation page
});


module.exports = router;