require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const expressJwt = require('express-jwt').expressjwt;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.use(
    cors({
        origin: (origin, callback) => callback(null, true),
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());

// place jwt middleware before any route handlers and after cors
app.use(
    expressJwt({
        secret: process.env.JWT_SECRET,
        algorithms: ['HS256'],
        getToken: (req) => req.cookies.token,
    }).unless({
        path: [
            // Paths that should NOT be protected
            { url: /^\/login(.*)/, methods: ['GET', 'POST'] },
            { url: /\.css$/, methods: ['GET'] },
            { url: /favicon\.ico$/, methods: ['GET'] },
        ],
    })
);
app.use(express.static('static'));
app.use('/uhren', require('./routes/uhren'));
app.use('/login', require('./routes/login'));

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).redirect('/login.html');
    }
});
app.listen(3000, () => console.log('Server running on port 3000'));
