import { LightningElement, api } from 'lwc';

export default class WelcomeMatTile extends LightningElement {
    @api title;
    @api name;
    @api description;
    @api iconName;

    handleClick(e) {
        e.stopPropagation();
        e.preventDefault();
        this.dispatchEvent(
            new CustomEvent('click', {
                bubbles: true,
                composed: true,
                detail: { name: this.name, action: 'selectApp' }
            })
        );
    }
}
