require('dotenv').config();
require('@marko/compiler/register');
const express = require('express');

const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const formParser = require('body-parser').urlencoded({ extended: false });
const redisSession = require('./middleware/redis-session');

const marko = require('@marko/express').default;

const app = express();
const port = process.env.WEBSITE_PORT || 8000;

// middleware
app.use(helmet());
app.use(cookieParser());
app.use(formParser);
app.use(marko());
app.use(redisSession);

// controllers
app.use(require('./controllers/login'));
app.use(require('./controllers/dashboard'));
app.use(require('./controllers/server'));
app.use(require('./controllers/misc'));


app.listen(port, () => console.log(`Server is running on port ${port}`));