// this function is for example purposes only. it sets ups a Postmonger
// session that emulates how Journey Builder works. You can call jb.ready()
// from the console to kick off the initActivity event with a mock activity object
export default function setupTestHarness(jbSession) {
    const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
        console.log('[setupTestHarness]', 'loading prod data');
        // don't load the test harness functions when running in Journey Builder

        return;
    }
    console.log('[setupTestHarness]', 'loading test data');
    const jb = {};
    window.jb = jb;

    //standard responses

    const events = [
        'requestContactsSchema',
        'requestSchema',
        'requestTriggerEventDefinition',
        'requestDataSources',
        'requestTokens'
    ];

    for (const e of events) {
        try {
            jbSession.on(e, () => {
                console.log('[echo]', e);
                jbSession.trigger(
                    e.replace('request', 'requested'),
                    require(`./testdata/${e}.json`)
                );
            });
        } catch (ex) {
            console.error('Could not load test harness for event ', e, ex);
        }
    }
    // custom responses

    jbSession.on('ready', function () {
        console.log('[echo] ready');
        const data = require('./testdata/ready.json');
        jbSession.trigger('initActivity', data);
    });

    jbSession.on('setActivityDirtyState', function (value) {
        console.log('[echo] setActivityDirtyState -> ', value);
    });

    jbSession.on('requestInspectorClose', function () {
        console.log('[echo] requestInspectorClose');
    });

    jbSession.on('updateActivity', function (activity) {
        console.log(
            '[echo] updateActivity -> ',
            JSON.stringify(activity, null, 4)
        );
    });
}
