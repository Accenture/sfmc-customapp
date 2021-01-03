const logger = require('../utils/logger');
const jsforce = require('jsforce');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, { keyPrefix: 'sfdc:' });
const connectionArray = {};

exports.getMetadata = async (mid) => {
    const res = await connectionArray[mid].describeGlobal();
    return Promise.all(
        res.sobjects
            .filter((obj) => obj.name.endsWith('__e'))
            .map((obj) => connectionArray[mid].describe(obj.name))
    );
};

exports.publishEvent = async (event, fields, mid) => {
    const createRes = await connectionArray[mid].sobject(event).create(fields);
    logger.info('createRes', createRes);
    return createRes;
};

const init = async () => {
    const connKeys = await redis.keys('sfdc:*');
    connKeys.forEach(async (key) => {
        const withoutPrefix = key.replace('sfdc:', '');
        const conn = await redis.get(withoutPrefix);

        connectionArray[withoutPrefix] = new jsforce.Connection(
            JSON.parse(conn)
        );
        // add refresh handler to save refresh token
        connectionArray[withoutPrefix].on('refresh', (accessToken, res) => {
            logger.info('on Refresh', accessToken, res);
            saveCredentials(withoutPrefix, connectionArray[withoutPrefix]);
            logger.info('refreshed and saved credentials');
            // Refresh event will be fired when renewed access token
            // to store it in your storage for next request
        });
    });
};

exports.loginurl = (cred, hostname, mid, state) => {
    connectionArray[mid] = new jsforce.Connection({
        version: '50.0',
        loginUrl: cred.sfdcurl,
        oauth2: {
            loginUrl: cred.sfdcurl,
            clientId: cred.sfdcclientid,
            clientSecret: cred.sfdcclientsecret,
            redirectUri:
                `https://${hostname}/platformevent/oauth/response/` + mid
        }
    });
    return connectionArray[mid].oauth2.getAuthorizationUrl({
        scope: 'api id web refresh_token offline_access',
        state: state
    });
};

exports.status = async (mid) => {
    if (connectionArray[mid]) {
        if (connectionArray[mid].oauth2.clientId) {
            let user = await connectionArray[mid].identity();
            return {
                organization_id: user.organization_id,
                username: user.username,
                clientId: connectionArray[mid].oauth2.clientId,
                loginUrl: connectionArray[mid].instanceUrl
            };
        }
        return null;
    }
    return { mid: mid, status: 'not found' };
};

exports.authorize = async (mid, code) => {
    logger.info('authorizing for mid', mid);
    try {
        const userInfo = await connectionArray[mid].authorize(code);
        logger.info('userInfo', userInfo);
        connectionArray[mid] = new jsforce.Connection(connectionArray[mid]);
        connectionArray[mid].on('refresh', async (accessToken, res) => {
            logger.info('on Refresh', accessToken, res);
            await saveCredentials(mid, connectionArray[mid]);
            logger.info('refreshed and saved credentials');
            // Refresh event will be fired when renewed access token
            // to store it in your storage for next request
        });

        await saveCredentials(mid, connectionArray[mid]);
        // Now you can get the access token, refresh token, and instance URL information.
        // Save them to establish connection next time.
        logger.info('User ID: ' + userInfo.id);
        logger.info('Org ID: ' + userInfo.organizationId);
        // ...
        return userInfo;
    } catch (err) {
        logger.error('ERROR authorize:', err);
        throw err;
    }
};

async function saveCredentials(mid, conf) {
    logger.info('saving credentials to redis', mid, {
        version: conf.version,
        oauth2: conf.oauth2,
        accessToken: conf.accessToken,
        refreshToken: conf.refreshToken,
        instanceUrl: conf.instanceUrl
    });

    const setCred = await redis.set(
        mid,
        JSON.stringify({
            version: '50.0',
            oauth2: conf.oauth2,
            accessToken: conf.accessToken,
            refreshToken: conf.refreshToken,
            instanceUrl: conf.instanceUrl
        })
    );
    logger.info('Credentials Set', setCred);
}

init();
