const logger = require('../utils/logger');
const core = require('./core.js');

const extractPermissions = (payload, parent) => {
    const results = [];
    for (const perm of payload) {
        const fullPath = parent ? parent + ' > ' + perm.Name[0] : perm.Name[0];
        if (perm.PermissionSets && perm.PermissionSets[0].PermissionSet) {
            const sub = extractPermissions(
                perm.PermissionSets[0].PermissionSet,
                fullPath
            );
            results.push(...sub);
        } else if (perm.Permissions && perm.Permissions[0].Permission) {
            const sub = extractPermissions(
                perm.Permissions[0].Permission,
                fullPath
            );
            results.push(...sub);
        } else {
            const obj = {};

            if (perm.IsDenied && perm.IsDenied[0] === 'true') {
                obj[fullPath] = 'Deny';
            } else if (perm.IsAllowed && perm.IsAllowed[0] === 'true') {
                obj[fullPath] = 'Allow';
            } else {
                obj[fullPath] = '-';
            }

            results.push(obj);
        }
    }
    return results;
};

exports.getRoleDetails = async (req, res) => {
    try {
        const roles = JSON.parse(req.body);

        const body = {
            RetrieveRequestMsg: {
                RetrieveRequest: {
                    ObjectType: 'Role',
                    Properties: [
                        'Name',
                        'PermissionSets',
                        'Description',
                        'ObjectID'
                    ],
                    Filter: {
                        $: {
                            'xsi:type': 'SimpleFilterPart'
                        },
                        Property: 'CustomerKey',
                        SimpleOperator: roles.length === 1 ? 'equals' : 'IN',
                        Value: roles.length === 1 ? roles[0] : roles
                    }
                }
            }
        };
        const json = await core.soapRequest(
            body,
            'Retrieve',
            req.session.auth.access_token
        );
        if (json.OverallStatus !== 'OK') {
            throw new Error(json.OverallStatus);
        }

        const tableRenderObj = {};
        for (const role of json.Results) {
            const arrPerms = extractPermissions(
                role.PermissionSets[0].PermissionSet
            );
            arrPerms.forEach((perm) => {
                const key = Object.keys(perm)[0];
                if (!tableRenderObj[key]) {
                    tableRenderObj[key] = {};
                }
                tableRenderObj[key][role.Name[0]] = perm[key];
            });
        }

        const backToArray = Object.keys(tableRenderObj).map((key) => {
            const record = { permission: key, id: key };
            Object.keys(tableRenderObj[key]).forEach((roleKey) => {
                record[roleKey] = tableRenderObj[key][roleKey];
            });
            return record;
        });
        res.send(backToArray);
    } catch (ex) {
        logger.error(ex);
        res.status(500).send(ex.message);
    }
};
exports.getRoles = async (req, res) => {
    try {
        const body = {
            RetrieveRequestMsg: {
                RetrieveRequest: {
                    ObjectType: 'Role',
                    Properties: [
                        'Name',
                        'CustomerKey',
                        'Description',
                        'ObjectID'
                    ],
                    Filter: {
                        $: {
                            'xsi:type': 'SimpleFilterPart'
                        },
                        Property: 'IsPrivate',
                        SimpleOperator: 'equals',
                        Value: 'false'
                    }
                }
            }
        };
        const json = await core.soapRequest(
            body,
            'Retrieve',
            req.session.auth.access_token
        );
        res.send(json);
    } catch (ex) {
        logger.error(ex);
        res.status(500).send(ex.message);
    }
};
/** @description returns all data extensions (up to 2500)
 * @memberof server/sfmc
 * @function
 * @param {String} token auth token from session
 * @return {Array} name of Attribute Set if found
 */
exports.getFolders = async (req) => {
    const body = {
        RetrieveRequestMsg: {
            RetrieveRequest: {
                ObjectType: 'DataFolder',
                //QueryAllAccounts: "true",
                Properties: ['Name', 'ParentFolder.ID', 'ID', 'ContentType'],
                Filter: {
                    $: {
                        'xsi:type': 'SimpleFilterPart'
                    },
                    Property: 'ContentType',
                    SimpleOperator: 'IN',
                    Value: [
                        'dataextension',
                        'salesforcedataextension',
                        'shared_dataextension',
                        'shared_salesforcedataextension',
                        'synchronizeddataextension'
                    ]
                }
            }
        }
    };
    const response = await core.soapRequest(body, 'Retrieve', req.session.auth);
    return core.flattenResults(response.Results);
};
