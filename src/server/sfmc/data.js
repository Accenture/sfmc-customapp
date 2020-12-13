const logger = require('../utils/logger');
const core = require('./core.js');
/** @description returns all data extensions (up to 2500)
 * @memberof server/sfmc
 * @function
 * @param {Object} req express request object
 * @return {Array} name of Attribute Set if found
 */
exports.getDataExtensions = async (req) => {
    const body = {
        RetrieveRequestMsg: {
            RetrieveRequest: {
                ObjectType: 'DataExtension',
                Properties: ['Name', 'CustomerKey', 'CategoryID', 'ObjectID']
            }
        }
    };

    const response = await core.soapRequest(body, 'Retrieve', req.session.auth);
    return core.flattenResults(response.Results);
};
/** @description returns all data extensions (up to 2500)
 * @memberof server/sfmc
 * @function
 * @param {Object} req request
 * @return {Array} name of Attribute Set if found
 */
exports.getDataExtensionFields = async (req) => {
    const fieldProperties = req.body.fields || ['Name', 'FieldType'];
    const body = {
        RetrieveRequestMsg: {
            RetrieveRequest: {
                ObjectType: 'DataExtensionField',
                //QueryAllAccounts: "true",
                Properties: fieldProperties,
                Filter: {
                    $: {
                        'xsi:type': 'SimpleFilterPart'
                    },
                    Property: 'DataExtension.CustomerKey',
                    SimpleOperator: 'equals',
                    Value: req.params.key
                }
            }
        }
    };
    const rawResults = await core.soapRequest(
        body,
        'Retrieve',
        req.session.auth
    );
    return core.parseSOAPResponse(rawResults).map((field) => {
        const obj = {};
        for (const key in field) {
            if (fieldProperties.includes(key)) {
                obj[key] = field[key][0];
            }
        }
        return obj;
    });
};
/** @description returns all data extension rows (up to 2500)
 * @memberof server/sfmc
 * @function
 * @param {Object} req request
 * @return {Array} name of Attribute Set if found
 */
exports.getDataExtensionData = async (req, name, fields) => {
    const body = {
        RetrieveRequestMsg: {
            RetrieveRequest: {
                ObjectType: 'DataExtensionObject[' + name + ']',
                Properties: fields
            }
        }
    };
    if (req.body.filter) {
        body.RetrieveRequestMsg.RetrieveRequest.Filter = {
            $: {
                'xsi:type': 'SimpleFilterPart'
            },
            Property: req.body.filter.field,
            SimpleOperator: req.body.filter.operator,
            Value: req.body.filter.value
        };
    }
    const rawResults = await core.soapRequest(
        body,
        'Retrieve',
        req.session.auth
    );
    const parsedresults = core.parseSOAPResponse(rawResults);
    // convert key value array to object
    if (parsedresults) {
        const rows = parsedresults.map((row) => {
            const obj = {};
            row.Properties[0].Property.filter((prop) =>
                fields.includes(prop.Name[0])
            ).forEach((prop) => {
                obj[prop.Name[0]] = prop.Value[0];
            });
            return obj;
        });
        return rows;
    }
    return null;
};
/** @description creates data extension
 * @memberof server/sfmc
 * @function
 * @param {Object} req request
 * @return {Array} name of Attribute Set if found
 */
exports.createDataExtension = async (req) => {
    const metadata = JSON.parse(req.body);
    const body = {
        CreateRequest: {
            Objects: {
                $: {
                    'xsi:type': 'DataExtension'
                },
                Name: metadata.name,
                CustomerKey: metadata.name,
                Fields: {
                    Field: metadata.fields
                }
            }
        }
    };

    const rawResults = await core.soapRequest(body, 'Create', req.session.auth);
    const res = await core.parseSOAPResponse(rawResults);

    return res;
};
