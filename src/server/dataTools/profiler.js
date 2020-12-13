const logger = require('../utils/logger');
const csv = require('csvtojson');
const moment = require('moment');
const languageCodes = require('../resources/ISO_639-1.json');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const guessDataType = (values, phoneLocale) => {
    const possibleTypes = {
        Date: 0,
        Text: 0,
        EmailAddress: 0,
        Number: 0,
        Decimal: 0,
        Boolean: 0,
        Phone: 0,
        Locale: 0
    };
    // dateFormats
    const dateFormats = ['YYYY-MM-DDTHH:mm:ss.SSSZ'];
    for (const line of values) {
        // date time
        const m = moment(line, dateFormats, true);
        const possibleDate = m.isValid();
        // locale
        const possibleLocale = languageCodes.filter((code) => {
            try {
                if (line.toLowerCase() === code.toLowerCase()) {
                    return true;
                } else if (line.startsWith(code + '-') && line.length === 5) {
                    return true;
                }
                return false;
            } catch (ex) {
                logger.error(ex, line);
                throw new Error(
                    JSON.stringify({ messsage: ex.message, value: line })
                );
            }
        });

        let phNumber = null;
        try {
            phNumber = phoneUtil.parseAndKeepRawInput(line, phoneLocale);
        } catch (ex) {
            //nothing to catch
        }

        if (
            !line ||
            line === undefined ||
            line === '' ||
            line.length === 0 ||
            line === '<null>'
        ) {
            //do nothing just here to remove
        } else if (phNumber && phoneUtil.isValidNumber(phNumber)) {
            possibleTypes.Phone++;
        } else if (possibleDate) {
            possibleTypes.Date++;
        } else if (Number.isSafeInteger(Number(line))) {
            possibleTypes.Number++;
        } else if (!isNaN(line)) {
            possibleTypes.Decimal++;
        } else if (['true', 'false'].includes(line.toLowerCase())) {
            possibleTypes.Boolean++;
        } else if (
            line.includes('@') &&
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(line)
        ) {
            possibleTypes.EmailAddress++;
        } else if (possibleLocale.length > 0) {
            possibleTypes.Locale++;
        } else {
            possibleTypes.Text++;
        }
    }
    //set any defaults here
    const bestGuess = {
        FieldType: 'Text',
        match: null,
        total: values.length,
        MaxLength: 50,
        IsRequired: false,
        IsPrimaryKey: false
    };
    for (const type in possibleTypes) {
        if (
            possibleTypes[type] > 0 &&
            (bestGuess.match === null || possibleTypes[type] > bestGuess.match)
        ) {
            bestGuess.FieldType = type;
            bestGuess.match = possibleTypes[type];
        }
    }
    //manage field length
    if (['Text'].includes(bestGuess.FieldType)) {
        //safe Values
        const safeValues = values.filter(
            (value) =>
                value && value !== undefined && value !== '' && value.length > 0
        );
        //get length
        const lenMax =
            safeValues.length === 0
                ? 50
                : Math.max.apply(
                      Math,
                      safeValues.map(function (value) {
                          return value.length;
                      })
                  );
        const lenMin =
            safeValues.length === 0
                ? 50
                : Math.min.apply(
                      Math,
                      safeValues.map(function (value) {
                          return value.length;
                      })
                  );
        // this is likely a field always filled with the same number of characters like a SFDC ID
        if (lenMax > 0 && lenMax === lenMin) {
            bestGuess.MaxLength = lenMax;
        } else if (lenMax >= 255) {
            // limit to 4000
            bestGuess.MaxLength = 4000;
        } else if (lenMax >= 50) {
            bestGuess.MaxLength = 255;
        } else if (lenMax >= 10) {
            bestGuess.MaxLength = 50;
        } else {
            // in case it is less than 10 it is likely a code of some sort so just use the max
            bestGuess.MaxLength = lenMax;
        }
    }
    if (bestGuess.FieldType === 'EmailAddress') {
        bestGuess.MaxLength = 254;
    }
    if (['Date', 'Number'].includes(bestGuess.FieldType)) {
        delete bestGuess.MaxLength;
    }
    // is IsRequired
    const missing = values.filter(
        (value) =>
            !value ||
            value === undefined ||
            value === '' ||
            value.length === 0 ||
            value === '<null>'
    );
    if (missing.length === 0) {
        bestGuess.IsRequired = true;
    }
    //is IsPrimaryKey key
    if (['Text', 'Number', 'EmailAddress'].includes(bestGuess.FieldType)) {
        const uniqueValues = [...new Set(values)];
        if (uniqueValues.length === values.length) {
            bestGuess.IsPrimaryKey = true;
        }
    }
    //to do get Scale
    if (bestGuess.FieldType === 'Decimal') {
        //get length after decimal point (currently comma is not supported)
        bestGuess.Scale = Math.max.apply(
            Math,
            values.map((value) => {
                const decimals = value.split('.')[1];
                return decimals ? decimals.length : 0;
            })
        );
        const tempPrecision = Math.max.apply(
            Math,
            values.map((value) => value.length)
        );
        bestGuess.Precision =
            bestGuess.Scale > 0 ? tempPrecision - 1 : tempPrecision;
    }
    return bestGuess;
};

module.exports = {
    async parse(dataurl, phoneLocale) {
        const lines = await csv({ flatKeys: true }).fromString(dataurl);

        //initialise object from first row
        const byField = {};
        for (const column in lines[0]) {
            if (Object.prototype.hasOwnProperty.call(lines[0], column)) {
                byField[column] = [];
            }
        }
        //add values to field
        for (const line of lines) {
            for (const column in line) {
                if (Object.prototype.hasOwnProperty.call(line, column)) {
                    byField[column].push(line[column]);
                }
            }
        }
        const fields = [];
        // guess data type
        for (const field in byField) {
            if (Object.prototype.hasOwnProperty.call(byField, field)) {
                const metrics = guessDataType(byField[field], phoneLocale);
                //create dataExtensionField Metadata
                fields.push({
                    ...metrics,
                    Ordinal: fields.length,
                    Name: field,
                    exampleData: byField[field].slice(0, 200)
                });
            }
        }
        return fields;
    }
};
