import { Component, OnInit, Input, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';

import { PtItem, PtUser } from 'src/app/core/models/domain';
import { PtItemDetailsEditFormModel, ptItemToFormModel } from 'src/app/shared/models/forms';
import { PtItemType } from 'src/app/core/models/domain/types';
import { PriorityEnum } from 'src/app/core/models/domain/enums';
import { ItemType, PT_ITEM_STATUSES, PT_ITEM_PRIORITIES } from 'src/app/core/constants';
import { Observable } from 'rxjs';
import { Store } from 'src/app/core/state/app-store';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
    selector: 'app-item-details',
    templateUrl: 'pt-item-details.component.html',
    styleUrls: ['pt-item-details.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PtItemDetailsComponent implements OnInit {

    @Input() item: PtItem | undefined;
    @Output() itemSaved = new EventEmitter<PtItem>();
    @Output() usersRequested = new EventEmitter<string>();

    public users$: Observable<PtUser[]> = this.store.select<PtUser[]>('users');

    private selectedTypeValue: PtItemType | undefined;
    private selectedPriorityValue: PriorityEnum | undefined;
    public selectedAssignee: PtUser | undefined;

    public itemForm: PtItemDetailsEditFormModel = ptItemToFormModel();
    public itemTypesProvider = ItemType.List.map((t) => t.PtItemType);
    public statusesProvider = PT_ITEM_STATUSES;
    public prioritiesProvider = PT_ITEM_PRIORITIES;

    closeResult = '';

    constructor(
        private store: Store,
        private modalService: ModalService,
    ) { }

    public ngOnInit() {
        if (this.item) {
            this.itemForm = ptItemToFormModel(this.item);
            this.selectedTypeValue = <PtItemType>this.itemForm.typeStr;
            this.selectedPriorityValue = <PriorityEnum>this.itemForm.priorityStr;
            this.selectedAssignee = this.item.assignee;
        }
    }

    public onBlurTextField() {
        this.notifyUpdateItem();
    }

    public onDropdownChange() {
        this.notifyUpdateItem();
    }

    public assigneePickerOpen(id: string) {
        this.usersRequested.emit();
        this.openModal(id);
    }

    public selectUser(selectedUser: PtUser, id: string) {
        if (typeof selectedUser === 'object' && this.itemForm) {
            this.selectedAssignee = selectedUser;
            this.itemForm.assigneeName = (selectedUser as PtUser).fullName;
            this.notifyUpdateItem();
        }
        this.closeModal(id);
    }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    private notifyUpdateItem() {
        const updatedItem = this.getUpdatedItem();
        this.itemSaved.emit(updatedItem);
    }

    private getUpdatedItem(): PtItem | undefined {

        if (!this.itemForm) {
            return undefined;
        }
        const updatedItem = Object.assign({}, this.item, {
            title: this.itemForm.title,
            description: this.itemForm.description,
            type: this.itemForm.typeStr,
            status: this.itemForm.statusStr,
            priority: this.itemForm.priorityStr,
            estimate: this.itemForm.estimate,
            assignee: this.selectedAssignee
        });
        return updatedItem;
    }


}
