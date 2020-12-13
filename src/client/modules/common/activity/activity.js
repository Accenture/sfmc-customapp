import { LightningElement, api, track } from 'lwc';
import Postmonger from 'postmonger';
const connection = new Postmonger.Session();
import setupTestHarness from './testHarness';

export default class App extends LightningElement {
    @api nextValue = 'Done';
    @api prevValue = 'Cancel';
    @api canNext;
    @track canSave = false;
    @api title;
    @api icon;
    @api events;
    @api context;
    @track state = {};

    availableEvents = [
        'tokens',
        'culture',
        'endpoints',
        'schema',
        'interaction',
        'triggerEventDefinition',
        //unsupported - these exist, but not sure what it does - found in https://jbinteractions.s7.marketingcloudapps.com/canvas/js/customIframeBaseView.js
        'dataSource',
        //'allowedOriginResponse',
        'interactionGoalStats',
        'activityPermissions',
        'engineSettings',
        'dataLibrarySource',
        'contactsSchema',
        'expressionBuilderAttributes',
        'interactionDefaults',
        'userTimeZone',
        'entryEventDefinitionKey',
        'i18nConfig',
        'activityPayload',
        'dataSources'
    ];
    availableContexts = [
        'activity',
        'initActivityRunningHover',
        'initActivityRunningModal'
    ];

    connectedCallback() {
        //run this first, will not do anything if not running locally
        setupTestHarness(connection);
        for (const e of this.events) {
            //
            if (this.availableEvents.includes(e)) {
                const t = e.charAt(0).toUpperCase() + e.slice(1);

                connection.on('requested' + t, (r) => {
                    //if only one key and same as event then skip the added name
                    if (
                        typeof r === 'object' &&
                        r !== null &&
                        Object.keys(r).length === 0 &&
                        Object.keys(r)[0] === e
                    ) {
                        this.setState(e, r);
                    } else {
                        const obj = {};
                        obj[e] = r;
                        this.setState(e, obj);
                    }
                });
                if (e === 'interactionGoalStats') {
                    connection.trigger('request' + t, true);
                } else if (e === 'activityPermissions') {
                    connection.trigger('request' + t, null);
                } else if (e === 'dataLibrarySource') {
                    connection.trigger('request' + t, 'react');
                } else {
                    connection.trigger('request' + t);
                }
            }
        }
        if (this.availableContexts.includes(this.context)) {
            const t =
                this.context.charAt(0).toUpperCase() + this.context.slice(1);
            connection.on('init' + t, (payload) => {
                this.setState('payload', { payload });
            });
            connection.trigger('ready');
        } else {
            throw new Error('Unsupported Context:' + this.context);
        }
    }

    setState(eventName, obj) {
        console.log('[setState]', eventName, obj);
        this.state = Object.assign(this.state || {}, obj);
        if (
            this.events.filter((e) => !Object.keys(this.state).includes(e))
                .length === 0 &&
            this.state.payload != null
        ) {
            this.dispatchEvent(
                new CustomEvent('context', {
                    bubbles: true,
                    composed: true,
                    detail: this.state
                })
            );
        }
    }

    // used to change size of modal
    @api resize(size) {
        // TBC what the sizes are
        console.log('[resize]', size);
        connection.trigger('requestInspectorResize', size);
    }
    // let journey builder know the activity has changes so it asks if you click close
    @api hasChanges() {
        console.log('[hasChanges]');

        connection.trigger('setActivityDirtyState', true);
    }
    // force close of activity
    cancel() {
        console.log('[cancel]');
        // now request that Journey Builder closes the inspector/drawer
        connection.trigger('requestInspectorClose');
    }
    // sync states between activity and framework
    @api update(payload) {
        console.log('[update]', payload);
        this.state.payload = payload;
    }
    // update journey builder with new config
    done() {
        console.log('[updateActivity]');
        //todo: add better validation checks
        if (this.state.payload) {
            connection.trigger('updateActivity', this.state.payload);
        } else {
            this.dispatchEvent(
                new CustomEvent('error', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        message: 'Payload to update was invalid'
                    }
                })
            );
        }
    }
}
