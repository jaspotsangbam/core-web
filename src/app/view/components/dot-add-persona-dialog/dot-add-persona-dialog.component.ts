import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DotMessageService } from '@services/dot-messages-service';
import { take } from 'rxjs/operators';
import { DotDialogActions } from '@components/dot-dialog/dot-dialog.component';
import { DotCreatePersonaFormComponent } from '@components/dot-add-persona-dialog/dot-create-persona-form/dot-create-persona-form.component';
import { DotPersona } from '@models/dot-persona/dot-persona.model';
import { DotWorkflowActionsFireService } from '@services/dot-workflow-actions-fire/dot-workflow-actions-fire.service';
import { ResponseView } from 'dotcms-js/lib/core/util/response-view';
import { DotHttpErrorManagerService } from '@services/dot-http-error-manager/dot-http-error-manager.service';

const PERSONA_CONTENT_TYPE = 'persona';

@Component({
    selector: 'dot-add-persona-dialog',
    templateUrl: './dot-add-persona-dialog.component.html',
    styleUrls: ['./dot-add-persona-dialog.component.scss']
})
export class DotAddPersonaDialogComponent implements OnInit {
    @Input() visible = false;
    @Input() personaName: string;
    @Output() createdPersona: EventEmitter<DotPersona> = new EventEmitter();
    @ViewChild('personaForm') personaForm: DotCreatePersonaFormComponent;

    messagesKey: { [key: string]: string } = {};
    dialogActions: DotDialogActions;

    constructor(
        public dotMessageService: DotMessageService,
        public dotWorkflowActionsFireService: DotWorkflowActionsFireService,
        private dotHttpErrorManagerService: DotHttpErrorManagerService
    ) {}

    ngOnInit() {
        this.dotMessageService
            .getMessages([
                'modes.persona.add.persona',
                'dot.common.dialog.accept',
                'dot.common.dialog.reject'
            ])
            .pipe(take(1))
            .subscribe((messages: { [key: string]: string }) => {
                this.messagesKey = messages;
                this.setDialogActions();
            });
    }

    /**
     * Call endpoint to save the persona and emit the value.
     *
     * @memberof DotAddPersonaDialogComponent
     */
    savePersona(): void {
        if (this.personaForm.form.valid) {
            this.dotWorkflowActionsFireService
                .newContentlet<DotPersona>(PERSONA_CONTENT_TYPE, this.personaForm.form.getRawValue())
                .subscribe(
                    (persona: DotPersona) => {
                        this.createdPersona.emit(persona);
                        this.closeDialog();
                    },
                    (error: ResponseView) => {
                        this.dotHttpErrorManagerService
                            .handle(error)
                            .pipe(take(1))
                            .subscribe();
                    }
                );
        }
    }

    /**
     * Handle if the form is valid or not to set the disable state of the accept button
     *
     * @param {FormGroup} form
     *
     * @memberof DotAddPersonaDialogComponent
     */
    handlerFormValidState(valid: boolean): void {
        this.dialogActions.accept.disabled = !valid;
    }

    /**
     * Close the dialog and clear the form
     *
     * @memberof DotAddPersonaDialogComponent
     */
    closeDialog(): void {
        this.visible = false;
        this.personaForm.resetForm();
        this.dialogActions.accept.disabled = true;
    }

    private setDialogActions(): void {
        this.dialogActions = {
            accept: {
                action: () => {
                    this.savePersona();
                },
                label: this.messagesKey['dot.common.dialog.accept'],
                disabled: true
            },
            cancel: {
                label: this.messagesKey['dot.common.dialog.reject'],
                action: () => {
                    this.closeDialog();
                }
            }
        };
    }
}