import {Player} from "../objs/Player.ts";
import {PaiType} from "../tingPai/PaiType.ts";

import lodash from 'lodash';
import {getCardListByType, getCardType, getCardTypeStr} from "../util/CardUtils.ts";

export class Rookie extends Player {
    isAi = true;

    /**
     * 判断缺牌
     */
    async judgeTheLackOfCards() {
        const countObj = [
            {type: PaiType.TONG, count: getCardListByType(this.drawShoupai, PaiType.TONG).length,},
            {type: PaiType.TIAO, count: getCardListByType(this.drawShoupai, PaiType.TIAO).length,},
            {type: PaiType.WAN, count: getCardListByType(this.drawShoupai, PaiType.WAN).length,},
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


    async doAction() {
        await super.doAction()
        // 系统已经给你发完牌了
        if (this.notNeedType === undefined) {
            throw new Error("初始化错误，请检查")
        }
        // 先打出缺的牌
        if (this.currentCard && getCardType(this.currentCard) === this.notNeedType) {
            await this.discardOneCard(this.currentCard);
            this.currentCard = undefined;
            this.endRound()
            return;
        }
        const cardListByType = getCardListByType(this.shoupai, this.notNeedType);
        if (cardListByType.length > 0) {
            // 随机选中一个出牌
            const card = lodash.sample(cardListByType);
            if (card) {
                await this.discardOneCard(card);
                // 从手牌中移除
                this.removeInShouPai(card);
                // 结束回合
                this.endRound();
                return
            }
        }
        // 判断是否杠牌 todo
        // 先判断是否胡牌
        if (this.isTingCard() && this.currentCard) {
            if (this.tingCard.includes(this.currentCard)) {
                console.log(`${this.name}自摸了`)
                this.hupai = true;
                return;
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
            const card = this.removeInShouPai(this.drawShoupai[maxIndex]);
            await this.discardOneCard(card)
            // 初始化听牌
            this.tingCardInit()
            this.endRound()
            return;
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
                card = this.removeInShouPai(card);
                await  this.discardOneCard(card);
                // 结束回合
                this.endRound();
                return
            }
        }
        // 都没有随机打一张单张
        let card = lodash.sample(Array.from(countMap.entries()).filter(o => o[1] <= 1).map(o => o[0]))
        if (card) {
            // 从手牌中移除
            card = this.removeInShouPai(card);
            await this.discardOneCard(card);
            // 结束回合
            this.endRound();
            return
        }
        // 没有单张，随机打一张
        card = lodash.sample(this.drawShoupai)
        if (card) {
            // 从手牌中移除
            card = this.removeInShouPai(card);
            await this.discardOneCard(card);
            // 结束回合
            this.endRound();
            return
        }
        throw new Error("执行错误了")
    }
}