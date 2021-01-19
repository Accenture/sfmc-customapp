const express = require('express');
const logger = require('../utils/logger');
const core = require('./core.js');
const csurf = require('csurf')();

const router = express.Router({ strict: true });

router.get('/auth/response', core.authenicate);

// used to proxy requests directly to SFMC Rest API
router.use('rest/*', csurf, core.checkAuth, async (req, res) => {
    try {
        logger.info('proxy router');
        const proxyres = await core.restproxy(req);

        res.status(proxyres.status).json(proxyres.data);
    } catch (ex) {
        res.status(500).json(ex.message);
    }
});

module.exports = router;
