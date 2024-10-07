import {allDistintPai} from "../tingPai/Tingpai.ts";

import lodash from 'lodash';
import {Player} from "./Player.ts";


/**
 * 对局信息
 */
export class GameInformation {
    allPai: number[] = []
    currentIndex: number = 0;
    playerList: Player[] = [];
    // 当前进行的player
    currentPlayerIndex: number = 0;

    discardCard(player: Player, card: number) {
        this.playerList
            .filter(item => item.id !== player.id)
            .forEach(async (item) => {
                // 检测是否胡牌
                if (item.checkIsHuPai(card)) {
                    console.log(`${item.name}胡牌了`)
                    item.hupai = true;
                    this.currentPlayerIndex = this.playerList.map(p => p.id).findIndex(id => id === item.id)
                    return
                }
                // 检测是否杠
                if (item.checkIsHuPai(card)) {
                    console.log(`${item.name}杠牌`)
                    item.doGang(card);
                    // 改变索引
                    this.currentPlayerIndex = this.playerList.map(p => p.id).findIndex(id => id === item.id)
                    await this.doNext();
                    return
                }
                // 检测是否碰
                if (item.checkIsPeng(card)) {
                    console.log(`${item.name}碰牌`)
                    item.doPeng(card)
                    // 出牌
                    this.currentPlayerIndex = this.playerList.map(p => p.id).findIndex(id => id === item.id)
                    item.doAction();
                    return
                }
            })
    }

    constructor() {
        // 初始化牌
        const allPai: number[] = []
        for (let i = 0; i < 4; i++) {
            allPai.push(...allDistintPai)
        }
        this.allPai = lodash.shuffle(allPai)
    }

    /**
     * 数组顺序，为拿牌顺序，第一个为庄
     * @param playerList
     */
    async doStart(playerList: Player[]) {
        this.playerList = playerList;
        // 每次拿4张，一共拿3次
        for (let i = 0; i < 3; i++) {
            this.playerList.forEach(player => {
                player.gameInformation = this;
                const numbers = this.takeCards();
                player.shoupai.push(...numbers);
            })
        }
        // 再每人一张
        this.playerList.forEach(player => {
            player.drawCard(this.takeOneCard())
            player.endRound();
        })
        // 进行排序
        this.playerList.forEach(player => {
            player.shoupai = lodash.sortBy(player.shoupai)
        })
        // 执行出牌判断
        // 第一个人开始摸牌
        this.playerList[0].drawCard(this.takeOneCard());
        // 定缺
        this.playerList.forEach(player => {
            if (player.isAi) {
                player.judgeTheLackOfCards();
            }
        })
        // 第一个人开始出牌
        // 如果是ai，调用ai的出牌方法
        if (this.playerList[0].isAi) {
            this.playerList[0].doAction();
            this.currentPlayerIndex++;
        } else {
            // 玩家出牌
        }
    }

    async doNext() {
        const player = this.playerList[this.currentPlayerIndex];
        if (player.hupai) {
            this.currentPlayerIndex++;
            this.currentPlayerIndex = this.currentPlayerIndex % 4;
            return
        }
        player.drawCard(this.takeOneCard())
        if (player.isAi) {
            player.doAction();
            this.currentPlayerIndex++;
            this.currentPlayerIndex = this.currentPlayerIndex % 4;
        } else {
            // 玩家执行
        }
    }


    /**
     * 拿牌，一般是拿四张
     */
    takeCards(): number[] {
        const result: number[] = []
        for (let i = 0; i < 4; i++) {
            result.push(this.takeOneCard());
        }
        return result;
    }

    /**
     * 拿牌（一张）
     */
    takeOneCard(): number {
        if (!this.isNoCard()) {
            const number = this.allPai[this.currentIndex];
            this.currentIndex++;
            return number;
        }
        throw new Error("没牌了，不能拿牌了")
    }

    /**
     * 判断是否没有牌了
     * @private
     */
    private isNoCard(): boolean {
        return this.currentIndex >= this.allPai.length;
    }
}