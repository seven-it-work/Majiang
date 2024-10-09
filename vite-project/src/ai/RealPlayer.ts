import {Player} from "../objs/Player.ts";

// 自定义函数，用于将 Modal.confirm 包装成一个返回 Promise 的函数
export class RealPlayer extends Player {
    isAi = false;
    cardsToBePlayed: number = -1;
}