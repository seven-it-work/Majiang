import {PaiType} from "../tingPai/PaiType.ts";
import {Allshoupai} from "../fan/entities/Allshoupai.ts";
import Gang from "../fan/entities/Gang.ts";
import {tiao, tong, wan} from "../tingPai/Tingpai.ts";
import {SichuanTingpai} from "../tingPai/SichuanTingpai.ts";

/**
 * 算番工具类
 * @author Henry Zhou
 */
export class FanTool {

    /**
     * 是否是大对子
     *
     * @param allshoupai 手牌
     * @returns {boolean}
     */
    public static isDaduizi(allshoupai: Allshoupai): boolean {
        allshoupai.findShoupaiExceptJiang();

        const shouPaiCopy = [...allshoupai.shoupai];
        const groups = shouPaiCopy.reduce((acc:any, val) => {
            acc[val] = (acc[val] || { count: 0, sum: 0 });
            acc[val].count++;
            acc[val].sum += val;
            return acc;
        }, {});

        let countJiang = 0;
        for (const key in groups) {
            const value = groups[key];
            if (value.count !== 3 && value.count !== 2) {
                return false;
            }
            if (value.count === 2) {
                countJiang++;
            }
        }
        return countJiang === 1;
    }

    /**
     * 是否是小七对
     *
     * @param allshoupai
     * @returns {boolean}
     */
    public static isXiaoQiDui(allshoupai: Allshoupai): boolean {
        if (allshoupai.shoupai.length !== 14 || allshoupai.gangs.length > 0 || allshoupai.pengs.length > 0) {
            return false;
        }
        const shouPaiCopy = [...allshoupai.shoupai];
        const groups = shouPaiCopy.reduce((acc:any, val) => {
            acc[val] = (acc[val] || { count: 0, sum: 0 });
            acc[val].count++;
            acc[val].sum += val;
            return acc;
        }, {});

        for (const key in groups) {
            const value = groups[key];
            if (value.count !== 2) {
                return false;
            }
        }
        return true;
    }

    /**
     * 找到手牌中有多少个杠
     *
     * @param allshoupai 手牌
     * @returns {Gang[]}
     */
    public static findGangs(allshoupai: Allshoupai): Gang[] {
        const gangs: Gang[] = [];
        const allpais = allshoupai.findAllPais();
        const distinctShoupai = [...new Set(allpais)];
        for (const singleDistinctPai of distinctShoupai) {
            const gangPre = allpais.filter(singlePai => singlePai === singleDistinctPai);
            if (gangPre.length === 4) {
                const gang = new Gang(gangPre);
                gangs.push(gang);
            }
        }
        return gangs;
    }

    /**
     * 是否是指定类型的一条龙
     *
     * @param shoupai 手牌
     * @param paiType 指定的类型
     * @returns {boolean}
     */
    public static yiTiaoLongSpecifiedType(shoupai: number[], paiType: PaiType): boolean {
        let specifiedType: number[] = [];
        switch (paiType) {
            case PaiType.TONG:
                specifiedType = tong;
                break;
            case PaiType.TIAO:
                specifiedType = tiao;
                break;
            case PaiType.WAN:
                specifiedType = wan;
                break;
        }
        return this.removePaisStillHu(shoupai, specifiedType);
    }

    /**
     * 是否是指定类型的夹心五
     *
     * @param shoupai 手牌
     * @param paiType 指定的类型
     * @returns {boolean}
     */
    public static jiaXinWu(shoupai: number[], paiType: PaiType): boolean {
        let specifiedType: number[] = [];
        switch (paiType) {
            case PaiType.TONG:
                specifiedType = [4, 5, 6];
                break;
            case PaiType.TIAO:
                specifiedType = [14, 15, 16];
                break;
            case PaiType.WAN:
                specifiedType = [24, 25, 26];
                break;
        }
        return this.removePaisStillHu(shoupai, specifiedType);
    }

    /**
     * 是否是卡二条
     *
     * @param shoupai 手牌
     * @returns {boolean}
     */
    public static kaErTiao(shoupai: number[]): boolean {
        const specifiedType = [11, 12, 13];
        return this.removePaisStillHu(shoupai, specifiedType);
    }

    /**
     * 移除了指定的牌是否仍然胡牌
     *
     * @param shoupai  手牌
     * @param toRemove 移除牌集合
     * @returns {boolean}
     */
    private static removePaisStillHu(shoupai: number[], toRemove: number[]): boolean {
        const sichuanTingpai = new SichuanTingpai();
        if (this.checkAllAvailble(shoupai, toRemove)) {
            const removedTongResult = this.removeSpecifiedPais(shoupai, toRemove);
            return sichuanTingpai.isHuPai(removedTongResult);
        }
        return false;
    }

    /**
     * 从手牌中移除指定的牌（如果出现多次只移除一次）
     *
     * @param shoupai  手牌
     * @param toRemove 需要移除的牌集合
     * @returns {number[]} 移除后的牌（新对象）
     */
    private static removeSpecifiedPais(shoupai: number[], toRemove: number[]): number[] {
        const result = [...shoupai];
        for (const singlePai of toRemove) {
            const indexOfSinglePai = result.indexOf(singlePai);
            if (indexOfSinglePai !== -1) {
                result.splice(indexOfSinglePai, 1);
            } else {
                throw new Error(`需要移除的牌 ${singlePai} 未找到`);
            }
        }
        return result;
    }

    /**
     * 检查特定牌集合中的所有元素是否在手牌中出现
     *
     * @param shoupai   手牌
     * @param toBeCheck 需要检查的牌
     * @returns {boolean} 是否出现
     */
    private static checkAllAvailble(shoupai: number[], toBeCheck: number[]): boolean {
        for (const singlePai of toBeCheck) {
            if (shoupai.indexOf(singlePai) < 0) {
                return false;
            }
        }
        return true;
    }
}