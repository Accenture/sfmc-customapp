const express = require('express');
const logger = require('../utils/logger');
const core = require('./core.js');

const router = express.Router();

router.get('/auth/login/:app', (req, res) => {
    res.redirect(301, core.getRedirectURL(req, req.params.app));
});
router.get('/auth/response', core.authenicate);

// used to proxy requests directly to SFMC Rest API
router.use('rest/*', core.checkAuth, async (req, res) => {
    try {
        logger.info('proxy router');
        const proxyres = await core.restproxy(req);

        res.status(proxyres.status).json(proxyres.data);
    } catch (ex) {
        res.status(500).json(ex.message);
    }
});

module.exports = router;
