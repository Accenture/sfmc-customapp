import { LightningElement, api } from 'lwc';

export default class Illustration extends LightningElement {
    @api type;
    privateSize = 'slds-illustration_small';
    @api
    set size(value) {
        this.privateSize =
            value === 'large'
                ? 'slds-illustration slds-illustration_large'
                : 'slds-illustration slds-illustration_small';
    }
    get size() {
        return this.privateSize;
    }
}
