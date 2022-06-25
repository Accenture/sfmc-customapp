import { LightningElement, api, track } from 'lwc';

import { showToastEvent } from 'common/toast';

export default class Activity extends LightningElement {
    @track status = {};
    @track isLoading = false;

    @track webhookConfig = {
        url: '',
        type: 'POST',
        payload: []
    };

    events = ['tokens', 'dataSources', 'contactsSchema'];
    //to communicate with framework
    activity;

    async connectedCallback() {
        this.isLoading = true;
    }
    get requestTypes() {
        return [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'PATCH', value: 'PATCH' },
            { label: 'DELETE', value: 'DELETE' }
        ];
    }

    onUrlChange(e) {
        this.webhookConfig.value = e.detail.value;
    }
    onTypeChange(e) {
        this.webhookConfig.value = e.detail.value;
    }
    // onPayloadChange(e) {
    //     console.log(JSON.parse(JSON.stringify(e)));
    //     this.webhookConfig.payload = this.webhookConfig.payload.map((f) => {
    //         if (f.fieldKey === this.selectedField) {
    //             f.value = e.detail.value;
    //         }
    //     });
    //     // this.webhookConfig.value = e.detail.value;
    // }

    onAddKey(e) {
        this.webhookConfig.payload.push({
            key: this.webhookConfig.payload.length,
            fieldKey: 'field-' + this.webhookConfig.payload.length,
            name: '',
            value: ''
        });
    }

    toggleEdit(e) {
        this.selectedField =
            this.selectedField === e.target.name ? null : e.target.name;
        this.webhookConfig.payload = this.webhookConfig.payload.map((f) => {
            if (f.fieldKey === this.selectedField) {
                f.disabled = false;
            } else {
                f.disabled = true;
            }
        });
        // this.webhookConfig.content.disabled = this.selectedField !== 'content';
        // this.webhookConfig.recipient.disabled =
        //     this.selectedField !== 'recipient';
        // this.webhookConfig.target.disabled = this.selectedField !== 'target';
        // console.log(JSON.parse(JSON.stringify(this.webhookConfig)));
    }

    // appendValue(e) {
    //     this.webhookConfig[this.selectedField].value += e.detail.name;
    //     this.updateActivity();
    // }

    async getContext(e) {
        this.activity = this.template.querySelector('common-activity');
        this.config = e.detail;
        // add config from previously configured
        if (
            this.config.payload &&
            this.config.payload.arguments &&
            this.config.payload.arguments.execute &&
            this.config.payload.arguments.execute.inArguments &&
            this.config.payload.arguments.execute.inArguments[0] &&
            this.config.payload.arguments.execute.inArguments.length >= 4
        ) {
            this.webhookConfig.type =
                this.config.payload.arguments.execute.inArguments[0].type;
            this.webhookConfig.content =
                this.config.payload.arguments.execute.inArguments[1].content;
            this.webhookConfig.recipient =
                this.config.payload.arguments.execute.inArguments[2].recipient;
            this.webhookConfig.target =
                this.config.payload.arguments.execute.inArguments[3].target;
        }
        this.isLoading = false;
    }

    updateActivity() {
        //do all fields have a value.

        const values = [...this.querySelectorAll("[data-type='fieldvalue']")];
        const fields = [...this.querySelectorAll("[data-type='fieldname']")];

        const KeyValueArray = fields.map((f, i) => {
            const val = {};
            val[f.value] = values[i].value;
            return val;
        });

        const newPayload = JSON.parse(JSON.stringify(this.config.payload));
        newPayload.arguments.execute.inArguments = [
            { url: this.webhookConfig.url },
            { payload: KeyValueArray },
            { type: this.webhookConfig.url },
            { mid: this.sessionContext.organization.member_id }
        ];
        console.log(newPayload);

        //testing this to see if it saves
        newPayload.configurationArguments.params =
            newPayload.arguments.execute.inArguments;
        newPayload.metaData.isConfigured =
            this.webhookConfig.type.value &&
            this.webhookConfig.content.value &&
            this.webhookConfig.target.value &&
            this.webhookConfig.recipient.value;
        this.activity.update(newPayload);
    }
}
