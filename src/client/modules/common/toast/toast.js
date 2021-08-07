import { LightningElement, api } from 'lwc';

export function showToastEvent(thisPrivate, e, timeout) {
    thisPrivate.template
        .querySelector('common-toast')
        .showToastEvent(e, timeout);
}
export default class Toast extends LightningElement {
    title;
    message;
    variant;
    mode;
    isVisible;
    timer;

    @api
    showToastEvent(event, timeout) {
        this.isVisible = true;
        const timer = setTimeout(
            () => {
                this.clearToast();
                clearTimeout(timer);
            },
            timeout > 0 ? timeout : 3000
        );
        this.title = event.title;
        this.message = event.message;
        this.variant = event.variant || 'success';
    }

    clearToast() {
        this.isVisible = false;
        this.title = null;
        this.message = null;
        this.variant = null;
    }
    get icon() {
        return 'utility:' + this.variant;
    }
    get variantClass() {
        return 'slds-notify slds-notify_toast slds-theme_' + this.variant;
    }
}
