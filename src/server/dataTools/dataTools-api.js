const express = require('express');
const logger = require('../utils/logger');
const { checkAuth, getRedirectURL } = require('../sfmc/core.js');
const data = require('../sfmc/data.js');
const platform = require('../sfmc/platform.js');
const profiler = require('./profiler.js');

const router = express.Router();

//all POST routes here are csrf protected

const csurf = require('csurf')();
router.use(csurf);

router.get('/', (req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
        sameSite: 'none',
        secure: true
    });
    checkAuth(req, res, next, req.originalUrl);
});
router.get('/login', (req, res) => {
    res.redirect(301, getRedirectURL(req, 'dataTools'));
});
router.post('/exampledata', async (req, res) => {
    try {
        logger.info('locale', req.query);
        const metadata = await profiler.parse(req.body, req.query.phonelocale);
        res.status(200).json(metadata);
    } catch (ex) {
        res.status(500).json(ex.message);
    }
});

router.get('/getDataExtensions', checkAuth, async (req, res) => {
    try {
        res.json(await data.getDataExtensions(req));
    } catch (ex) {
        logger.error(ex);
        res.status(500).json(ex.message);
    }
});
router.get('/getDataExtension/:key/fields', checkAuth, async (req, res) => {
    try {
        res.json(await data.getDataExtensionFields(req));
    } catch (ex) {
        res.status(500).json(ex.message);
    }
});

router.post('/getDataExtensionData', async (req, res) => {
    try {
        const fieldSet = req.body.fields.map((field) => field.fieldName);
        //add _CustomObjectKey
        fieldSet.push('_CustomObjectKey');
        if (fieldSet) {
            const objectData = await data.getDataExtensionData(
                req,
                req.body.name,
                fieldSet
            );
            if (objectData) {
                res.json(objectData);
            } else {
                res.status(204).json({
                    message: 'No Rows Found',
                    status: 'warn'
                });
            }
        } else {
            res.status(500).json({
                message: 'No Fields Available',
                status: 'error'
            });
        }
    } catch (ex) {
        logger.error(ex);
        res.status(500).json(ex);
    }
});

router.get('/getFolders', checkAuth, async (req, res) => {
    try {
        res.json(await platform.getFolders(req));
    } catch (ex) {
        res.status(500).json(ex.message);
    }
});
router.post('/createDataExtension', checkAuth, async (req, res) => {
    try {
        res.json(await data.createDataExtension(req));
    } catch (ex) {
        res.status(500).json(ex);
    }
});

module.exports = router;
