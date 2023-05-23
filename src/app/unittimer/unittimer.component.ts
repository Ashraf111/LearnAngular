import { Component, OnInit, Output, EventEmitter, ElementRef, Input } from '@angular/core';
import { Timer } from './models/timer';
import { Timespent } from 'app/models/timespent.model';

@Component({
  selector: 'hx-unittimer',
  templateUrl: './unittimer.component.html',
  styleUrls: ['./unittimer.component.scss']
})
export class UnittimerComponent implements OnInit {
  showBillable = false;
  isBillable = true;
  isBilled = false;
  isDisabled = false;
  private _timer: Timer;
  counter: number = 0;
  public get timer(): Timer {
    return this._timer;
  }
  @Input() public set timer(v: Timer) {
    this._timer = v;
    if (this._timer) {
      this.setInitialTimer(this._timer);
    }
  }

  interval: number = 1000;
  @Output() notifyUnit = new EventEmitter<any>()
  defaultHourJump: number = 1;
  defaultMinuteJump: number = 5;
  defaultSecondJump: number = 15;
  defaultUnitJump: number = 1;
  defaultChargeJump: number = 1;
  timeoutId: any = null;
  isRunning: boolean = true;
  autoStart: boolean = true;
  editMode: boolean = false;
  editCharge: boolean = false
  editUnit: boolean = false
  isChange: boolean = false
  seconds: string = '00';
  minutes: string = '00';
  hours: string = '00';
  minutePerUnit: number = 6;
  totalUnitCount: number = 0;
  rateHourly: any = 0;
  params: any;
  ratePerUnit: any = 0;
  updateUnit: boolean = false;
  displayRate: string;
  rate: number = 0;
  totalUnit: any = 0;
  keyUp: number = 38;
  keyDown: number = 40;
  subscription: any;
  userUnitChanged: boolean = false;
  @Input() isToggleUnitItem: number = 6;

  constructor(
  ) { }

  ngOnInit() {


  }

  ngOnDestroy() {
    clearInterval(this.timeoutId);
  }

  setInitialTimer(timer: Timer) {
    this.rateHourly = timer.hourlyRate;
    this.params = timer.currencySymbol;
    this.isBillable = timer.isBillable;
    this.isBilled = timer.isBilled;
    this.isDisabled = timer.isDisabled;
    this.showBillable = timer.showBillable;
    this.ratePerUnit = 0;
    if (this.rateHourly > 0) {
      this.ratePerUnit = (this.rateHourly / 60) * this.minutePerUnit;
    }
    if (timer.isDefault) {
      this.displayRate = Number(timer.charge).toFixed(2);
      this.totalUnitCount = timer.unit;
      const ts: any = Timespent.String2Obj(timer.timeSpent);
      this.hours = Timespent.formatZero(parseInt(ts.hours)),
        this.minutes = Timespent.formatZero(parseInt(ts.minutes)),
        this.seconds = Timespent.formatZero(parseInt(ts.seconds));
    }
    else {
      this.reset();
      this.totalUnitCount = timer.unit;
      this.isChange = true;
      this.calculateWorkTime();
    }

    if (timer.start) {
      this.resume();
    }
    else {
      this.stop();
    }
  }

  emptyTimer() {
    this.seconds = '00';
    this.minutes = '00';
    this.hours = '00';
    this.totalUnitCount = 0;
    this.onUnitChange();
  };
  getFormattedTimeStamp(timestamp) {
    return timestamp < 10 ? ('0' + timestamp) : timestamp;
  };

  tick() {


    let mcountercal = 0;
    let currentSeconds = parseInt(this.seconds);
    let currentMinutes = parseInt(this.minutes);
    let currentHours = parseInt(this.hours);
    this.counter = currentHours * 3600000 + currentMinutes * 60000 + currentSeconds * 1000
    const startTime = Date.now() - (this.counter || 0);
    this.timeoutId = setInterval(() => {
      this.counter = Date.now() - startTime;
      currentHours = Math.floor(this.counter / 3600000);
      currentMinutes = Math.floor(this.counter / 60000) - currentHours * 60;
      mcountercal = Math.floor(this.counter / 60000);
      currentSeconds = Math.floor(this.counter / 1000) - mcountercal * 60;
      this.hours = currentHours.toString();
      this.minutes = currentMinutes.toString();
      this.seconds = currentSeconds.toString();
      this.calculateUnit();
      this.notifyUnit.emit({ unit: this.totalUnitCount, rate: this.rate, time: this.hours + ':' + this.minutes + ':' + this.seconds, isBillable: this.isBillable })
    });




    // if (currentSeconds < 60) {

    //   currentSeconds++;
    //   this.seconds = this.getFormattedTimeStamp(currentSeconds);


    //   if (this.updateUnit) {
    //     this.calculateUnit();
    //     this.updateUnit = false;
    //   }
    // }
    // if (currentSeconds >= 60) {

    //   //let currentMinutes = parseInt(this.minutes);
    //   currentMinutes++;
    //   this.minutes = this.getFormattedTimeStamp(currentMinutes);
    //   this.seconds = '00';

    //   if (currentMinutes >= 60) {
    //     //let currentHours = parseInt(this.hours);
    //     currentHours++;
    //     this.hours = this.getFormattedTimeStamp(currentHours);
    //     this.minutes = '00';
    //     this.updateUnit = true;

    //   }

    //   else if ((currentMinutes >= this.minutePerUnit) && (currentMinutes % this.minutePerUnit) == 0) {
    //     this.updateUnit = true;

    //   }

    // }
    // if (parseInt(this.hours) == 99 && parseInt(this.minutes) == 59 && parseInt(this.seconds) == 59) {
    //   this.stop();
    // }
    // else {
    //   this.timeoutId = setTimeout(() => {
    //     this.tick();
    //   }, this.interval);
    // }
    // this.notifyUnit.emit({ unit: this.totalUnitCount, rate: this.rate, time: this.hours + ':' + this.minutes + ':' + this.seconds, isBillable: this.isBillable })

  };
  editTick() {

    let currentSeconds = parseInt(this.seconds);

    if (currentSeconds < 60) {
      this.seconds = this.getFormattedTimeStamp(currentSeconds);
    }
    let currentMinutes = parseInt(this.minutes);
    if (currentMinutes < 60) {
      this.minutes = this.getFormattedTimeStamp(currentMinutes);
      this.updateUnit = true;
    }
    let currentHours = parseInt(this.hours);
    if (currentHours < 60) {
      this.hours = this.getFormattedTimeStamp(currentHours);
    };

  };

  start() {
    this.isRunning = true;
    this.emptyTimer();
    this.resetTimeout();
    this.tick();

  };

  resume() {
    if (parseInt(this.hours) == 99 && parseInt(this.minutes) == 59 && parseInt(this.seconds) == 59) {
      this.stop();
      return
    }
    this.isRunning = true;
    this.resetTimeout();
    this.editDone();
    this.normalizeBlankAndNegetiveInput();
    this.editTick()
    this.tick();
  };

  stop() {
    this.isRunning = false;
    this.resetTimeout();
    this.timeoutId = null;
  };
  resetTimeout() {

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  };

  reset() {
    this.editCharge = false;
    this.isRunning = false;
    this.emptyTimer();
    this.resetTimeout();
    this.timeoutId = null
  };
  enableEditMode(event) {
    this.editMode = true;
    this.editUnit = false
    this.isChange = true
    this.editCharge = false
    if (event.type == "click") {
      event.target.select();
    }

    this.stop();

  }
  clickOnSelect(event) {
    event.target.select();
    this.normalizeBlankAndNegetiveInput();
  }
  editDone() {

    this.updateUnit = true;
    this.editMode = false;
    this.editCharge = false
    this.editUnit = false
  };
  normalizeBlankAndNegetiveInput() {
    let currentSeconds = parseInt(this.seconds);
    if (isNaN(currentSeconds) || currentSeconds <= 0)
      this.seconds = '00';

    let currentMinutes = parseInt(this.minutes);
    if (isNaN(currentMinutes) || currentMinutes <= 0)
      this.minutes = '00';

    let currentHours = parseInt(this.hours);
    if (isNaN(currentHours) || currentHours <= 0)
      this.hours = '00';
  }
  handleKeyPress(event, sender) {
    switch (sender) {
      case 'hours':
        let currentHours = parseInt(this.hours);
        if (isNaN(currentHours) || currentHours < 0) {
          this.hours = "";
          return
        }

        if (event.which === this.keyUp) {
          currentHours += this.defaultHourJump;
        }
        else if (event.which === this.keyDown) {
          currentHours -= this.defaultHourJump;
          if (currentHours < 0) currentHours = 0;
        }
        if (currentHours >= 99) {
          this.hours = "99";
          return
        }

        this.hours = currentHours.toString();


        break;
      case 'minutes':
        let currentMinutes = parseInt(this.minutes);
        if (isNaN(currentMinutes) || currentMinutes < 0) {
          this.minutes = "";
          return;
        }
        if (event.which === this.keyUp) {
          currentMinutes += this.defaultMinuteJump;
        }
        else if (event.which === this.keyDown) {
          currentMinutes -= this.defaultMinuteJump;
          if (currentMinutes < 0) currentMinutes = 0;
        }
        if (currentMinutes >= 60) {
          this.minutes = "59"
          return
        };

        this.minutes = currentMinutes.toString();
        break;
      case 'seconds':
        let currentSeconds = parseInt(this.seconds);
        if (isNaN(currentSeconds) || currentSeconds < 0) {
          this.seconds = "";
          return;
        }

        if (event.which === this.keyUp) {
          currentSeconds += this.defaultSecondJump;
        }
        else if (event.which === this.keyDown) {
          currentSeconds -= this.defaultSecondJump;
          if (currentSeconds < 0) currentSeconds = 0;
        }
        if (currentSeconds >= 60) {
          this.seconds = "59";
          return;
        }

        this.seconds = currentSeconds.toString();
        break;

      case 'unitarea':
        let currentUnitArea = this.totalUnitCount;
        if (event.which === this.keyUp) {
          currentUnitArea += this.defaultUnitJump;
        }
        else if (event.which === this.keyDown) {
          currentUnitArea -= this.defaultUnitJump;
          if (currentUnitArea < 0) currentUnitArea = 0;
        }
        if (currentUnitArea > 999) {
          currentUnitArea = 999;
        }
        this.totalUnitCount = currentUnitArea;
      // case 'amountarea':
      //   let currentAmountArea = parseInt(this.displayRate.split(this.params)[1]);

      //   if (isNaN(currentAmountArea) || currentAmountArea < 0)
      //     currentAmountArea = 0;

      //   if (event.which === this.keyUp) {
      //     currentAmountArea += this.defaultChargeJump;
      //   }
      //   else if (event.which === this.keyDown) {
      //     currentAmountArea -= this.defaultChargeJump;
      //     if (currentAmountArea < 0) currentAmountArea = 0;
      //   }
      //   if (this.params != undefined) {
      //     if (currentAmountArea.toString().length > 4) {
      //       this.displayRate = this.params + "" + currentAmountArea.toFixed(2);
      //     }
      //     else {
      //       this.displayRate = this.params + "" + currentAmountArea;
      //     }

      //   }



      default:
        break;
    }

  };

  calculateUnit() {
    this.isChange = false;
    let minutes = 0;
    this.editTick();
    let totalUnitCount = this.totalUnitCount.toString()
    totalUnitCount = totalUnitCount.slice(-1)
    if (totalUnitCount == "0" && (this.editCharge == true || this.editUnit == true)) {
      minutes = parseInt(this.minutes) - this.minutePerUnit * 2
    }

    else {
      minutes = parseInt(this.minutes)
    }
    let currentHours = parseInt(this.hours);
    let totalMinutesWorked = (currentHours > 0 ? currentHours * 60 : 0) + minutes;
    if (totalMinutesWorked >= this.minutePerUnit) {
      let totalUnit = totalMinutesWorked / this.minutePerUnit;
      totalUnit = totalUnit - Math.floor(totalUnit)
      if (this.seconds == "00" && this.editMode == true && totalUnit == 0) {
        this.totalUnitCount = Math.floor(totalMinutesWorked / this.minutePerUnit);
      }
      else {
        this.totalUnitCount = Math.floor(totalMinutesWorked / this.minutePerUnit) + 1;
      }

    }

    else this.totalUnitCount = parseInt(this.hours) + parseInt(this.seconds) + parseInt(this.minutes) == 0 ? 0 : 1;
    this.onUnitChange();
  };

  calculateWorkTime() {
    this.editCharge = false
    this.editUnit = true;
    let totalUnitCounted = parseFloat(this.totalUnitCount + "");

    if (isNaN(totalUnitCounted) || totalUnitCounted < 1) {
      this.emptyTimer();
      this.totalUnitCount = 0;
    }
    else {
      let maxUnit = parseInt(5999.59 / this.minutePerUnit + "");
      if (totalUnitCounted >= maxUnit) {
        totalUnitCounted = Math.floor(5999.59 / this.minutePerUnit);
        this.totalUnitCount = totalUnitCounted;
        this.hours = "99";
        this.minutes = "59";
        this.seconds = "59";
        this.onUnitChange();
        return;
      }
      else {
        this.totalUnitCount = totalUnitCounted;
      }

      if (this.isChange == false) {
        return false;
      }
      else if (this.isChange == true || this.isRunning == true) {


        let calculatedTotalMinuteWorked = (totalUnitCounted * this.minutePerUnit);
        if (calculatedTotalMinuteWorked > 0) {
          let calculatedHours = Math.floor(calculatedTotalMinuteWorked / 60);
          this.hours = this.getFormattedTimeStamp(calculatedHours);
          let calculatedMinutes = Math.abs(calculatedTotalMinuteWorked - (calculatedHours * 60));

          let currentSeconds = 0
          //calculatedMinutes = 0
          this.minutes = this.getFormattedTimeStamp(calculatedMinutes)
          this.seconds = this.getFormattedTimeStamp(currentSeconds)
          this.updateUnit = true;
          this.isChange = false;
        }
      }

    }
    this.onUnitChange();
    this.stop();
  };
  calculateChargeUnit() {
    this.editCharge = true
    this.editUnit = false
    let chargeAmount = 0;
    let totalUnitCounted = 1;
    if (this.displayRate.indexOf(this.params) > -1) {
      chargeAmount = parseFloat(this.displayRate.split(this.params)[1]);
    } else {
      chargeAmount = parseFloat(this.displayRate);
    }

    let ratePerUnit = parseFloat(this.ratePerUnit);

    if (chargeAmount < ratePerUnit) {
      totalUnitCounted = Math.ceil(chargeAmount / ratePerUnit);
      this.totalUnit = chargeAmount / ratePerUnit;
    }
    else if (chargeAmount > 0 && ratePerUnit > 0) {
      totalUnitCounted = Math.ceil(chargeAmount / ratePerUnit);
      this.totalUnit = chargeAmount / ratePerUnit;
    }

    if (isNaN(totalUnitCounted) || totalUnitCounted <= 1) {
      this.emptyTimer();
      this.totalUnitCount = 1;
      //this.totalUnit = 1
    }
    else {

      if (totalUnitCounted > 5999.59 / this.minutePerUnit) {
        if (totalUnitCounted > 5999.59 / this.minutePerUnit) {
          totalUnitCounted = Math.floor(5999.59 / this.minutePerUnit);
          this.totalUnitCount = totalUnitCounted;
          this.totalUnit = totalUnitCounted;
          this.hours = "99";
          this.minutes = "59";
          this.seconds = "59";
          this.onUnitChange();
          return;
        }
      }

      else {
        this.totalUnitCount = totalUnitCounted;
      }

      if (this.isChange == false) {
        return false;
      }
      else if (this.isChange == true || this.isRunning == true) {
        var calculatedTotalMinuteWorked = (totalUnitCounted * this.minutePerUnit);

        if (calculatedTotalMinuteWorked > 0) {
          let calculatedHours = Math.floor(calculatedTotalMinuteWorked / 60);
          this.hours = this.getFormattedTimeStamp(calculatedHours);
          let calculatedMinutes = Math.abs(calculatedTotalMinuteWorked - (calculatedHours * 60));
          var currentSeconds = 0;
          //calculatedMinutes = 0
          this.minutes = this.getFormattedTimeStamp(calculatedMinutes)
          this.seconds = this.getFormattedTimeStamp(currentSeconds)

          //this.seconds = '01';
          this.updateUnit = true;
          this.isChange = false;

        }
      }
    }


    this.onUnitChange();
    this.stop();
  };
  onUnitChange() {
    if (this.editCharge == true) {

      this.rate = (this.totalUnit * this.ratePerUnit);
    }
    else {

      this.rate = (this.totalUnitCount * this.ratePerUnit);
    }

    if (this.params != undefined) {
      this.displayRate = this.params + "" + this.rate.toFixed(2);

    }
    this.notifyUnit.emit({ unit: this.totalUnitCount, rate: this.rate, time: this.hours + ':' + this.minutes + ':' + this.seconds, isBillable: this.isBillable })
  }


  onBillable() {
    if (this.isBilled) {
      return;
    }
    this.isBillable = !this.isBillable;
    this.notifyUnit.emit({ unit: this.totalUnitCount, rate: this.rate, time: this.hours + ':' + this.minutes + ':' + this.seconds, isBillable: this.isBillable })
  }


};