const logger = require('./logger');
const jwt = require('jsonwebtoken');
module.exports = {
    decode: (req, res, next) => {
        if (!req.body) {
            res.status(500).send('Body was empty');
        }
        if (!process.env.SFMC_JWT) {
            res.status(500).send('JWT Signature not found to decode');
        }
        try {
            req.body = jwt.verify(
                req.body.toString('utf8'),
                process.env.SFMC_JWT,
                {
                    algorithm: 'HS256'
                }
            );
            return next();
        } catch (ex) {
            logger.error('req.body', req.body);
            res.status(401).send('JWT was not correctly signed');
        }
    }
};
