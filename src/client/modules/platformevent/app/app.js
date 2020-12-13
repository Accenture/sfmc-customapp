import { LightningElement, track } from 'lwc';

export default class Config extends LightningElement {
    @track config = { clientId: '', loginUrl: '' };
    @track isEditing = false;
    @track isLoading = true;

    onsfdcurlchange(e) {
        this.config.sfdcurl = e.detail.value;
    }
    onsfdcclientidchange(e) {
        this.config.sfdcclientid = e.detail.value;
    }
    onsfdcclientsecretchange(e) {
        this.config.sfdcclientsecret = e.detail.value;
    }

    toggleEdit() {
        this.isEditing = !this.isEditing;
    }
    async handleConnect() {
        this.isLoading = true;
        const rawRes = await fetch(
            '/api/platformeventactivity/sfdccredentials',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: 'follow',
                body: JSON.stringify(this.config)
            }
        );
        const jsonRes = await rawRes.json();
        console.log(jsonRes);
        if (rawRes.status < 300) {
            window.location = jsonRes.redirect;
        } else {
            this.dispatchEvent(
                new CustomEvent('error', {
                    bubbles: true,
                    detail: {
                        type: 'error',
                        message: jsonRes
                    }
                })
            );
        }
        this.isLoading = false;
    }
    async connectedCallback() {
        this.isLoading = true;
        const rawRes = await fetch('/api/platformeventactivity/sfdcstatus');
        const jsonRes = await rawRes.json();
        console.log(jsonRes);
        if (rawRes.status < 300) {
            if (jsonRes) {
                this.config = {
                    sfdcclientid: jsonRes.clientId,
                    sfdcurl: jsonRes.loginUrl,
                    username: jsonRes.username,
                    organization_id: jsonRes.organization_id
                };
                if (!jsonRes.clientId) {
                    this.isEditing = true;
                }
            }
        } else {
            this.dispatchEvent(
                new CustomEvent('error', {
                    bubbles: true,
                    detail: {
                        type: 'error',
                        message: jsonRes
                    }
                })
            );
        }
        this.isLoading = false;
    }
}
