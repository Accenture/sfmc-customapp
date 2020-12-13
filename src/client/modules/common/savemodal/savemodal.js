import { LightningElement, api } from 'lwc';

export default class Modal extends LightningElement {
    @api title;
    handleClose() {
        this.dispatchEvent(
            new CustomEvent('close', {
                bubbles: true,
                composed: true
            })
        );
    }
    handleSave() {
        this.dispatchEvent(
            new CustomEvent('save', {
                bubbles: true,
                composed: true
            })
        );
    }
}
