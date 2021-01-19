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
const rateLimit = require('express-rate-limit');
const RedisRateLimit = require('rate-limit-redis');
const Redis = require('ioredis');
const redisClient = new Redis(process.env.REDIS_URL);

// static vars
const DIST_DIR = './dist';

const app = express();
//add logging for all requests in debug mode
app.use(
    require('morgan')('tiny', {
        stream: { write: (message) => logger.http(message.trim()) }
    })
);

// add iframe protections, except frameguard which causes issues being rendered in iframe of SFMC
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
            imgSrc: ["'self'", '*.exacttarget.com', "'unsafe-inline'"],
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
let RedisStore = require('connect-redis')(session);
app.set('trust proxy', 1);
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
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
// Rate Limit API requests
// we exclude routes ending with execute since these may be used
// thousands of times be Journey Builder in short period
app.use(
    /.*[^execute]$/,
    rateLimit({
        store: new RedisRateLimit({
            client: redisClient
        }),
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100
    })
);

app.get('/session', (req, res) => {
    res.json({ success: true, session: req.session });
});

//generic SFMC endpoint which has some helpful things in
app.use('/sfmc', require('./sfmc/sfmc-api.js'));

//put your custom endpoints here
app.use('/dataTools', require('./dataTools/dataTools-api.js'));
app.use('/platformevent', require('./platformevent/platformevent-api.js'));
app.use(express.static(DIST_DIR));

if (process.env.NODE_ENV !== 'production') {
    //local version
    const https = require('https');
    const path = require('path');
    const fs = require('fs');

    https
        .createServer(
            {
                key: fs.readFileSync(
                    path.join(
                        __dirname,
                        '..',
                        '..',
                        'certificates',
                        'private.key'
                    ),
                    'ascii'
                ),
                cert: fs.readFileSync(
                    path.join(
                        __dirname,
                        '..',
                        '..',
                        'certificates',
                        'private.crt'
                    ),
                    'ascii'
                )
            },
            app
        )
        .listen(process.env.PORT, () => {
            logger.info(
                `✅  Test Server started: https://127.0.0.1:${process.env.PORT}/`
            );
        });
} else {
    //production build
    app.listen(process.env.PORT, () =>
        logger.info(
            `✅  Production Server started: http(s)://${process.env.HEROKU_APP_NAME}.herokuapp.com:${process.env.PORT}/`
        )
    );
}
