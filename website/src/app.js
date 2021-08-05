const express = require('express');

const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const marko = require('@marko/express').default;

const app = express();
const port = process.env.PORT || 8000;

// middleware
app.use(helmet());
app.use(cookieParser());
app.use(marko());

// controllers
app.use(require('./controllers/login'));
app.use(require('./controllers/dashboard'));
app.use(require('./controllers/server'));
app.use(require('./controllers/misc'));


app.listen(port, () => console.log(`Server is running on port ${port}`));