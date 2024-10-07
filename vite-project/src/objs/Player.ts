import {Peng} from "../fan/entities/Peng.ts";
import {Gang} from "../fan/entities/Gang.ts";
import {PaiType} from "../tingPai/PaiType.ts";
import lodash from "lodash";
import {Tingpai} from "../tingPai/Tingpai.ts";
import {SichuanTingpai} from "../tingPai/SichuanTingpai.ts";
import {getCardListStr, getCardStr} from "../util/CardUtils.ts";
import {GameInformation} from "./GameInformation.ts";

export class Player {
    id: string = lodash.uniqueId();
    name: string;
    gameInformation?: GameInformation;

    constructor(name: string) {
        this.name = name;
    }

    // 手牌
    shoupai: number[] = [];
    // 手牌(放入了当前摸的牌)
    drawShoupai: number[] = [];
    // 碰牌
    pengs: Peng[] = [];
    // 杠牌
    gangs: Gang[] = [];
    // 缺牌类型
    notNeedType?: PaiType;
    // 当前摸的牌
    currentCard?: number = 0;
    // 打出过的牌
    cardsPlayed: number[] = [];
    // 我知道的牌（记牌器），这个是独特的记牌器，比如能看见他人的记牌器
    cardCounter: Map<number, number> = new Map<number, number>();
    // 我的听牌
    tingCard: number[] = [];
    tingpai: Tingpai = new SichuanTingpai()
    isAi: boolean = false;
    hupai: boolean = false;

    /**
     * 定缺
     */
    judgeTheLackOfCards() {
    }

    doAction() {
        this.drawShoupai = [...this.shoupai, this.currentCard].filter(item => item != undefined)
    }

    getShouPaiStr(): string[] {
        return this.shoupai.map(value => getCardStr(value));
    }

    drawCard(card: number) {
        console.log(`${this.name}抽到了${getCardStr(card)}，当前手牌${this.getShouPaiStr()}`)
        this.currentCard = card;
    }

    tingCardInit() {
        this.tingCard = this.tingpai.tingPais(this.shoupai).getTingPais()
        console.log(`${this.name}听牌了，当前手牌${this.getShouPaiStr()}，听牌：${getCardListStr(this.tingCard)}`)
    }

    /**
     * 是否在听牌
     */
    isTingCard(): boolean {
        return this.tingCard.length > 0
    }


    /**
     * 出牌，将牌放入出牌区
     */
    discardOneCard(card: number) {
        console.log(`${this.name}打出了${getCardStr(card)}`)
        this.cardsPlayed.push(card)
        this.gameInformation?.discardCard(this, card)
    }

    checkIsHuPai(card: number): boolean {
        if (this.isTingCard()) {
            return this.tingCard.includes(card)
        }
        return false;
    }

    checkIsGang(card: number): boolean {
        return this.shoupai.filter(item => item === card).length === 3;
    }

    doGang(card: number) {
        if (this.checkIsGang(card)) {
            this.shoupai = this.shoupai.filter(item => item !== card)
            this.gangs.push({singGangs: [card, card, card, card]})
        }
    }

    checkIsPeng(card: number): boolean {
        return this.shoupai.filter(item => item === card).length === 2;
    }

    doPeng(card: number) {
        if (this.checkIsPeng(card)) {
            for (let i = 0; i < 2; i++) {
                this.removeInShouPai(card);
            }
            this.pengs.push({singPengs: [card, card, card]})
        }
    }

    /**
     * 从手牌中移除
     */
    removeInShouPai(card: number) {
        // 如果为当前牌，则移除当前牌即可
        if (card === this.currentCard) {
            this.currentCard = undefined;
            return card
        }
        for (let i = 0; i < this.shoupai.length; i++) {
            if (this.shoupai[i] === card) {
                return this.removeInShouPaiByIndex(i);
            }
        }
        throw new Error("移除错误，没有对应牌在手牌中")
    }

    private removeInShouPaiByIndex(index: number) {
        // 将手牌加入进去
        const result = this.shoupai[index];
        if (this.currentCard) {
            this.shoupai[index] = this.currentCard;
            this.shoupai = lodash.sortBy(this.shoupai)
            this.currentCard = undefined;
        } else {
            // 直接移除
            this.shoupai[index] = -1;
            this.shoupai = this.shoupai.filter(item => item > 0);
        }
        return result;
    }

    endRound() {
        if (this.currentCard) {
            this.shoupai.push(this.currentCard);
            this.shoupai = lodash.sortBy(this.shoupai)
            this.currentCard = undefined;
        }
        this.drawShoupai = []
    }
}