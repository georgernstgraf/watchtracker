const express = require('express');
const app = express();
const cors = require('cors');
const expressJwt = require('express-jwt').expressjwt;
const cookieParser = require('cookie-parser');

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
    {
        url: new RegExp(`^${process.env.LOCATION}/watches(.*)`),
        methods: ['GET', 'POST', 'DELETE', 'PATCH'],
    },
    {
        url: new RegExp(`^${process.env.LOCATION}/(logout|whoami)$`),
        methods: ['GET'],
    },
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

app.use(process.env.LOCATION, express.static('static'));
app.use(`${process.env.LOCATION}/watches`, require('./routes/watches'));
app.use(`${process.env.LOCATION}/login`, require('./routes/login'));
app.use(`${process.env.LOCATION}/logout`, require('./routes/logout'));
app.use(`${process.env.LOCATION}/whoami`, require('./routes/whoami'));

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        console.log(err.constructor.name, err.message);
        return res.status(401).json({ error: 'Unauthorized' });
    }
});

app.listen(process.env.APP_PORT, () => {
    console.log(`App running: ${process.env.APP_URL}${process.env.LOCATION}`);
});
