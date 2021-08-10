module.exports = {
    loggedIn: function(request, response, next) {
        if (request.session.loggedIn) {
            next();
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