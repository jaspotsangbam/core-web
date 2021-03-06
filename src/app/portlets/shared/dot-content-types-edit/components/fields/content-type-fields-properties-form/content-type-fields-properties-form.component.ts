import {
    Component,
    Output,
    EventEmitter,
    Input,
    SimpleChanges,
    ViewChild,
    OnChanges,
    OnInit,
    OnDestroy
} from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { DotMessageService } from '@services/dot-messages-service';
import { DotCMSContentTypeField } from 'dotcms-models';
import { FieldPropertyService } from '../service';
import { take, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { Subject } from 'rxjs';

@Component({
    selector: 'dot-content-type-fields-properties-form',
    styleUrls: ['./content-type-fields-properties-form.component.scss'],
    templateUrl: './content-type-fields-properties-form.component.html'
})
export class ContentTypeFieldsPropertiesFormComponent implements OnChanges, OnInit, OnDestroy {
    @Output() saveField: EventEmitter<any> = new EventEmitter();

    @Output() valid: EventEmitter<boolean> = new EventEmitter();

    @Input() formFieldData: DotCMSContentTypeField;

    @ViewChild('properties') propertiesContainer;

    form: FormGroup;
    fieldProperties: string[] = [];
    checkboxFields: string[] = ['indexed', 'listed', 'required', 'searchable', 'unique'];

    i18nMessages: {
        [key: string]: string;
    } = {};

    private originalValue: any;
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private fb: FormBuilder,
        public dotMessageService: DotMessageService,
        private fieldPropertyService: FieldPropertyService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.formFieldData.currentValue && this.formFieldData) {
            this.destroy();

            setTimeout(this.init.bind(this), 0);
        }
    }

    ngOnInit(): void {
        this.initFormGroup();

        this.dotMessageService
            .getMessages([
                'contenttypes.field.properties.name.label',
                'contenttypes.field.properties.category.label',
                'contenttypes.field.properties.required.label',
                'contenttypes.field.properties.user_searchable.label',
                'contenttypes.field.properties.system_indexed.label',
                'contenttypes.field.properties.listed.label',
                'contenttypes.field.properties.unique.label',
                'contenttypes.field.properties.default_value.label',
                'contenttypes.field.properties.hint.label',
                'contenttypes.field.properties.validation_regex.label',
                'contenttypes.field.properties.data_type.label',
                'contenttypes.field.properties.value.label',
                'contenttypes.field.properties.data_type.values.binary',
                'contenttypes.field.properties.data_type.values.text',
                'contenttypes.field.properties.data_type.values.boolean',
                'contenttypes.field.properties.data_type.values.date',
                'contenttypes.field.properties.data_type.values.decimal',
                'contenttypes.field.properties.data_type.values.number',
                'contenttypes.field.properties.data_type.values.large_text',
                'contenttypes.field.properties.data_type.values.system',
                'contenttypes.field.properties.category.error.required',
                'contenttypes.field.properties.default_value..error.format',
                'contenttypes.field.properties.name.error.required',
                'contenttypes.field.properties.validation_regex.values.select',
                'contenttypes.field.properties.validation_regex.values.no_html',
                'contenttypes.field.properties.validation_regex.values.us_phone',
                'contenttypes.field.properties.validation_regex.values.us_zip_code',
                'contenttypes.field.properties.validation_regex.values.letters_only',
                'contenttypes.field.properties.validation_regex.values.numbers_only',
                'contenttypes.field.properties.validation_regex.values.email',
                'contenttypes.field.properties.validation_regex.values.alphanumeric',
                'contenttypes.field.properties.validation_regex.values.url_pattern'
            ])
            .pipe(take(1))
            .subscribe(res => {
                this.i18nMessages = res;
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * Emit the form data to be saved
     *
     * @memberof ContentTypeFieldsPropertiesFormComponent
     */
    saveFieldProperties(): void {
        if (this.form.valid) {
            this.saveField.emit(this.form.value);
        } else {
            this.fieldProperties.forEach(property => this.form.get(property).markAsTouched());
        }
        this.valid.next(false);
    }

    destroy(): void {
        this.fieldProperties = [];

        if (this.propertiesContainer) {
            const propertiesContainer = this.propertiesContainer.nativeElement;
            propertiesContainer.childNodes.forEach(child => {
                if (child.tagName) {
                    propertiesContainer.removeChild(child);
                }
            });
        }
    }

    private init(): void {
        this.updateFormFieldData();

        const properties: string[] = this.fieldPropertyService.getProperties(
            this.formFieldData.clazz
        );

        this.initFormGroup(properties);
        this.sortProperties(properties);
    }

    private initFormGroup(properties?: string[]): void {
        const formFields = {};

        if (properties) {
            properties
                .filter(property => this.fieldPropertyService.existsComponent(property))
                .forEach(property => {
                    formFields[property] = [
                        {
                            value:
                                this.formFieldData[property] ||
                                this.fieldPropertyService.getDefaultValue(
                                    property,
                                    this.formFieldData.clazz
                                ),
                            disabled: this.formFieldData.id && this.isPropertyDisabled(property)
                        },
                        this.fieldPropertyService.getValidations(property)
                    ];
                });

            formFields['clazz'] = this.formFieldData.clazz;
        }

        this.form = this.fb.group(formFields);
        this.setAutoCheckValues();
        this.notifyFormChanges();
    }

    private notifyFormChanges() {
        this.originalValue = this.form.value;
        this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.valid.next(this.isFormValueUpdated() &&  this.form.valid);
        });
    }

    private isFormValueUpdated(): boolean {
        return !_.isEqual(this.form.value, this.originalValue);
    }

    private isPropertyDisabled(property: string): boolean {
        return (
            this.fieldPropertyService.isDisabledInEditMode(property) ||
            (this.formFieldData.fixed && this.fieldPropertyService.isDisabledInFixed(property))
        );
    }

    private sortProperties(properties: string[]): void {
        this.fieldProperties = properties
            .filter(property => this.fieldPropertyService.existsComponent(property))
            .sort(
                (property1, proeprty2) =>
                    this.fieldPropertyService.getOrder(property1) -
                    this.fieldPropertyService.getOrder(proeprty2)
            );
    }

    private setAutoCheckValues(): void {
        [this.form.get('searchable'), this.form.get('listed'), this.form.get('unique')]
            .filter(checkbox => !!checkbox)
            .forEach(checkbox => {
                this.handleCheckValues(checkbox);
            });
    }

    private handleCheckValues(checkbox: AbstractControl): void {
        if (checkbox.value) {
            if (checkbox === this.form.get('unique')) {
                this.handleDisabledRequired(true);
            }
            this.handleDisabledIndexed(true);
        }

        checkbox.valueChanges.subscribe(res => {
            checkbox === this.form.get('unique')
                ? this.handleUniqueValuesChecked(res)
                : this.setIndexedValueChecked(res);
        });
    }

    private setIndexedValueChecked(propertyValue: boolean): void {
        if (this.form.get('indexed') && propertyValue) {
            this.form.get('indexed').setValue(propertyValue);
        }

        this.handleDisabledIndexed(propertyValue);
    }

    private handleUniqueValuesChecked(propertyValue: boolean): void {
        this.setIndexedValueChecked(propertyValue);

        if (this.form.get('required') && propertyValue) {
            this.form.get('required').setValue(propertyValue);
        }

        this.handleDisabledRequired(propertyValue);
        this.handleDisabledIndexed(true);
    }

    private handleDisabledIndexed(disable: boolean): void {
        if (this.form.get('indexed')) {
            disable ? this.form.get('indexed').disable() : this.form.get('indexed').enable();
        }
    }

    private handleDisabledRequired(disable: boolean): void {
        if (this.form.get('required')) {
            disable ? this.form.get('required').disable() : this.form.get('required').enable();
        }
    }

    private updateFormFieldData() {
        if (!this.formFieldData.id) {
            delete this.formFieldData['name'];
        }
    }
}
