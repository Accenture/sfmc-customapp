const express = require('express');
const logger = require('../utils/logger');
const sfdc = require('../sfdc/index.js');
const router = express.Router({ strict: true });
const csurf = require('csurf')();
const { checkAuth, getRedirectURL } = require('../sfmc/core.js');
const { decode } = require('../utils/jwt');

//default entry path with auth validation
router.get(['/activity', '/app'], csurf, (req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
        sameSite: 'none',
        secure: true
    });
    checkAuth(req, res, next, req.originalUrl.substring(1));
});

// path in case we want to force a refresh of token
router.get(['/activity/login', '/app/login'], csurf, (req, res) => {
    res.redirect(
        301,
        getRedirectURL(req, req.originalUrl.replace('/login', '').substring(1))
    );
});

router.get('/config.json', (req, res) => {
    const config = {
        workflowApiVersion: '1.1',
        metaData: {
            // the location of our icon file
            icon: `https://${req.headers.host}/assets/platformeventsicon.png`,
            category: 'customer',
            backgroundColor: '#032e61',
            expressionBuilderPrefix: 'Platform'
        },
        // allows copying of activity (undocumented)
        copySettings: {
            allowCopy: true,
            displayCopyNotification: true
        },
        // For Custom Activity this must say, "REST"
        type: 'REST',
        lang: {
            'en-US': {
                name: 'Platform Event',
                description: 'Use for sending a platform Event'
            }
        },
        arguments: {
            execute: {
                // See: https://developer.salesforce.com/docs/atlas.en-us.mc-apis.meta/mc-apis/how-data-binding-works.htm
                inArguments: [],
                outArguments: [],
                // Fill in the host with the host that this is running on.
                // It must run under HTTPS
                url: `https://${req.headers.host}/platformevent/execute`,
                // The amount of time we want Journey Builder to wait before cancel the request. Default is 60000, Minimal is 1000
                timeout: 10000,
                // how many retrys if the request failed with 5xx error or network error. default is 0
                retryCount: 3,
                // wait in ms between retry.
                retryDelay: 1000,
                // The number of concurrent requests Journey Builder will send all together
                concurrentRequests: 5,
                // sign request
                useJwt: true
            }
        },
        configurationArguments: {
            publish: {
                url: `https://${req.headers.host}/platformevent/publish`,
                useJwt: true
            },
            validate: {
                url: `https://${req.headers.host}/platformevent/validate`,
                useJwt: true
            },
            stop: {
                url: `https://${req.headers.host}/platformevent/stop`,
                useJwt: true
            },
            save: {
                url: `https://${req.headers.host}/platformevent/save`,
                useJwt: true
            }
        },
        userInterfaces: {
            configurationSupportsReadOnlyMode: true,
            configInspector: {
                size: 'scm-lg',
                emptyIframe: true
            }
        },
        schema: {
            arguments: {
                execute: {
                    inArguments: [],
                    outArguments: []
                }
            }
        },
        edit: {
            url: `https://${req.headers.host}/platformevent/activity`
        }
    };
    res.json(config);
});

router.post('/execute', decode, (req, res) => {
    logger.info('execute request:', req.body);
    sfdc.publishEvent(
        req.body.inArguments[0].event,
        req.body.inArguments[1].fields,
        req.body.inArguments[2].mid
    );

    res.json({ status: 'ok' });
});
router.post('/publish', decode, (req, res) => {
    logger.debug('publish request', req.body);
    res.json({ status: 'ok' });
});
router.post('/stop', decode, (req, res) => {
    logger.debug('stop request', req.body);
    res.json({ status: 'ok' });
});
router.post('/validate', decode, (req, res) => {
    logger.debug('validate request', req.body);
    res.json({ status: 'ok' });
});
router.post('/save', decode, (req, res) => {
    logger.debug('save request', req.body);
    res.json({ status: 'ok' });
});

router.get('/platformEvents', checkAuth, async (req, res) => {
    //logger.info(core.checkAuth);
    try {
        const platformEvents = await sfdc.getMetadata(
            req.session.context.organization.member_id
        );
        res.json(platformEvents);
    } catch (ex) {
        res.status(500).json({ message: ex.message });
    }
});
router.get('/context', (req, res) => {
    res.json(req.session.context);
});
router.post('/sfdccredentials', csurf, async (req, res) => {
    if (
        req.session.context &&
        req.session.context.organization &&
        req.session.context.organization.member_id
    ) {
        req.session.temp = {
            mid: req.session.context.organization.member_id,
            cred: req.body
        };
        const hostname =
            process.env.NODE_ENV === 'development'
                ? `127.0.0.1:${process.env.PORT}`
                : req.hostname;
        res.json({
            redirect: sfdc.loginurl(
                req.body,
                hostname,
                req.session.context.organization.member_id,
                req.sessionID
            )
        });
    } else {
        logger.debug('sfdccredentials', req.session);
        res.status(500).json({ result: 'rejected, no context ' });
    }
});
router.get('/oauth/response/:mid', async (req, res) => {
    try {
        await sfdc.authorize(req.params.mid, req.query.code);
        delete req.session.temp;
        res.status(200).send(
            'Finalizing Authorization. This window will close in a couple of seconds'
        );
    } catch (ex) {
        res.status(500).json({ message: ex });
    }
});

router.get('/sfdcstatus', async (req, res) => {
    try {
        if (
            req.session &&
            req.session.context &&
            req.session.context.organization
        ) {
            const obj = await sfdc.status(
                req.session.context.organization.member_id
            );
            res.status(200).json(obj);
        } else {
            res.status(500).json({
                message: 'Context not set',
                detail: req.session
            });
        }
    } catch (ex) {
        res.status(500).json({ message: ex.message });
    }
});

module.exports = router;
