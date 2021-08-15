const express = require('express');
const logger = require('../utils/logger');
const sfdc = require('../sfdc/index.js');
const router = express.Router({ strict: true });
const csurf = require('csurf')();
const { checkAuth, getRedirectURL } = require('../sfmc/core.js');

//default entry path with auth validation
router.get('/app', csurf, (req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
        sameSite: 'none',
        secure: true
    });
    checkAuth(req, res, next, req.originalUrl.substring(1));
});

// path in case we want to force a refresh of token
router.get('/app/login', csurf, (req, res) => {
    res.redirect(
        301,
        getRedirectURL(req, req.originalUrl.replace('/login', '').substring(1))
    );
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
