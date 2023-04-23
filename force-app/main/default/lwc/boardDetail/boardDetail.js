import { LightningElement, api, wire, track } from 'lwc';
import getBoardDetails from '@salesforce/apex/BoardController.getBoardDetails';
import { createRecord, updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

export default class BoardDetail extends LightningElement {
    @api recordId;
    @track sections = [];
    wiredResult;

    @wire(getBoardDetails, { boardId: '$recordId' })
    wiredGetBoardDetails(result) {
        this.wiredResult = result;
        if (result.data && result.data.length > 0) {
            this.sections = JSON.parse(JSON.stringify(result.data));
        }

        if (result.error) {
            console.log('Error occured while fetching data ', result.error);
        }
    }


    async addNewItemClickHandler(event) {
        let sectionId = event.target.dataset.sectionId;

        const fields = { Section__c: sectionId, LikeCount__c: 0 };
        const recordInput = { apiName: 'Board_Section_Item__c', fields };
        const resp = await createRecord(recordInput);
        fields.Id = resp.id;

        let section = this.sections.find(a => a.Id == sectionId);
        if (!section?.Board_Section_Items__r) {
            section.Board_Section_Items__r = [];
        }
        section.Board_Section_Items__r.push(fields);
    }

    async updateItemDescriptionHandler(event) {
        let itemId = event.target.dataset.sectionItemId,
            itemDescription = event.target.value;

        const fields = { Id: itemId, Description__c: itemDescription };
        await updateRecord({ fields });
    }

    async likeSectionItemHandler(event) {
        let itemId = event.target.dataset.sectionItemId,
            sectionId = event.target.dataset.sectionId;

        let sectionItemRow = this.sections.find(a => a.Id == sectionId)?.Board_Section_Items__r.find(a => a.Id == itemId),
            likeCount = parseInt(sectionItemRow.LikeCount__c ?? 0) + 1;

        const fields = { Id: itemId, LikeCount__c: likeCount };
        await updateRecord({ fields });

        sectionItemRow.LikeCount__c = likeCount;


    }

    async deleteSectionItemHandler(event) {
        let itemId = event.target.dataset.sectionItemId;

        await deleteRecord(itemId);

        await refreshApex(this.wiredResult);
    }
}