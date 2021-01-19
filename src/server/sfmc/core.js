const logger = require('../utils/logger');
const path = require('path');
const axios = require('axios').default;
const xml2js = require('xml2js');
const builder = new xml2js.Builder({
    rootName: 'Envelope',
    headless: true
});
const parser = new xml2js.Parser();
const qs = require('querystring');

class SoapError extends Error {
    constructor(body) {
        super(body);
        this.status = Array.isArray(body.OverallStatus)
            ? body.OverallStatus[0]
            : body.OverallStatus;
        if (body.Results) {
            this.errors = body.Results.map((e, i) => {
                return {
                    errorNumber: i,
                    statusCode: e.StatusCode[0],
                    statusMessage: e.StatusMessage[0],
                    errorCode: e.ErrorCode[0]
                };
            });
        } else {
            this.errors = [
                {
                    errorNumber: 1,
                    statusCode: 404,
                    statusMessage: body.message,
                    errorCode: 404
                }
            ];
        }
    }
}

/** @description performs simple soap request
 * @memberof server/sfmc
 * @function
 * @param {Object} body object to be turned into xml
 * @param {String} action type (ie. Retrieve, Create)
 * @param {String} token auth token from session
 * @return {Array} name of Attribute Set if found
 */

exports.soapRequest = async (body, action, auth) => {
    const envelope = {
        Body: body,
        $: {
            xmlns: 'http://schemas.xmlsoap.org/soap/envelope/',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
        },
        Header: {
            fueloauth: {
                $: {
                    xmlns: 'http://exacttarget.com'
                },
                _: auth.access_token
            }
        }
    };
    if (action === 'Retrieve') {
        envelope.Body.RetrieveRequestMsg.$ = {
            xmlns: 'http://exacttarget.com/wsdl/partnerAPI'
        };
    } else if (action === 'Create') {
        envelope.Body.CreateRequest.$ = {
            xmlns: 'http://exacttarget.com/wsdl/partnerAPI'
        };
    }

    const xmlPayload = builder.buildObject(envelope);
    let response;
    try {
        response = await axios({
            method: 'post',
            url: `${auth.soap_instance_url}Service.asmx`,
            data: xmlPayload,
            headers: { 'Content-Type': 'text/xml', SOAPAction: action }
        });
    } catch (ex) {
        //todo
        if (ex.response && ex.response.data) {
            response = ex.response;
        } else {
            throw new Error(ex);
        }
    }

    const json = await parser.parseStringPromise(response.data);
    if (response.status < 300) {
        if (action === 'Retrieve') {
            return json['soap:Envelope']['soap:Body'][0].RetrieveResponseMsg[0];
        } else if (action === 'Create') {
            return json['soap:Envelope']['soap:Body'][0].CreateResponse[0];
        }

        return json;
    }
    //use try catch block to error in case no fault string
    if (
        json['soap:Envelope'] &&
        json['soap:Envelope']['soap:Body'] &&
        json['soap:Envelope']['soap:Body'][0] &&
        json['soap:Envelope']['soap:Body'][0]['soap:Fault'] &&
        json['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]
    ) {
        throw new SoapError({
            OverallStatus: 'Authentication Error',
            message:
                json['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]
                    .faultstring[0]
        });
    }
    throw new SoapError({
        OverallStatus: 'Unhandled Error in SOAP Request',
        message: JSON.stringify(json)
    });
};

exports.getToken = async (req) => {
    const currentSession = req.session.auth
        ? req.session
        : await new Promise((resolve, reject) => {
              req.sessionStore.get(req.query.state, (err, session) => {
                  if (err) reject(err);
                  resolve(session);
              });
          });
    const response = await axios({
        method: 'post',
        url: `${currentSession.auth.auth_instance_url}v2/token`,
        data: {
            grant_type: 'authorization_code',
            code: req.query.code,
            client_id: currentSession.auth.client_id,
            client_secret: currentSession.auth.client_secret,
            redirect_uri: currentSession.auth.redirect_uri
        }
    });
    const dt = new Date();
    dt.setSeconds(dt.getSeconds() + response.data.expires_in - 60);
    currentSession.auth.expiryDateTime = dt;
    currentSession.auth.access_token = response.data.access_token;
    currentSession.auth.refresh_token = response.data.refresh_token;
    currentSession.auth.soap_instance_url = response.data.soap_instance_url;
    currentSession.auth.rest_instance_url = response.data.rest_instance_url;
    //if context is null, add here;
    if (!currentSession.context) {
        currentSession.context = await this.getContext(currentSession.auth);
    }
    await new Promise((resolve, reject) => {
        req.sessionStore.set(
            req.query.state,
            currentSession,
            (err, session) => {
                if (err) reject(err);
                resolve(session);
            }
        );
    });
    return true;
};

exports.getContext = async (auth) => {
    const res = await axios({
        method: 'get',
        url: `${auth.auth_instance_url}v2/userinfo`,
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + auth.access_token
        }
    });
    return res.data;
};
exports.getRedirectURL = (req, appname) => {
    //initialize auth if not done
    if (!req.session.auth) {
        req.session.auth = {
            response_type: 'code',
            auth_instance_url: process.env.SFMC_AUTHURL,
            client_id: process.env.SFMC_CLIENTID,
            client_secret: process.env.SFMC_CLIENTSECRET
        };
    }

    /*needed for testing */
    if (process.env.NODE_ENV !== 'production') {
        req.session.auth.redirect_uri = `https://${req.hostname}:${process.env.PORT}/sfmc/auth/response`;
    } else {
        req.session.auth.redirect_uri = `https://${req.hostname}/sfmc/auth/response`;
    }
    const params = qs.stringify({
        response_type: 'code',
        client_id: req.session.auth.client_id,
        redirect_uri: req.session.auth.redirect_uri,
        state: Buffer.from(`${req.sessionID}&${appname}`).toString('base64')
    });
    return `${req.session.auth.auth_instance_url}v2/authorize?${params}`;
};

exports.refreshToken = async (auth) => {
    const response = await axios({
        method: 'post',
        url: `${auth.auth_instance_url}v2/token`,
        data: {
            grant_type: 'refresh_token',
            refresh_token: auth.refresh_token,
            client_id: auth.client_id,
            client_secret: auth.client_secret,
            redirect_uri: auth.redirect_uri
        }
    });
    const dt = new Date();
    dt.setSeconds(dt.getSeconds() + response.data.expires_in - 60);
    auth.expiryDateTime = dt;
    auth.access_token = response.data.access_token;
    auth.refresh_token = response.data.refresh_token;
    return true;
};

exports.flattenResults = (Results) => {
    return Results.map((obj) => {
        const flattenedObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                flattenedObj[key] = obj[key][0];
            }
        }
        return flattenedObj;
    });
};
exports.checkAuth = async (req, res, next, appname) => {
    // remove first or last slash from appname
    appname = appname.replace(/^\/+/, '').replace(/\/$/, '');
    try {
        if (
            req.session &&
            req.session.auth &&
            req.session.auth.expiryDateTime
        ) {
            const expireTime = new Date(req.session.auth.expiryDateTime);
            const currentTime = new Date();
            logger.info(
                'Auth Check: ' +
                    Math.round((expireTime - currentTime) / (1000 * 60)) +
                    ' Minutes'
            );
            if (!(expireTime > currentTime)) {
                await this.refreshToken(req.session.auth);
                logger.info('Auth Refreshed');
            }
        } else if (req.session.auth && req.session.auth.refresh_token) {
            await this.refreshToken(req.session.auth);
        } else if (appname) {
            res.redirect(301, this.getRedirectURL(req, appname));
        } else {
            res.status(401).send({ message: 'Log into SFMC' });
        }
        //only allow format of /appmainname/appsubname or /appmainname
        if (/^\/\w+(\/\w+)?$/.test(req.originalUrl)) {
            //since request can continue now serve the html page correctly
            res.sendFile(
                path.join(__dirname, '../../../dist', req.originalUrl + '.html')
            );
        } else {
            res.status(403).send({ message: 'requested URL is not supported', details: req.originalUrl });
        }
    } catch (ex) {
        if (ex.response && ex.response.data) {
            logger.info('checkAuth Failed', ex.response.data);
        } else {
            logger.info('checkAuth Failed', ex);
        }

        res.status(500).send({
            message: ex.message,
            details: ex.response.data
        });
    }
};

exports.authenicate = async (req, res) => {
    if (
        req.query &&
        req.query.error &&
        req.query.error === 'user_not_licensed'
    ) {
        logger.info('auth response error ');
        res.status(401).send(req.query);
    } else if (req.query && req.query.error) {
        res.status(500).send({
            message: 'OAuth2 Error',
            details: req.query.error
        });
    } else {
        try {
            await this.getToken(req);

            const app = Buffer.from(req.query.state, 'base64')
                .toString('utf8')
                .split('&')[1];
            const hostname =
                process.env.NODE_ENV === 'development'
                    ? `127.0.0.1:${process.env.PORT}`
                    : req.hostname;

            const redirURL = `https://${hostname}/${app}`;
            logger.info(`REDIRECT: ${redirURL}`);
            res.redirect(redirURL);
        } catch (ex) {
            logger.error('ERROR', ex);
            res.status(500).send({
                message: 'OAuth2 Response Failed',
                details: ex.message
            });
        }
    }
};

exports.parseSOAPResponse = (body) => {
    if (body.OverallStatus[0] === 'OK') {
        return body.Results;
    }
    throw new SoapError(body);
};
exports.restproxy = async (req) => {
    const response = await axios({
        method: req.method,
        url: `${req.session.auth.rest_instance_url}/${req._parsedUrl.path}`,
        data: req.body,
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + req.session.auth.access_token
        }
    });
    logger.info(
        'Proxy result',
        `${req.session.auth.rest_instance_url}/${req._parsedUrl.path}`,
        response
    );

    return response;
};
