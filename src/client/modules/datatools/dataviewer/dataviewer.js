import { LightningElement, track, api } from 'lwc';
import { classSet } from 'lightning/utils';
import { getCookieByName } from 'common/utils';
export default class App extends LightningElement {
    @api handleclick;
    @track status = {};
    @track dataExtensions = {};
    @track privateDataExtension;
    @track newDataExtension = {};
    @track isPanelClosed = false;
    @track selectedDataExtensionName = '';
    @track isLoading = false;

    //data table
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

    //todo: chec if conversion needed
    typeMapping = {
        Text: 'text',
        Date: 'date',
        Number: 'number',
        Decimal: 'decimal',
        Boolean: 'checkbox',
        Phone: 'phone',
        Locale: 'locale'
    };

    handlehome() {
        this.dispatchEvent(
            new CustomEvent('home', {
                bubbles: true,
                composed: true,
                detail: {}
            })
        );
    }

    handleClickOpen() {
        const id = this.privateDataExtension.id;
        window.open(
            `https://mc.s7.exacttarget.com/contactsmeta/admin.html#admin/data-extension/${id}/properties/`,
            '_blank'
        );
    }
    set selectedDataExtension(value) {
        this.updateDataExtension(value);
    }
    get selectedDataExtension() {
        return this.privateDataExtension;
    }

    async updateDataExtension(value) {
        if (value) {
            console.log('dispatch close panel event');
            this.dispatchEvent(new CustomEvent('closepanel'), {
                bubbles: true,
                composed: true
            });
            this.isLoading = true;
            //get fields
            const resDE = await fetch(
                `/dataTools/getDataExtension/${value.key}/fields`
            );
            if (resDE.status === 200) {
                // raw fields
                const Fields = await resDE.json();
                value.fields = Fields.map((field) => {
                    return {
                        label: field.Name,
                        fieldName: field.Name,
                        type:
                            this.typeMapping[field.FieldType] ||
                            field.FieldType,
                        sortable: true
                    };
                });
            } else {
                this.dispatchEvent(
                    new CustomEvent('error', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            type: 'error',
                            message: 'Authentication error',
                            link: '/dataTools/login'
                        }
                    })
                );
            }
            this.isLoading = false;
        }
        this.privateDataExtension = value;
    }

    get computedPanelClass() {
        let classes = classSet('slds-split-view_container');
        if (this.isPanelClosed) {
            classes.add('slds-is-closed');
        } else {
            classes.add('slds-is-open');
        }

        return classes.toString();
    }
    togglePanel() {
        this.isPanelClosed = !this.isPanelClosed;
    }

    showErrors(e) {
        console.log('showerrors in app', e);
        this.alert = e.detail;
    }
    handleFilter(e) {
        console.log('handleFilter', e);
        if (e.detail.value && e.detail.field && e.detail.operator) {
            this.selectedDataExtension.filter = e.detail;
        } else {
            this.selectedDataExtension.filter = null;
        }
    }

    handleSelectItem(e) {
        e.stopPropagation();

        if (e.detail && e.detail.name) {
            if (
                this.selectedDataExtension == null ||
                e.detail.name !== this.selectedDataExtension.name
            ) {
                this.selectedDataExtension = e.detail;
            }
        } else {
            this.selectedDataExtension = null;
        }
    }
    async handleLoad(e) {
        console.log('handleoad', e);
        this.isLoading = true;
        const resData = await fetch('/dataTools/getDataExtensionData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xsrf-token': getCookieByName.call(this, 'XSRF-TOKEN')
            },
            body: JSON.stringify({
                key: this.privateDataExtension.key,
                name: this.privateDataExtension.name,
                filter: this.privateDataExtension.filter,
                fields: this.privateDataExtension.fields
            })
        });
        if (resData.status === 200) {
            this.privateDataExtension.rows = await resData.json();
        } else if (resData.status === 204) {
            this.dispatchEvent(
                new CustomEvent('error', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        type: 'warning',
                        message: 'No Data Found'
                    }
                })
            );
        } else {
            this.dispatchEvent(
                new CustomEvent('error', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        type: 'error',
                        message: await resData.json()
                    }
                })
            );
        }
        this.isLoading = false;
    }

    // Used to sort the 'Age' column
    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.privateDataExtension.rows];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.privateDataExtension.rows = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
}
