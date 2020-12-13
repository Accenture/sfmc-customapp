// Simple Express server setup to serve for local testing/dev API server
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const logger = require('./utils/logger');
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sfmc = require('./sfmc/core.js');

const app = express();
//add logging for all requests in debug mode
app.use(
    require('morgan')('tiny', {
        stream: { write: (message) => logger.http(message.trim()) }
    })
);
// add iframe protections
app.use(
    helmet({
        frameguard: false
    })
);
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", '*.exacttarget.com'],
            scriptSrc: ["'self'", '*.exacttarget.com'],
            objectSrc: ["'none'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            upgradeInsecureRequests: []
        }
    })
);
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: 'text/plain', limit: '10mb' }));
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'application/jwt' }));

// used for holding session store over restarts
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);
let RedisStore = require('connect-redis')(session);
app.set('trust proxy', 1);
app.use(
    session({
        store: new RedisStore({ client: redis }),
        secret: process.env.SECRET_TOKEN,
        cookie: {
            secure: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'none',
            httpOnly: true
        },
        resave: false,
        saveUninitialized: false
    })
);

app.get('/api/test', (req, res) => {
    res.json({ success: true, session: req.session });
});
//generic SFMC endpoint
app.use('/api/sfmc', require('./sfmc/sfmc-api.js'));

// auth check for some paths which require authentication
app.get(
    ['/platformeventactivity', '/platformeventapp', '/dataTools'],
    (req, res, next) => {
        // check if token stil valid and if not, redirect to login
        sfmc.checkAuth(req, res, next, req.path);
    }
);

//put your custom endpoints here
app.use('/api/dataTools', require('./dataTools/dataTools-api.js'));
app.use(
    '/api/platformeventactivity',
    require('./platformeventactivity/index.js')
);

const DIST_DIR = './dist';
app.use(express.static(DIST_DIR));

if (process.env.NODE_ENV !== 'production') {
    //local version
    const https = require('https');
    const path = require('path');
    const fs = require('fs');

    const server = https.createServer(
        {
            key: fs.readFileSync(
                path.join(__dirname, '..', '..', 'certificates', 'private.key'),
                'ascii'
            ),
            cert: fs.readFileSync(
                path.join(__dirname, '..', '..', 'certificates', 'private.crt'),
                'ascii'
            )
        },
        app
    );

    server.listen(process.env.PORT, () => {
        logger.info(
            `✅  Backend Test Server started: https://${process.env.HOST}:${process.env.PORT}/`
        );
    });
} else {
    //production build
    app.listen(process.env.PORT, () =>
        logger.info(
            `✅  Production Server started: http://${process.env.HOST}:${process.env.PORT}/`
        )
    );
}
