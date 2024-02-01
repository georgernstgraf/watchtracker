require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const expressJwt = require('express-jwt').expressjwt;
const cookieParser = require('cookie-parser');

// mongodb
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

// middleware
app.use(
    cors({
        origin: (origin, callback) => callback(null, true),
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());

// place jwt middleware before any route handlers and after cors
// block-list of paths that should require authentication
const blockList = [
    { url: /^\/uhren(.*)/, methods: ['GET', 'POST', 'DELETE', 'PATCH'] },
    { url: /^\/whoami$/, methods: ['GET'] }, // let the client decide
];

app.use(
    expressJwt({
        secret: process.env.JWT_SECRET,
        algorithms: ['HS256'],
        getToken: (req) => req.cookies.token,
    }).unless({
        custom: (req) => {
            // Check if the request path is in the block-list
            return !blockList.some((path) => {
                return (
                    path.url.test(req.path) && path.methods.includes(req.method)
                );
            });
        },
    })
);
app.use(express.static('static'));
app.use('/uhren', require('./routes/uhren'));
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/whoami', require('./routes/whoami'));

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        console.log(err.constructor.name, err.message);
        return res.status(401).json({ error: 'Unauthorized' });
    }
});

/* app.listen(process.env.APP_PORT, () => {
    console.log(`App running: ${process.env.APP_URL}`);
});
 */
module.exports = app;
