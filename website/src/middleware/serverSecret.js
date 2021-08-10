// Verifies a secret is set and that it is the server secret
module.exports = function(request, response, next) {
    if (!request.body.secret) {
        response.json({
            status: 400,
            message: 'No secret provided'
        });
        return;
    } else if (request.body.secret !== process.env.MINECRAFT_SERVER_SECRET) {
        response.json({
            status: 400,
            message: 'Incorrect secret'
        });
    } else {
        next();
    }
};