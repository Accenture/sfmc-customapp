import { LightningElement, api, track } from 'lwc';

import { showToastEvent } from 'common/toast';

export default class Activity extends LightningElement {
    @track status = {};
    @track isLoading = false;

    @track notifConfig = {
        type: {
            value: '',
            label: null
        },
        recipient: {
            value: '',
            disabled: true
        },
        target: {
            value: '',
            disabled: true
        },
        content: {
            value: '',
            disabled: true
        }
    };

    @track notificationTypes;
    @track selectedField;
    events = ['tokens', 'dataSources', 'contactsSchema'];
    //to communicate with framework
    activity;

    async connectedCallback() {
        this.isLoading = true;
    }
    get notificationTypesList() {
        return this.notificationTypes.map((e) => {
            return { label: e.CustomNotifTypeName, value: e.Id };
        });
    }

    async getNotificationTypes() {
        const res = await fetch('/salesforcenotification/notificationTypes');
        const payload = await res.json();
        if (res.status > 299) {
            showToastEvent(
                this,
                {
                    title: 'Error',
                    message: payload.message,
                    variant: 'error'
                },
                3000
            );
        } else if (payload.records.length) {
            showToastEvent(
                this,
                {
                    title: 'Success',
                    message: 'Got ' + payload.records.length + ' records',
                    variant: 'success'
                },
                3000
            );
            return payload.records;
        }
        showToastEvent(
            this,
            {
                title: 'Error',
                message: 'No records found',
                variant: 'error'
            },
            3000
        );
        this.isLoading = false;
        return [];
    }

    async getSessionContext() {
        const res = await fetch('/salesforcenotification/context');
        if (res.status > 299) {
            showToastEvent(
                this,
                {
                    title: 'Error',
                    message: (await res.json()).message,
                    variant: 'error'
                },
                3000
            );
            this.isLoading = false;
            return null;
        }
        return res.json();
    }

    async getContext(e) {
        this.activity = this.template.querySelector('common-activity');
        this.config = e.detail;
        this.sessionContext = await this.getSessionContext();
        this.notificationTypes = await this.getNotificationTypes();
        // add config from previously configured
        if (
            this.config.payload &&
            this.config.payload.arguments &&
            this.config.payload.arguments.execute &&
            this.config.payload.arguments.execute.inArguments &&
            this.config.payload.arguments.execute.inArguments[0]
        ) {
            this.notifConfig.type.value =
                this.config.payload.arguments.execute.inArguments[0].type;
            this.notifConfig.content.value =
                this.config.payload.arguments.execute.inArguments[0].content;
            this.notifConfig.recipient.value =
                this.config.payload.arguments.execute.inArguments[0].recipient;
            this.notifConfig.target.value =
                this.config.payload.arguments.execute.inArguments[0].target;
        }
        this.isLoading = false;
    }
}
