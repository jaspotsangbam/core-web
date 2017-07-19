import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Field } from '../';

/**
 * This display field after being dropped into a Content Type Drop zone
 * @export
 * @class ContentTypesFieldDragabbleItemComponent
 */
@Component({
    selector: 'content-type-field-dragabble-item',
    templateUrl: './content-type-field-dragabble-item.component.html',
})
export class ContentTypesFieldDragabbleItemComponent {
    @Input() field: Field;
    @Output() remove: EventEmitter<Field> = new EventEmitter();

}