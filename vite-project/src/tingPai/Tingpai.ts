import {AllTingpai} from "./entities/AllTingpai.ts";
import {TingDetail} from "./entities/TingDetail.ts";

export const allDistintPai: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 23, 24, 25, 26, 27, 28, 29
];
export const tong: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9
];
export const tiao: number[] = [
    11, 12, 13, 14, 15, 16, 17, 18, 19
];
export const wan: number[] = [
    21, 22, 23, 24, 25, 26, 27, 28, 29
];

/**
 * 听牌抽象类
 * 筒：1-9
 * 条：11-19
 * 万：21-29
 */
export interface Tingpai {

    /**
     * 是否已经胡牌
     *
     * @param shoupai 手牌(已经把当前需要判断的牌插入进来)
     * @return 是否胡牌
     */
    isTingCurrentPai(shoupai: number[], currentPai: number): TingDetail[];

    /**
     * 听牌有哪些
     * @param shoupai 手牌
     * @return 听牌有哪些
     */
    tingPais(shoupai: number[]): AllTingpai;

    /**
     * 是否听牌
     * @param shoupai 手牌（未把待停牌插入，即参数为1,4,7,10,13张）
     * @return
     */
    isTingPai(shoupai: number[]): boolean;

    /**
     * 是否胡牌
     * @param shoupai 手牌（已经把待停牌插入，即参数为2,5,8,11,14张）
     * @return
     */
    isHuPai(shoupai: number[]): boolean;
}
