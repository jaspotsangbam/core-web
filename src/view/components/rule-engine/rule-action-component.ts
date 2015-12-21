import {Component, Directive, View, Inject} from 'angular2/angular2';
import {Input, Output, EventEmitter} from 'angular2/angular2';
import {CORE_DIRECTIVES} from 'angular2/angular2';
import {Observable} from 'rxjs/Rx.KitchenSink'

import {ActionModel} from "../../../api/rule-engine/Action";
import {ActionTypeService} from "../../../api/rule-engine/ActionType";
import {ActionService} from "../../../api/rule-engine/Action";
import {Dropdown, InputOption} from "../semantic/modules/dropdown/dropdown";
import {I18nService} from "../../../api/system/locale/I18n";
import {RuleService} from "../../../api/rule-engine/Rule";
import {ServerSideTypeModel} from "../../../api/rule-engine/ServerSideFieldModel";
import {ServersideCondition} from "./condition-types/serverside-condition/serverside-condition";
import {CountryCondition} from "./condition-types/country/country-condition";
import {ConditionModel} from "../../../api/rule-engine/Condition";
import {ServerSideFieldModel} from "../../../api/rule-engine/ServerSideFieldModel";

@Component({
  selector: 'rule-action'})
@View({
  template: `<div *ngIf="typeDropdown != null" flex layout="row" layout-align="space-between-center" class="cw-rule-action cw-entry">
  <div flex="35" layout="row" layout-align="end-center" class="cw-row-start-area">
    <cw-input-dropdown
        class="cw-type-dropdown"
        [value]="action.type.key"
        placeholder="{{typeDropdown.placeholder}}"
        (change)="onTypeChange($event)">
         <cw-input-option
            *ngFor="#opt of typeDropdown.options"
            [value]="opt.value"
            [label]="opt.label | async"
            icon="{{opt.icon}}"></cw-input-option>
    </cw-input-dropdown>
  </div>
  <div flex layout-fill class="cw-condition-row-main">
  <cw-serverside-condition class="cw-condition-component"
                           [model]="action"
                           [paramDefs]="action.type?.parameters"

                           (change)="onActionChange($event)">
  </cw-serverside-condition>
  </div>
  <div flex="5" layout="row" layout-align="end-center" class="cw-btn-group">
    <div class="ui basic icon buttons">
      <button class="ui button" aria-label="Delete Action" (click)="removeAction()" [disabled]="!action.isPersisted()">
        <i class="trash icon"></i>
      </button>
    </div>
  </div>
</div>`, directives: [CORE_DIRECTIVES,
    ServersideCondition,
    CountryCondition,
    Dropdown,
    InputOption
  ]
})
export class RuleActionComponent {

  @Input()  action:ServerSideFieldModel
  @Input()  index:number
  @Output() change:EventEmitter<ServerSideFieldModel>
  @Output() remove:EventEmitter<ServerSideFieldModel>

  typeDropdown:any

  private _typeService:ActionTypeService
  private _actionService:ActionService;
  private _types:{[key:string]: any}


  constructor(actionService:ActionService, typeService:ActionTypeService, resources:I18nService) {
    this.change = new EventEmitter()
    this.remove = new EventEmitter()
    this._types = {}

    this._actionService = actionService;
    this._typeService = typeService

    this.action = new ConditionModel(null, new ServerSideTypeModel())
    this.index = 0

    typeService.list().subscribe((types:ServerSideTypeModel[])=> {
      this.typeDropdown = {
        value: "",
        placeholder:"Select an Action",
        options: []
      }
      types.forEach(type => {
        this._types[type.key] = type
        let opt = { value: type.key, label: resources.get(type.i18nKey + '.name')}
        this.typeDropdown.options.push(opt)
      })
    })
  }

  ngOnChanges(change){
    if (change.action){
      this.action = change.action.currentValue
      if (this.typeDropdown && this.action.type) {
        this.typeDropdown.value = this.action.type.key
      }
    }
  }

  onTypeChange(value) {
    this.action.type = this._types[value]
    this.change.emit(this.action)
  }

  onActionChange(event) {
    console.log("RuleActionComponent", "onActionChange")
    this.change.emit(this.action)
  }

  removeAction() {
    this.remove.emit(this.action)
  }
}
