import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { UnittimerComponent } from './unittimer.component';
import { FormsModule } from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';



@NgModule({
  imports: [
    NgbModule,
    CommonModule,
    FormsModule,
    MatTooltipModule
    
  ],
  declarations: [UnittimerComponent],
  exports:[UnittimerComponent],
 
})
export class UnitTimerModule {
   
 }