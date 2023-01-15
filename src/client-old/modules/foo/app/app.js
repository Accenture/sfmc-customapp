import { LightningElement } from "lwc";

export default class FooApp extends LightningElement {
    clickedButtonLabel;

    handleClick(event) {
        this.clickedButtonLabel = event.target.label;
    }
}
