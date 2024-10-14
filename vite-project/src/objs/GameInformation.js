import { allDistintPai } from "../tingPai/Tingpai.ts";
import lodash from 'lodash';
/**
 * 对局信息
 */
export class GameInformation {
    constructor() {
        this.allPai = [];
        this.currentIndex = 0;
        // 初始化牌
        const allPai = [];
        for (let i = 0; i < 4; i++) {
            allPai.push(...allDistintPai);
        }
        this.allPai = lodash.shuffle(allPai);
    }
    /**
     * 拿牌，一般是拿四张
     */
    takeCards() {
        const result = [];
        for (let i = 0; i < 4; i++) {
            result.push(this.takeOneCard());
        }
        return result;
    }
    /**
     * 拿牌（一张）
     */
    takeOneCard() {
        if (!this.isNoCard()) {
            const number = this.allPai[this.currentIndex];
            this.currentIndex++;
            return number;
        }
        throw new Error("没牌了，不能拿牌了");
    }
    /**
     * 判断是否没有牌了
     * @private
     */
    isNoCard() {
        return this.currentIndex >= this.allPai.length;
    }
    getNumberOfCardsRemaining() {
        console.log(this.currentIndex);
        return this.allPai.length - this.currentIndex;
    }
    initByJson(obj) {
        Object.assign(this, obj);
        return this;
    }
}
