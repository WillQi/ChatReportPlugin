require('dotenv').config();
require('@marko/compiler/register');
const express = require('express');

const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const formParser = require('body-parser').urlencoded({ extended: false });
const jsonParser = require('body-parser').json();
const redisSession = require('./src/middleware/redisSession');
const { valid } = require('./src/middleware/session');

const marko = require('@marko/express').default;

const app = express();
const port = process.env.WEBSITE_PORT || 8000;

app.use(express.static('public/'));

// middleware
app.use(helmet());
app.use(cookieParser());
app.use(jsonParser);
app.use(formParser);
app.use(marko());
app.use(redisSession);
app.use(valid);

// controllers
app.use(require('./src/controllers/login'));
app.use(require('./src/controllers/dashboard'));
app.use(require('./src/controllers/server'));
app.use(require('./src/controllers/admin'));
app.use(require('./src/controllers/misc'));


app.listen(port, () => console.log(`Server is running on port ${port}`));