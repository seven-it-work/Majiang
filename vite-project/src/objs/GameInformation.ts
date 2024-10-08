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


    getCurrentPlayer(): Player {
        return this.playerList[this.currentPlayerIndex];
    }

    async discardCard(player: Player, card: number) {
        await Promise.all(this.playerList
            .filter(item => item.id !== player.id)
            .map(async (item) => {
                // 检测是否胡牌
                if (item.checkIsHuPai(card)) {
                    const b = await item.doHupai();
                    if (b) {
                        this.currentPlayerIndex = this.playerList.map(p => p.id).findIndex(id => id === this.id)
                        return
                    }
                }
                // 检测是否杠
                if (item.checkIsHuPai(card)) {
                    const b = await item.doGang(card);
                    if (b) {
                        // 改变索引
                        this.currentPlayerIndex = this.playerList.map(p => p.id).findIndex(id => id === item.id)
                        await this.doNext();
                        return
                    }
                }
                // 检测是否碰
                if (item.checkIsPeng(card)) {
                    const b = await item.doPeng(card)
                    if (b) {
                        // 出牌
                        this.currentPlayerIndex = this.playerList.map(p => p.id).findIndex(id => id === item.id)
                        await item.doAction();
                        return
                    }
                }
            }))
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
        await Promise.all(this.playerList.map(async (player: Player) => {
            if (player.isAi) {
                await player.judgeTheLackOfCards();
            } else {
                await player.judgeTheLackOfCards();
            }
            return Promise.resolve();
        }));
        console.log("定缺完成")
        // 第一个人开始出牌
        // await this.playerList[0].doAction();
        // this.currentPlayerIndex++;
    }


    async doNext() {
        const player = this.playerList[this.currentPlayerIndex];
        if (player.hupai) {
            this.currentPlayerIndex++;
            this.currentPlayerIndex = this.currentPlayerIndex % 4;
            return
        }
        player.drawCard(this.takeOneCard())
        await player.doAction();
        this.currentPlayerIndex++;
        this.currentPlayerIndex = this.currentPlayerIndex % 4;
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
     isNoCard(): boolean {
        return this.currentIndex >= this.allPai.length;
    }
}