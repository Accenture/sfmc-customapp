import { LightningElement, track, api } from 'lwc';

export default class App extends LightningElement {
    @api handleclick;
    @track status = { loading: false };
    @track rows = null;
    @track headers = null;
    @track settings = {
        defaultPhoneLocale: 'US',
        inputdata: null
    };

    get hasNoInputData() {
        return !this.settings.inputdata;
    }

    get hasNotLoadedData() {
        if (this.rows && this.headers) {
            return false;
        }
        return true;
    }

    handlehome() {
        this.dispatchEvent(
            new CustomEvent('home', {
                bubbles: true,
                composed: true,
                detail: {}
            })
        );
    }

    loadData(inputdata) {
        this.status.loading = true;
        if (inputdata.target.files[0].size > 1e7) {
            this.status.loading = false;
            this.dispatchEvent(
                new CustomEvent('error', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        type: 'error',
                        message: 'Only files up to 10mb are supported',
                        link: '/dataTools/login'
                    }
                })
            );
        } else {
            this.settings.inputdata = inputdata.target.files[0];
            this.status.loading = false;
        }
    }

    updatedfield(e) {
        let i = 0;
        for (const header of this.headers) {
            if (header.key === e.detail.key) {
                this.headers[i] = e.detail;
                break;
            } else {
                i++;
            }
        }
    }

    deletedfield(e) {
        let i = 0;

        for (const header of this.headers) {
            if (header.key === e.detail.key) {
                this.headers.splice(i, 1);
                break;
            } else {
                i++;
            }
        }
        const tempRows = JSON.parse(JSON.stringify(this.rows));
        //this.rows = null;
        console.log(JSON.stringify(tempRows[0]));
        for (const row of tempRows) {
            //delete row.columns[i];
            row.columns.splice(i, 1);
        }
        console.log(JSON.stringify(tempRows[0]));
        this.rows = tempRows;
    }

    setphonelocale(e) {
        this.settings.defaultPhoneLocale = e.detail.text;
    }

    async parsedata() {
        this.status.loading = true;
        this.rows = null;
        this.headers = null;
        const csrf = document.cookie
            .split(';')
            .find((row) => row.startsWith('XSRF-TOKEN'))
            .split('=')[1];
        const resData = await fetch(
            '/dataTools/exampledata?phonelocale=' +
                this.settings.defaultPhoneLocale,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                    'xsrf-token': csrf
                },
                body: await this.settings.inputdata.text()
            }
        );
        if (resData.status === 200) {
            const fields = await resData.json();
            this.rows = this.extractRows(fields);
            this.headers = this.extractHeaders(fields);
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
        this.status.loading = false;
    }
    changeField(button) {
        this.status.edit = true;
        console.log('buttonclick', button, button.target.id, button.detail);
    }
    togglesave() {
        this.status.save = !this.status.save;
    }

    handleloading(e) {
        console.log('handleloading', e);
        this.status.loading = e.detail;
    }
    extractHeaders(fields) {
        return fields.map((a) => {
            const matchPc = Math.round((a.match / a.total) * 100);
            const matchColor = matchPc > 0.95 ? '#4bca81;' : '#ffb75d';
            return {
                Name: a.Name,
                key: a.Name,
                FieldType: a.FieldType,
                Scale: a.Scale,
                Precision: a.Precision,
                IsPrimaryKey: a.IsPrimaryKey,
                IsRequired: a.IsRequired,
                match: matchPc,
                matchclass:
                    'width:' + matchPc + '%; background: ' + matchColor + ';',
                MaxLength: a.MaxLength,
                matchcolour:
                    matchPc === 100
                        ? 'slds-progress-bar__value slds-progress-bar__value_success'
                        : 'slds-progress-bar__value'
            };
        });
    }

    extractRows(fields) {
        const pivoted = [];
        let i = 0;
        for (const field of fields) {
            let ii = 0;
            for (const exampleValue of field.exampleData) {
                if (!pivoted[ii]) {
                    pivoted[ii] = { columns: [], key: ii };
                }
                pivoted[ii].columns.push({
                    value: exampleValue,
                    key: i + '-' + ii
                });
                ii++;
            }
            i++;
        }
        console.log(pivoted);
        return pivoted;
    }
}
