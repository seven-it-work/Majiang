import {Player} from "../objs/Player.ts";
import {PaiType} from "../tingPai/PaiType.ts";

import lodash from 'lodash';
import {getCardListByType, getCardType, getCardTypeStr} from "../util/CardUtils.ts";

export class Rookie extends Player {
    isAi = true;


    /**
     * 杠牌策略
     * 能杠就杠
     */
    // @ts-ignore
    gangAction(card: number): boolean {
        return true;
    }

    /**
     * 胡牌策略
     * 能胡就胡
     */
    // @ts-ignore
    hupaiAction(card: number): boolean {
        return true;
    }

    /**
     * 碰牌策略
     * 能碰就碰
     */
    // @ts-ignore
    pengAction(card: number): boolean {
        return true;
    }


    /**
     * 出牌策略
     */
    playCardAction(): number {
        super.initDrawShouPai()
        // 系统已经给你发完牌了
        if (this.notNeedType === undefined) {
            throw new Error("初始化错误，请检查")
        }
        // 先打出缺的牌
        if (this.currentCard && getCardType(this.currentCard) === this.notNeedType) {
            return this.removeInShouPai(this.currentCard);
        }
        const cardListByType = getCardListByType(this.shoupai, this.notNeedType);
        if (cardListByType.length > 0) {
            // 随机选中一个出牌
            const card = lodash.sample(cardListByType);
            if (card) {
                // 从手牌中移除
                return this.removeInShouPai(card);
            }
        }
        // 暴力遍历，一个个移除，如果有听牌的（数量最多的）则进行听牌
        const tingPaiCount = []
        for (let i = 0; i < this.drawShoupai.length; i++) {
            const newList = [...lodash.slice(this.drawShoupai, 0, i), ...lodash.slice(this.drawShoupai, i + 1, this.drawShoupai.length)]
            const tingPais = this.tingpai.tingPais(newList).getTingPais();
            tingPaiCount.push(tingPais.length);
        }
        if (tingPaiCount.filter(item => item > 0).length > 0) {
            // 存在胡牌，获取最多的来听牌
            let maxIndex = 0;
            let maxCount = 0;
            for (let i = 0; i < tingPaiCount.length; i++) {
                if (tingPaiCount[i] > maxCount) {
                    maxCount = tingPaiCount[i];
                    maxIndex = i;
                }
            }
            return this.removeInShouPai(this.drawShoupai[maxIndex]);
        }
        // 没有胡牌的数据
        // 打出非对子，或者在牌距离大于2的牌
        const countMap = new Map<number, number>()
        this.drawShoupai.forEach(value => {
            countMap.set(value, (countMap.get(value) || 0) + 1)
        })
        const more2Data: number[] = [];
        countMap.forEach((value, key) => {
            if (value < 2) {
                // 查询有没有+2的数据
                if (!countMap.has(key + 2)) {
                    more2Data.push(key)
                }
            }
        })
        if (more2Data.length > 2) {
            // 随机选中一个出牌
            let card = lodash.sample(more2Data);
            if (card) {
                // 从手牌中移除
                return this.removeInShouPai(card)
            }
        }
        // 都没有随机打一张单张
        let card = lodash.sample(Array.from(countMap.entries()).filter(o => o[1] <= 1).map(o => o[0]))
        if (card) {
            // 从手牌中移除
            return  this.removeInShouPai(card);
        }
        // 没有单张，随机打一张
        card = lodash.sample(this.drawShoupai)
        if (card) {
            // 从手牌中移除
            return this.removeInShouPai(card)
        }
        throw new Error("执行错误了")
    }

    /**
     * 定缺策略
     */
    judgeNotNeedCardAction() {
        const countObj = [
            {type: PaiType.TONG, count: getCardListByType(this.shoupai, PaiType.TONG).length,},
            {type: PaiType.TIAO, count: getCardListByType(this.shoupai, PaiType.TIAO).length,},
            {type: PaiType.WAN, count: getCardListByType(this.shoupai, PaiType.WAN).length,},
        ]
        const sortBy = lodash.sortBy(countObj, o => o.count);
        if (sortBy[0].count === sortBy[1].count) {
            // 随便选择一个
            this.notNeedType = lodash.sample([sortBy[0].type, sortBy[1].type])
            console.log(`${this.name}缺${getCardTypeStr(this.notNeedType)}，当前手牌${this.getShouPaiStr()}`)
        } else if (sortBy[0].count < sortBy[1].count) {
            this.notNeedType = sortBy[0].type
            console.log(`${this.name}缺${getCardTypeStr(this.notNeedType)}，当前手牌${this.getShouPaiStr()}`)
        } else {
            throw new Error("未知")
        }
    }
}