import { LightningElement, track } from 'lwc';
import { getCookieByName } from 'common/utils';

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
        const rawRes = await fetch('/platformevent/sfdccredentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xsrf-token': getCookieByName.call(this, 'XSRF-TOKEN')
            },
            redirect: 'follow',
            body: JSON.stringify(this.config)
        });

        const jsonRes = await rawRes.json();
        if (rawRes.status < 300) {
            const popup = window.open(
                jsonRes.redirect,
                'sfdc_login',
                'width=500,height=500'
            );
            // we are running a check every 3 seconds if the popup is
            // complete since it was easier to implement than having a
            // whole other screen to return the values
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            const checkComplete = setInterval(() => {
                if (
                    popup.location.href.includes(
                        '/platformevent/oauth/response/'
                    )
                ) {
                    popup.close();
                    clearInterval(checkComplete);
                    this.isLoading = false;
                    this.isEditing = false;
                }
            }, 1000);
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
            this.isLoading = false;
        }
    }
    async connectedCallback() {
        this.isLoading = true;
        const rawRes = await fetch('/platformevent/sfdcstatus');
        const jsonRes = await rawRes.json();
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
