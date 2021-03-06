import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DotFieldHelperComponent } from '@components/dot-field-helper/dot-field-helper.component';
import { DotIconButtonModule } from '@components/_common/dot-icon-button/dot-icon-button.module';
import { OverlayPanelModule } from 'primeng/primeng';

@NgModule({
    imports: [CommonModule, DotIconButtonModule, OverlayPanelModule],
    declarations: [DotFieldHelperComponent],
    exports: [DotFieldHelperComponent]
})
export class DotFieldHelperModule {}
