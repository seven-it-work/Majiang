import {FanType} from "../enumType/FanType.ts";

export default class {
    fanType: FanType; //番类型
    fanCount: number;//几番

    constructor(fanType: FanType, fanCount: number) {
        this.fanType = fanType;
        this.fanCount = fanCount;
    }
}