import { LightningElement, track } from 'lwc';

export default class App extends LightningElement {
    @track currentapp;
    @track alert = {};

    get isdataassessor() {
        return this.currentapp === 'dataassessor';
    }
    get isdataviewer() {
        return this.currentapp === 'dataviewer';
    }

    get isNone() {
        return this.currentapp == null;
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

    selectApp(e) {
        if (e.detail && e.detail.name) {
            this.currentapp = e.detail.name;
        } else {
            this.currentapp = null;
        }
    }
}
