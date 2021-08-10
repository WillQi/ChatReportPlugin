// Verifies a secret is set and that it is the server secret
module.exports = function(request, response, next) {
    if (!(request.body.secret && request.body.secret === process.env.MINECRAFT_SERVER_SECRET)) {
        response.sendStatus(400);
        return;
    }
    next();
};