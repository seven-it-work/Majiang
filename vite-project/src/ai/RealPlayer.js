import { Player } from "../objs/Player.ts";
// 自定义函数，用于将 Modal.confirm 包装成一个返回 Promise 的函数
export class RealPlayer extends Player {
    constructor() {
        super(...arguments);
        this.isAi = false;
        this.cardsToBePlayed = -1;
    }
    /**
     * 杠牌策略
     */
    // @ts-ignore
    gangAction(card) {
        return true;
    }
    /**
     * 胡牌策略
     */
    // @ts-ignore
    hupaiAction(card) {
        return true;
    }
    /**
     * 碰牌策略
     */
    // @ts-ignore
    pengAction(card) {
        return true;
    }
}
