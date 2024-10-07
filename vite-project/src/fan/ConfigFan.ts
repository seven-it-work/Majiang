import {FanType} from "./enumType/FanType.ts";

export default class {
    fanType: FanType;//番类型
    valid: boolean;//当前类型是否有效，比如一条龙，板板高，大多数地区不算番，即为false
    singleFan: number;//单个算成多少番，例如一般情况下 大对子 算一番，但是有些地区算两番，这个需要配置

    constructor(fanType: FanType, valid: boolean, singleFan: number) {
        this.fanType = fanType;
        this.valid = valid;
        this.singleFan = singleFan;
    }
}