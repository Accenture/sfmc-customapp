import { LightningElement, api, track } from 'lwc';

import { showToastEvent } from 'common/toast';

export default class Activity extends LightningElement {
    @track status = {};
    @track isLoading = false;
    @track alert = {};

    @track notifConfig = {
        type: {
            value: null,
            label: null
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

    onTargetChange(e) {
        this.notifConfig.target.value = e.detail.value;
    }
    onContentChange(e) {
        this.notifConfig.content.value = e.detail.value;
    }

    handleTypeChange(e) {
        console.log(e);
        this.notifConfig.type.value = e.detail.value;
        this.updateActivity();
    }

    toggleEdit(e) {
        this.selectedField =
            this.selectedField === e.target.name ? null : e.target.name;

        this.notifConfig.content.disabled = this.selectedField !== 'content';
        this.notifConfig.target.disabled = this.selectedField !== 'target';
        console.log(JSON.parse(JSON.stringify(this.notifConfig)));
    }

    appendValue(e) {
        this.notifConfig[this.selectedField].value += e.detail.name;
        this.updateActivity();
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
            this.config.payload.arguments.execute.inArguments[0] &&
            this.config.payload.arguments.execute.inArguments.length >= 3
        ) {
            this.notifConfig.type =
                this.config.payload.arguments.execute.inArguments[0].type;
            this.notifConfig.content =
                this.config.payload.arguments.execute.inArguments[1].content;
            this.notifConfig.target =
                this.config.payload.arguments.execute.inArguments[2].target;
        }
        this.isLoading = false;
    }

    updateActivity() {
        //do all fields have a value.

        const newPayload = JSON.parse(JSON.stringify(this.config.payload));
        newPayload.arguments.execute.inArguments = [
            { type: this.notifConfig.type },
            { content: this.notifConfig.content },
            { target: this.notifConfig.target },
            { mid: this.sessionContext.organization.member_id }
        ];

        //testing this to see if it saves
        newPayload.configurationArguments.params =
            newPayload.arguments.execute.inArguments;
        newPayload.metaData.isConfigured =
            this.notifConfig.type &&
            this.notifConfig.content &&
            this.notifConfig.target;
        this.activity.update(newPayload);
    }
}
