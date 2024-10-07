import SingleFan from "./SingleFan.ts";

export default class {
    fans: SingleFan[];//番集合
    totalFans: number;//所有番

    constructor(fans: SingleFan[], totalFans: number) {
        this.fans = fans;
        this.totalFans = totalFans;
    }
}