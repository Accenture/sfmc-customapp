import { LightningElement, api, track } from 'lwc';

export default class FilterPanel extends LightningElement {
    @api fields;
    @track filter = {};

    operators = [
        { value: 'equals', label: '=' },
        { value: 'notEquals', label: '!=' },
        { value: 'greaterThan', label: '>' },
        { value: 'lessThan', label: '<' },
        { value: 'isNull', label: 'IS NULL' },
        { value: 'isNotNull', label: 'IS NOT NULL' },
        { value: 'greaterThanOrEqual', label: '>=' },
        { value: 'lessThanOrEqual', label: '<=' },
        { value: 'between', label: 'BETWEEN' },
        { value: 'IN', label: 'IN' },
        { value: 'like', label: 'LIKE' }
    ];

    get privateFields() {
        return this.fields.map((f) => {
            const a = { ...f };
            a.value = f.fieldName;
            a.label = f.label;
            return a;
        });
    }

    operatorHandler(e) {
        if (e.detail.value) {
            this.filter.operator = e.detail.value;
        } else {
            delete this.filter.operator;
        }
        this.fireEvent(this.filter);
    }
    fieldHandler(e) {
        if (e.detail.value) {
            this.filter.field = e.detail.value;
        } else {
            delete this.filter.field;
        }
        this.fireEvent(this.filter);
    }
    valueHandler(e) {
        if (e.target.value) {
            this.filter.value = e.target.value;
        } else {
            delete this.filter.value;
        }
        this.fireEvent(this.filter);
    }
    fireEvent(filter) {
        console.log(JSON.stringify(filter));
        this.dispatchEvent(
            new CustomEvent('filterchange', {
                bubbles: true,
                composed: true,
                detail: filter
            })
        );
    }
}
