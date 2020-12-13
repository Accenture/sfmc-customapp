import { LightningElement, track, api } from 'lwc';

export default class FieldOptions extends LightningElement {
    @api field;
    @track updatedField;
    @track updatedName;
    @track updateType;
    @track isEdit = false;
    @track hasChange = false;

    types = [
        { value: 'Text', label: 'Text' },
        { value: 'Date', label: 'Date' },
        { value: 'Number', label: 'Number' },
        { value: 'Decimal', label: 'Decimal' },
        { value: 'Boolean', label: 'Boolean' },
        { value: 'Phone', label: 'Phone' },
        { value: 'Locale', label: 'Locale' },
        { value: 'EmailAddress', label: 'Email Address' }
    ];

    check;

    handleCheckboxChange(e) {
        this.updatedField.IsPrimaryKey = e.detail.value.includes(
            'IsPrimaryKey'
        );
        this.updatedField.IsRequired = e.detail.value.includes('IsRequired');
    }

    get checkBoxValues() {
        const checked = [];
        if (this.updatedField.IsPrimaryKey) {
            checked.push('IsPrimaryKey');
        }
        if (this.updatedField.IsRequired) {
            checked.push('IsRequired');
        }
        return checked;
    }

    get checkboxOptions() {
        return [
            {
                label: 'Primary Key',
                value: 'IsPrimaryKey'
            },
            {
                label: 'Required',
                value: 'IsRequired'
            }
        ];
    }

    get isText() {
        return this.updatedField.FieldType === 'Text';
    }

    get isNumber() {
        return this.updatedField.FieldType === 'Number';
    }

    get isDecimal() {
        return this.updatedField.FieldType === 'Decimal';
    }

    connectedCallback() {
        this.updatedField = JSON.parse(JSON.stringify(this.field));
        console.log(this.updatedField);
    }

    handleclick(e) {
        this.isEdit = true;
        console.log('click', e, this.field.Name, this.isEdit);
    }
    handlesave() {
        if (this.hasChange) {
            this.dispatchEvent(
                new CustomEvent('changefield', {
                    bubbles: true,
                    composed: true,
                    detail: this.updatedField
                })
            );
        }
        this.isEdit = false;
    }
    handledelete() {
        this.dispatchEvent(
            new CustomEvent('deletefield', {
                bubbles: true,
                composed: true,
                detail: this.updatedField
            })
        );
    }

    handleclose() {
        this.updatedField = JSON.parse(JSON.stringify(this.field));
        this.isEdit = false;
    }
    editname(e) {
        this.hasChange = true;
        this.updatedField.Name = e.detail.value;
    }
    editlen(e) {
        this.hasChange = true;
        this.updatedField.MaxLength = e.detail.value;
    }
    editprecision(e) {
        this.hasChange = true;
        this.updatedField.Precision = e.detail.value;
    }
    editscale(e) {
        this.hasChange = true;
        this.updatedField.Scale = e.detail.value;
    }
    edittype(e) {
        this.hasChange = true;
        //reset some values on type change
        if (e.detail.value !== 'Text') {
            delete this.updatedField.MaxLength;
        } else if (this.updatedField.MaxLength === null) {
            this.updatedField.MaxLength = 50;
        }
        if (e.detail.value !== 'Decimal') {
            delete this.updatedField.Precision;
            delete this.updatedField.Scale;
        } else if (
            this.updatedField.Precision === null &&
            this.updatedField.Scale === null
        ) {
            this.updatedField.Precision = 18;
            this.updatedField.Scale = 2;
        }
        this.updatedField.FieldType = e.detail.value;
    }
}
