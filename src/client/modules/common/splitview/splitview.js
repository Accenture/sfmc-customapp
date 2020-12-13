import { LightningElement, track } from 'lwc';
import { classSet } from 'lightning/utils';
export default class SplitView extends LightningElement {
    @track isPanelClosed = false;
    get computedMainClass() {
        let classes = classSet('panel slds-split-view_container');
        if (this.isPanelClosed) {
            classes.add('mainmax');
        } else {
            classes.add('mainmin');
        }

        return classes.toString();
    }

    togglePanel() {
        this.isPanelClosed = !this.isPanelClosed;
    }
    handleOpenPanel() {
        this.isPanelClosed = false;
    }
    handleClosePanel() {
        console.log('closing pannel');
        this.isPanelClosed = true;
    }
}
