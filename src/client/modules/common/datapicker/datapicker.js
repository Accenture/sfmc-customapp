import { LightningElement, track } from 'lwc';
import { classSet } from 'lightning/utils';
export default class DataPicker extends LightningElement {
    @track alert = {};
    @track status = {};
    @track isLoading = false;
    @track nestedItems = {};
    @track keyvalueItems = {};

    async connectedCallback() {
        try {
            this.isLoading = true;
            const resDEs = await fetch('/dataTools/getDataExtensions');
            const resFolders = await fetch('/dataTools/getFolders');
            const DElist = await resDEs.json();
            const Folderlist = await resFolders.json();
            if (resDEs.status === 200 && resFolders.status === 200) {
                this.createNestedStructure(Folderlist, DElist);
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
        } catch (ex) {
            this.dispatchEvent(
                new CustomEvent('error', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        type: 'error',
                        message: ex.message
                    }
                })
            );
        }
        this.isLoading = false;
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

    createNestedStructure(folderList, deList) {
        //add root
        folderList.push({ ID: 0, Name: 'Root' });
        // create list of IDs
        const sortedList = folderList.map((folder) => folder.ID);
        // clean up main array and sort above array with deepest dependencies at bottom
        const cleanedFolderList = folderList.map((folder) => {
            delete folder.PartnerKey;
            delete folder.ObjectID;
            if (folder.ParentFolder) {
                delete folder.ParentFolder.ObjectID;
                delete folder.ParentFolder.$;
                delete folder.ParentFolder.PartnerKey;
                folder.ParentFolder.ID = folder.ParentFolder.ID[0];
            }
            const childIndex = sortedList.indexOf(folder.ID);
            if (folder.ParentFolder) {
                const parentIndex = sortedList.indexOf(folder.ParentFolder.ID);
                if (parentIndex > childIndex) {
                    //delete existing child index
                    sortedList.splice(childIndex, 1);
                    //insert below parent
                    sortedList.splice(parentIndex, 0, folder.ID);
                }
            } else {
                //delete existing child index
                sortedList.splice(childIndex, 1);
                //insert below parent
                sortedList.splice(0, 0, folder.ID);
            }
            return folder;
        });
        // convert array to object
        const objectFolders = cleanedFolderList.reduce((acc, folder) => {
            const obj = {
                items: [],
                type: 'Folder',
                id: folder.ID,
                name: 'FOLDER:' + folder.ID,
                key: folder.ID,
                label: folder.Name,
                categoryId: folder.ParentFolder ? folder.ParentFolder.ID : null
            };
            acc[folder.ID] = obj;
            return acc;
        }, {});
        //add data extensions to folders
        deList.forEach((de) => {
            const obj = {
                label: de.Name,
                name: de.CustomerKey,
                id: de.ObjectID
            };
            objectFolders[de.CategoryID].items.push(obj);
            this.keyvalueItems[de.CustomerKey] = obj;
        });

        //now nest things based on reverse order
        sortedList.reverse().forEach((ID) => {
            if (objectFolders[ID].categoryId) {
                objectFolders[objectFolders[ID].categoryId].items.push(
                    objectFolders[ID]
                );
                delete objectFolders[ID];
            }
        });
        //convert back to array
        this.nestedItems = objectFolders[0];
    }

    handleClick(e) {
        e.stopPropagation();
        if (e.detail.name.startsWith('FOLDER:')) {
            console.log('Clicking Folder shouldnt do anything', e.detail);
        } else {
            if (e.detail.name) {
                this.dispatchEvent(
                    new CustomEvent('selectitem', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            name: this.keyvalueItems[e.detail.name].label,
                            key: e.detail.name,
                            id: this.keyvalueItems[e.detail.name].id
                        }
                    })
                );
            } else {
                this.dispatchEvent(
                    new CustomEvent('selectitem', {
                        bubbles: true,
                        composed: true,
                        detail: null
                    })
                );
            }
        }
    }
}
