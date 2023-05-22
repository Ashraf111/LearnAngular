import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { GlobalEmitterService } from "app/services/global-emitter.service";
import { Router } from "@angular/router";
import { FixedProperties } from "app/models/fixed-properties";
import { GetRoles } from 'app/models/localstorage-item';

@Component({
  selector: "hx-timer",
  templateUrl: "./timer.component.html",
  styleUrls: ["./timer.component.scss"]
})
export class TimerComponent implements OnInit {
  _isRunningTimer: boolean = false;
  counter: number = 0;
  @Input() set isRunningTimer(value) {
    this._isRunningTimer = value;
    if (this._isRunningTimer) {
      this.reStart();
    } else {
      this.stop();
    }
  }
  get isRunningTimer() {
    return this._isRunningTimer;
  }

  _timer = {
    minutes: "00",
    hours: "00",
    seconds: "00"
  };
  @Input() set timer(value) {
    this._timer = value;
    this.minutes = this._timer.minutes;
    this.hours = this._timer.hours;
    this.seconds = this._timer.seconds;
  }
  get timer() {
    return this._timer;
  }

  private _isDisabled: boolean = false;
  public get isDisabled(): boolean {
    return this._isDisabled;
  }
  @Input() public set isDisabled(v: boolean) {
    this._isDisabled = v;
  }

  private _showRunTimer: boolean = true;
  public get showRunTimer(): boolean {
    return this._showRunTimer;
  }
  @Input() public set showRunTimer(v: boolean) {
    this._showRunTimer = v;
  }

  seconds: string = "00";
  minutes: string = "00";
  hours: string = "00";
  timeoutId: any = null;
  interval: number = 1000;
  isTimerActivated: boolean = false;
  isRunning: boolean = true;
  defaultHourJump: number = 1;
  defaultMinuteJump: number = 5;
  defaultSecondJump: number = 15;
  keyUp: number = 38;
  keyDown: number = 40;
  roles = [];
  viewTimerPermission = false;
  viewTimerUnitPermission = false;
  viewTimerDurationPermission = false;
  viewTimerChargePermission = false;
  @Output() notifyTimer = new EventEmitter<any>();
  @Output() notifyUnit = new EventEmitter<any>();
  constructor(
    private _globalEmitterService: GlobalEmitterService,
    private router: Router
  ) { }

  ngOnInit() {
    this.roles = GetRoles()
    for (let i = 0; i < this.roles.length; i++) {
      if (this.roles[i].description === FixedProperties.CAN_ACCESS_TIMER) {
        this.viewTimerPermission = true;
      }
      if (this.roles[i].description === FixedProperties.CAN_ACCESS_TIMER_UNIT) {
        this.viewTimerUnitPermission = true;
      }
      if (
        this.roles[i].description === FixedProperties.CAN_ACCESS_TIMER_DURATION
      ) {
        this.viewTimerDurationPermission = true;
      }
      if (
        this.roles[i].description === FixedProperties.CAN_ACCESS_TIMER_CHARGE
      ) {
        this.viewTimerChargePermission = true;
      }
    }

    this._globalEmitterService.emitCloseTimeEntry.subscribe(data => {
      this.isTimerActivated = false;
      this.emptyTimer();
      this.stop();
    });

  }

  ngOnDestroy() {
    clearInterval(this.timeoutId);
  }

  startTimer() {
    this.isTimerActivated = true;
    this.isRunning = true;
    this.start();
  }
  reStart() {
    this.isRunning = true;
    this.tick();
  }
  reset() {
    this.isRunning = false;
    this.emptyTimer();
    this.resetTimeout();
    this.timeoutId = null;
  }

  runningTimer(action) {
    this.notifyTimer.emit(action);
  }
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
      // this.hours = currentHours.toString();
      // this.minutes = currentMinutes.toString();
      // this.seconds = currentSeconds.toString();
      this.hours = this.getFormattedTimeStamp(currentHours.toString());
      this.minutes = this.getFormattedTimeStamp(currentMinutes.toString())
      this.seconds = this.getFormattedTimeStamp(currentSeconds.toString())
      this.notifyUnit.emit({
        hours: this.hours,
        minutes: this.minutes,
        seconds: this.seconds
      });
      //this.calculateUnit();
      //this.notifyUnit.emit({ unit: this.totalUnitCount, rate: this.rate, time: this.hours + ':' + this.minutes + ':' + this.seconds, isBillable: this.isBillable })
    });


    //let currentSeconds = parseInt(this.seconds);
    // if (currentSeconds < 60) {
    //   currentSeconds++;
    //   this.seconds = this.getFormattedTimeStamp(currentSeconds);
    // }
    // if (currentSeconds >= 60) {
    //   let currentMinutes = parseInt(this.minutes);
    //   currentMinutes++;
    //   this.minutes = this.getFormattedTimeStamp(currentMinutes);
    //   this.seconds = "00";
    //   if (currentMinutes >= 60) {
    //     let currentHours = parseInt(this.hours);
    //     currentHours++;
    //     this.hours = this.getFormattedTimeStamp(currentHours);
    //     this.minutes = "00";
    //   }
    // }

    // this.timeoutId = setTimeout(() => {
    //   this.tick();
    // }, this.interval);
  }

  start() {
    this.isRunning = true;
    this.emptyTimer();
    this.resetTimeout();
    this.tick();
  }

  stop() {
    this.isRunning = false;
    this.resetTimeout();
    this.timeoutId = null;
  }

  resetTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  getFormattedTimeStamp(timestamp) {
    return timestamp < 10 ? "0" + timestamp : timestamp;
  }

  emptyTimer() {
    this.seconds = "00";
    this.minutes = "00";
    this.hours = "00";
  }

  enableEditMode(event) {
    if (event.type == "click") {
      event.target.select();
    }
    this.stop();
  }
  normalizeBlankAndNegetiveInput() {
    let currentSeconds = parseInt(this.seconds);
    if (isNaN(currentSeconds) || currentSeconds <= 0) this.seconds = "00";

    let currentMinutes = parseInt(this.minutes);
    if (isNaN(currentMinutes) || currentMinutes <= 0) this.minutes = "00";

    let currentHours = parseInt(this.hours);
    if (isNaN(currentHours) || currentHours <= 0) this.hours = "00";
  }
  normalizeOnKeyBlankAndNegetiveInput() {
    let currentSeconds = parseInt(this.seconds);
    if (isNaN(currentSeconds) || currentSeconds < 0) this.seconds = "0";

    let currentMinutes = parseInt(this.minutes);
    if (isNaN(currentMinutes) || currentMinutes < 0) this.minutes = "0";

    let currentHours = parseInt(this.hours);
    if (isNaN(currentHours) || currentHours < 0) this.hours = "0";
  }
  calculateTimeSpent(event) {
    this.normalizeBlankAndNegetiveInput();
    switch (event) {
      case "hours":
        this.hours = this.getFormattedTimeStamp(parseInt(this.hours));
        break;
      case "minutes":
        this.minutes = this.getFormattedTimeStamp(parseInt(this.minutes));
        break;
      case "seconds":
        this.seconds = this.getFormattedTimeStamp(parseInt(this.seconds));
        break;
      default:
        break;
    }
    this.notifyUnit.emit({
      hours: this.getFormattedTimeStamp(parseInt(this.hours)),
      minutes: this.getFormattedTimeStamp(parseInt(this.minutes)),
      seconds: this.getFormattedTimeStamp(parseInt(this.seconds))
    });
    this.notifyTimer.emit("stop");
  }


  handleKeyPress(event, sender) {
    let currentHours = parseInt(this.hours);
    let currentMinutes = parseInt(this.minutes);
    switch (sender) {
      case "hours":
        if (isNaN(currentHours) || currentHours < 0) {
          this.hours = "";
          return;
        }

        if (event.which === this.keyUp) {
          currentHours += this.defaultHourJump;
        } else if (event.which === this.keyDown) {
          currentHours -= this.defaultHourJump;
          if (currentHours < 0) currentHours = 0;
        }
        //check max hours
        if (currentHours > FixedProperties.MaxTimerUnitCharge.timer.hours) {
          this.hours = "10";
          return;
        }
        if (this.checkNumberStartWithZero(this.hours)) {
          this.hours = '0' + currentHours.toString();
        }
        else {
          this.hours = currentHours.toString();
        }


        break;
      case "minutes":
        if (isNaN(currentMinutes) || currentMinutes < 0) {
          this.minutes = "";
          return;
        }
        if (event.which === this.keyUp) {
          currentMinutes += this.defaultMinuteJump;
        } else if (event.which === this.keyDown) {
          currentMinutes -= this.defaultMinuteJump;
          if (currentMinutes < 0) currentMinutes = 0;
        }
        //check max minutes
        if (currentHours == FixedProperties.MaxTimerUnitCharge.timer.hours
          && currentMinutes > FixedProperties.MaxTimerUnitCharge.timer.minutes) {
          this.minutes = "00";
          currentMinutes = 0;
        }
        if (currentMinutes >= 60) {
          this.minutes = "59";
          return;
        }
        if (this.checkNumberStartWithZero(this.minutes)) {
          this.minutes = '0' + currentMinutes.toString();
        }
        else {
          this.minutes = currentMinutes.toString();
        }

        break;
      case "seconds":
        let currentSeconds = parseInt(this.seconds);
        if (isNaN(currentSeconds) || currentSeconds < 0) {
          this.seconds = "";
          return;
        }

        if (event.which === this.keyUp) {
          currentSeconds += this.defaultSecondJump;
        } else if (event.which === this.keyDown) {
          currentSeconds -= this.defaultSecondJump;
          if (currentSeconds < 0) currentSeconds = 0;
        }
        //check max seconds
        if (currentHours == FixedProperties.MaxTimerUnitCharge.timer.hours
          && currentMinutes == FixedProperties.MaxTimerUnitCharge.timer.minutes
          && currentSeconds > FixedProperties.MaxTimerUnitCharge.timer.seconds) {
          this.seconds = "00";
          currentSeconds = 0;
        }
        if (currentSeconds >= 60) {
          this.seconds = "59";
          return;
        }

        if (this.checkNumberStartWithZero(this.seconds)) {
          this.seconds = '0' + currentSeconds.toString();
        }
        else {
          this.seconds = currentSeconds.toString();
        }

        break;
      default:
        break;
    }

  }

  checkNumberStartWithZero(value) {
    let regExp = /^0[0-9].*$/
    if (regExp.test(value)) {
      return true
    }
    else {
      return false;
    }
  }
}
