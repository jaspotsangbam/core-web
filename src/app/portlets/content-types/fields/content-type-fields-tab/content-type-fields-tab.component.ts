import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FieldTab, ContentTypeField } from '../shared';
import { DotMessageService } from '@services/dot-messages-service';
import { FieldDivider } from '@portlets/content-types/fields/shared/field-divider.interface';
import { DotAlertConfirmService } from '@services/dot-alert-confirm/dot-alert-confirm.service';

/**
 * Display Tab Field
 *
 * @export
 * @class ContentTypeFieldsTabComponent
 */
@Component({
    selector: 'dot-content-type-fields-tab',
    styleUrls: ['./content-type-fields-tab.component.scss'],
    templateUrl: './content-type-fields-tab.component.html'
})
export class ContentTypeFieldsTabComponent implements OnInit {
    @Input() fieldTab: FieldTab;

    @Output() editTab: EventEmitter<ContentTypeField> = new EventEmitter();
    @Output() removeTab: EventEmitter<FieldDivider> = new EventEmitter();

    i18nMessages: any = {};

    constructor(private dotMessageService: DotMessageService, private dotDialogService: DotAlertConfirmService) {}

    ngOnInit() {
        this.dotMessageService
            .getMessages([
                'contenttypes.action.delete',
                'contenttypes.confirm.message.delete.field',
                'contenttypes.content.field',
                'contenttypes.action.cancel'
            ])
            .subscribe((res) => {
                this.i18nMessages = res;
            });
    }

    /**
     * Trigger the editTab event to change tab label
     * @memberof ContentTypeFieldsTabComponent
     */
    changeLabel(): void {
        this.editTab.emit(this.fieldTab.getFieldDivider());
    }

    /**
     * Trigger confirmation dialog to remove Tab Divider
     * @param {MouseEvent} $event
     * @memberof ContentTypeFieldsTabComponent
     */
    removeItem($event: MouseEvent): void {
        $event.stopPropagation();

        this.dotDialogService.confirm({
            accept: () => {
                this.removeTab.emit(this.fieldTab);
            },
            header: `${this.i18nMessages['contenttypes.action.delete']} ${this.i18nMessages['contenttypes.content.field']}`,
            message: this.dotMessageService.get('contenttypes.confirm.message.delete.field', this.fieldTab.getFieldDivider().name),
            footerLabel: {
                accept: this.i18nMessages['contenttypes.action.delete'],
                reject: this.i18nMessages['contenttypes.action.cancel']
            }
        });
    }


}