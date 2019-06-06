export interface DotCMSContentTypeField {
    dataType?: string;
    defaultValue?: string;
    disabled?: boolean;
    fieldType?: string;
    hint?: string;
    name?: string;
    placeholder?: string;
    readOnly?: boolean;
    regexCheck?: string;
    validationMessage?: string;
    required?: boolean;
    requiredMessage?: string;
    values?: string;
    variable?: string;
}

export interface DotCMSDateField extends DotCMSContentTypeField {
    min?: string;
    max?: string;
    step?: string;
}

export interface DotCMSDateRangeField extends DotCMSDateField {
    displayFormat: string;
    presets?: [{label: string, days: number}];
    presetLabel?: string;
}

export interface DotCMSMultiSelectField extends DotCMSContentTypeField {
    size?: string;
}

export interface DotCMSKeyValueField extends DotCMSContentTypeField {
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    saveBtnLabel?: string;
}

export interface DotCMSTextFieldField extends DotCMSContentTypeField {
    type?: string;
}