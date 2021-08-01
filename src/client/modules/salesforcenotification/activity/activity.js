import { LightningElement, api, track } from 'lwc';

export default class PlatformEvent extends LightningElement {
    @track status = {};
    @track isLoading = false;
    @track alert = {};

    @api eventDefinition;
    @track platformevents;
    @track platformevent;
    @track fields;
    @track selectedField;
    events = ['tokens', 'dataSources', 'contactsSchema'];
    //to communicate with framework
    activity;

    async connectedCallback() {
        this.isLoading = true;
    }
    get platformEventList() {
        return this.platformevents.map((e) => {
            return { label: e.label, value: e.name };
        });
    }

    onFieldChange(event) {
        for (const field of this.fields) {
            if (field.name === this.selectedField) {
                field.value = event.detail.value;
                break;
            }
        }
        this.updateActivity();
    }

    handleEventChange(event) {
        this.platformevent = event.detail.value;

        this.fields =
            this.platformevents.length > 0
                ? this.platformevents
                      .filter((obj) => obj.name === this.platformevent)[0]
                      .fields.filter((field) => field.createable)
                      .map((field) => {
                          field.value = field.defaultValue || '';
                          field.disabled = true;
                          return field;
                      })
                : [];
        console.log('setting fields', JSON.parse(JSON.stringify(this.fields)));
        this.updateActivity();
    }

    toggleEdit(e) {
        this.selectedField =
            this.selectedField === e.target.name ? null : e.target.name;
        this.fields.map((field) => {
            field.disabled = field.name !== this.selectedField;
            return field;
        });
    }

    appendValue(e) {
        for (const field of this.fields) {
            if (field.name === this.selectedField) {
                field.value += e.detail.name;
                break;
            }
        }
        this.updateActivity();
    }

    async getPlatformEvents() {
        const res = await fetch('/platformevent/platformEvents');
        if (res.status > 299) {
            this.showAlert({
                detail: {
                    type: 'error',
                    message: (await res.json()).message
                }
            });
            this.isLoading = false;
            return [];
        }
        return res.json();
    }

    async getSessionContext() {
        const res = await fetch('/platformevent/context');
        if (res.status > 299) {
            this.showAlert({
                detail: {
                    type: 'error',
                    message: (await res.json()).message
                }
            });
            this.isLoading = false;
            return null;
        }
        return res.json();
    }

    async getContext(e) {
        this.activity = this.template.querySelector('common-activity');
        this.config = e.detail;
        this.sessionContext = await this.getSessionContext();
        this.platformevents = await this.getPlatformEvents();
        // add config from previously configured
        if (
            this.config.payload &&
            this.config.payload.arguments &&
            this.config.payload.arguments.execute &&
            this.config.payload.arguments.execute.inArguments &&
            this.config.payload.arguments.execute.inArguments[0] &&
            this.config.payload.arguments.execute.inArguments[0].event
        ) {
            this.platformevent = this.config.payload.arguments.execute.inArguments[0].event;
            this.fields = this.platformevents
                .filter((obj) => obj.name === this.platformevent)[0]
                .fields.filter((field) => field.createable)
                .map((field) => {
                    if (
                        this.config.payload.arguments.execute.inArguments[1]
                            .fields[field.name] != null
                    ) {
                        field.value = this.config.payload.arguments.execute.inArguments[1].fields[
                            field.name
                        ];
                    }
                    field.value = field.value || '';
                    field.disabled = true;
                    return field;
                });
        }
        this.isLoading = false;
    }

    updateActivity() {
        //do all fields have a value.

        const newPayload = JSON.parse(JSON.stringify(this.config.payload));

        const argfields = this.fields.reduce((obj, field) => {
            obj[field.name] = field.value;
            return obj;
        }, {});
        newPayload.arguments.execute.inArguments = [
            { event: this.platformevent },
            { fields: argfields },
            { mid: this.sessionContext.organization.member_id }
        ];

        //testing this to see if it saves
        newPayload.configurationArguments.params = argfields;
        newPayload.metaData.isConfigured =
            this.fields.filter((field) => !field.value).length === 0;
        this.activity.update(newPayload);
    }

    showAlert(e) {
        if (e.detail.type) {
            this.alert = e.detail;
        } else {
            this.alert = {
                type: 'error',
                message: e.detail.message || JSON.stringify(e.detail.errors)
            };
        }
    }
}
