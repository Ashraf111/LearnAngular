import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerComponent } from './timer.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [TimerComponent],
  imports: [
    NgbModule,
    CommonModule,
    FormsModule
  ],
  exports:[TimerComponent],
})
export class TimerModule { }
