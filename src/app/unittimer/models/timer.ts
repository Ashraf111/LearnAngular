export interface Timer{
    unit?:any;
    charge?:any;
    timeSpent?:any;
    currencySymbol?:any
    hourlyRate?:any
    start?:boolean
    isDefault?:boolean;
    isBillable?:boolean;
    showBillable?:boolean
    isBilled?:boolean
    isDisabled?:boolean
}