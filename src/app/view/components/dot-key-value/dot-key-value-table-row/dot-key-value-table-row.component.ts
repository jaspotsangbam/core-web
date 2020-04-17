import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { DotMessageService } from '@services/dot-messages-service';
import { take } from 'rxjs/operators';
import * as _ from 'lodash';
import { DotMessageDisplayService } from '@components/dot-message-display/services';
import { DotMessageSeverity, DotMessageType } from '@components/dot-message-display/model';
import { DotKeyValue } from '@shared/models/dot-key-value/dot-key-value.model';
import { DotKeyValueUtil } from '../util/dot-key-value-util';

@Component({
    selector: 'dot-key-value-table-row',
    styleUrls: ['./dot-key-value-table-row.component.scss'],
    templateUrl: './dot-key-value-table-row.component.html'
})
export class DotKeyValueTableRowComponent implements OnInit, OnChanges {
    @ViewChild('saveButton')
    saveButton: ElementRef;
    @ViewChild('valueCell')
    valueCell: ElementRef;

    @Input() showHiddenField: boolean;
    @Input() isHiddenField: boolean;
    @Input() variable: DotKeyValue;
    @Input() variableIndex: number;
    @Input() variablesList: DotKeyValue[] = [];

    @Output()
    save: EventEmitter<DotKeyValue> = new EventEmitter(false);
    @Output()
    cancel: EventEmitter<number> = new EventEmitter(false);
    @Output()
    delete: EventEmitter<DotKeyValue> = new EventEmitter(false);

    variableCopy: DotKeyValue;
    showEditMenu: Boolean = false;
    saveDisabled: Boolean = false;
    messages: { [key: string]: string } = {};
    elemRef: ElementRef;

    constructor(
        public dotMessageService: DotMessageService,
        private dotMessageDisplayService: DotMessageDisplayService
    ) {}

    ngOnInit(): void {
        this.dotMessageService
            .getMessages([
                'keyValue.key_input.placeholder',
                'keyValue.value_input.placeholder',
                'Save',
                'Cancel',
                'keyValue.error.duplicated.variable'
            ])
            .pipe(take(1))
            .subscribe((messages: { [key: string]: string }) => {
                this.messages = messages;
            });
        this.variableCopy = _.cloneDeep(this.variable);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.variable) {
            this.variableCopy = _.cloneDeep(this.variable);
        }
    }

    /**
     * Focus on Key input
     * @param {Event} [$event]
     * @memberof DotKeyValueTableRowComponent
     */
    focusKeyInput($event: Event): void {
        $event.stopPropagation();
        this.valueCell.nativeElement.click();
    }

    /**
     * Sets initial fields properties
     *
     * @param {Event} $event
     * @memberof DotKeyValueTableRowComponent
     */
    editFieldInit($event?: Event): void {
        this.showEditMenu = true;
        const isKeyVariableDuplicated = DotKeyValueUtil.isFieldVariableKeyDuplicated(
            this.variableCopy,
            this.variablesList
        );

        this.saveDisabled = DotKeyValueUtil.isSaveDisabled(
            isKeyVariableDuplicated,
            this.variableCopy
        );

        if (DotKeyValueUtil.shouldDisplayDuplicatedVariableError(isKeyVariableDuplicated, $event)) {
            this.dotMessageDisplayService.push({
                life: 3000,
                message: this.messages['keyValue.error.duplicated.variable'].replace(
                    '{0}',
                    (<HTMLInputElement>$event.target).value
                ),
                severity: DotMessageSeverity.ERROR,
                type: DotMessageType.SIMPLE_MESSAGE
            });
        }
    }

    /**
     * Handle Cancel event event emmitting variable index to parent component
     * @param {KeyboardEvent} $event
     * @memberof DotKeyValueTableRowComponent
     */
    onCancel($event: KeyboardEvent): void {
        $event.stopPropagation();
        this.showEditMenu = false;
        this.cancel.emit(this.variableIndex);
    }

    /**
     * Handle Enter key event
     * @memberof DotKeyValueTableRowComponent
     */
    onPressEnter(): void {
        this.saveButton.nativeElement.click();
    }

    /**
     * Handle Save event emitting variable value to parent component
     * @memberof DotKeyValueTableRowComponent
     */
    saveVariable(): void {
        this.showEditMenu = false;
        this.save.emit(this.variableCopy);
    }
}
