const userModel = require('../models/users');

module.exports = {
    loggedIn: async function(request, response, next) {
        if (request.session.username) {
            let user;
            try {
                user = await userModel.getUserByUsername(request.session.username);
            } catch (error) {
                console.error(error);
                response.sendStatus(500);
                return;
            }

            if (user) {
                request.user = user;
                next();
            } else {
                request.session.destroy();
                response.redirect('/login');
            }
        } else {
            response.redirect('/login');
        }
    },
    valid: function(request, response, next) {
        const { ip } = request;

        if (!request.session.ip) {
            request.session.ip = ip;
            next();
        } else if (request.session.ip !== ip) {
            request.session.destroy();
            response.redirect('/login');
        } else {
            next();
        }
    }
};