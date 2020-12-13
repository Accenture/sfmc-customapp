import { LightningElement, api, track } from 'lwc';

export default class Alert extends LightningElement {
    visible = false;
    @track privateAlert = {};
    @api
    get alertPayload() {
        return this.privateAlert;
    }

    set alertPayload(alertPayload) {
        console.log('alert message', JSON.stringify(alertPayload));
        if (
            alertPayload &&
            alertPayload.type &&
            alertPayload !== this.privateAlert
        ) {
            this.privateAlert = alertPayload;
            this.visible = true;
        }
    }

    handleDismiss() {
        console.log('dismissed');
        this.visible = false;
        this.privateAlert = {};
    }

    handleShow() {
        this.visible = true;
    }
    logSomething(e) {
        console.log('logsomething', e);
    }
}
