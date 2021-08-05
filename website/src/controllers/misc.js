const { Router } = require('express');
const router = new Router();

router.get('/', function (request, response) {
    response.redirect('/dashboard');   
});

router.all('*', function(request, response) {
    response.status(404).send('404');   // TODO: Implement 404 message
});

module.exports = router;