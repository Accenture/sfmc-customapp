import { LightningElement, api, track } from 'lwc';
import { getCookieByName } from 'common/utils';

export default class SaveModal extends LightningElement {
    @api fields;
    @track filename = '';
    @track errors;

    handlefilename(e) {
        this.filename = e.detail.value;
    }
    handleclose() {
        this.dispatchEvent(
            new CustomEvent('closesave', {
                bubbles: true,
                composed: true
            })
        );
    }
    async handlesave() {
        this.dispatchEvent(
            new CustomEvent('loading', {
                bubbles: true,
                composed: true,
                detail: true
            })
        );
        const saveMetadata = JSON.parse(JSON.stringify(this.fields)).map(
            (field) => {
                delete field.key;
                delete field.matchclass;
                delete field.matchcolour;
                delete field.match;
                return field;
            }
        );
        const resData = await fetch('/dataTools/createDataExtension', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'xsrf-token': getCookieByName.call(this, 'XSRF-TOKEN')
            },
            body: JSON.stringify({
                name: this.filename,
                fields: saveMetadata
            })
        });
        if (resData.status === 200) {
            this.dispatchEvent(
                new CustomEvent('loading', {
                    bubbles: true,
                    composed: true,
                    detail: false
                })
            );
            this.handleclose();
        } else {
            const res = await resData.json();
            this.errors = res.errors;
            this.dispatchEvent(
                new CustomEvent('error', {
                    bubbles: true,
                    composed: true,
                    detail: res
                })
            );
            this.dispatchEvent(
                new CustomEvent('loading', {
                    bubbles: true,
                    composed: true,
                    detail: false
                })
            );
        }
        console.log(saveMetadata);
    }
}
