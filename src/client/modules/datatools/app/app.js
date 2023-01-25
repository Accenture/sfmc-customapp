import { LightningElement, track } from 'lwc';

// import Welcome from 'sfmc/welcomemat';

export default class App extends LightningElement {
    // @track currentapp;
    // @track alert = {};

    // get isdataassessor() {
    //     return this.currentapp === 'dataassessor';
    // }
    // get isdataviewer() {
    //     return this.currentapp === 'dataviewer';
    // }

    // get isNone() {
    //     return this.currentapp == null;
    // }

    // async connectedCallback(){
    //     const result = await Welcome.open({
    //         size: 'large',
    //         description: 'Accessible description of modal\'s purpose',
    //         content: 'Passed into content api',
    //     })

    //     // if modal closed with X button, promise returns result = 'undefined'
    //     // if modal closed with OK button, promise returns result = 'okay'
    //     console.log('connectedCallback', result);
    // }

    // showAlert(e) {
    //     if (e.detail.type) {
    //         this.alert = e.detail;
    //     } else {
    //         this.alert = {
    //             type: 'error',
    //             message: e.detail.message || JSON.stringify(e.detail.errors)
    //         };
    //     }
    // }

    // selectApp(e) {
    //     if (e.detail && e.detail.name) {
    //         this.currentapp = e.detail.name;
    //     } else {
    //         this.currentapp = null;
    //     }
    // }
}
