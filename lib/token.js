const session = {
    secret: process.env.SES_SECRET,
    resave: false,
    saveUninitialized: true,
    name: `session-${process.env.LOCATION.replace(
        /[^a-z0-9]/gi,
        ''
    ).toLowerCase()}`,
    cookie: {
        maxAge: ms('3 weeks'),
        sameSite: 'strict',
        path: process.env.LOCATION,
        secure: true, // TODO
    },
};
