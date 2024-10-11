import {Peng} from "../fan/entities/Peng.ts";
import {Gang} from "../fan/entities/Gang.ts";
import {PaiType} from "../tingPai/PaiType.ts";
import lodash from "lodash";
import {Tingpai} from "../tingPai/Tingpai.ts";
import {SichuanTingpai} from "../tingPai/SichuanTingpai.ts";
import {getCardListByType, getCardStr, getCardType} from "../util/CardUtils.ts";
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
    isHupai: boolean = false;
    countObj: {
        "TONG": number,
        "TIAO": number,
        "WAN": number,
    } = {
        "TONG": 0,
        "TIAO": 0,
        "WAN": 0,
    }
    isMyTurn: boolean = true;
    // 是否为自摸
    isSelfWin: boolean = false;
    hupaiCard?: number;

    /**
     * 胡牌策略
     */
    // @ts-ignore
    hupaiAction(card: number): boolean {
        return false;
    }

    /**
     * 胡牌
     */
    hupai(card: number): boolean {
        if (this.hupaiAction(card)) {
            console.log(`${this.name}胡牌：${card}`)
            this.isHupai = true
            this.hupaiCard=card
            return true;
        }
        return false;
    }

    /**
     * 出牌前判断
     * 如果有 杠、自摸则返回true
     */
    judgeBeforeYouPlayYourCards(): boolean {
        return !!this.currentCard && (this.checkIsHuPai(this.currentCard) || this.checkIsGang(this.currentCard));
    }

    /**
     * 杠牌策略
     */
    // @ts-ignore
    gangAction(card: number): boolean {
        return false;
    }

    /**
     * 杠牌
     */
    gang(card: number): boolean {
        if (this.gangAction(card)) {
            this.isMyTurn = true
            console.log(`${this.name}杠牌：${card}`)
            this.shoupai = this.shoupai.filter(item => item !== card)
            this.gangs.push({singGangs: [card, card, card, card]})
            if (this.currentCard === card) {
                this.currentCard = undefined;
            }
            return true;
        }
        return false;
    }

    /**
     * 碰牌策略
     */
    // @ts-ignore
    pengAction(card: number): boolean {
        return false;
    }

    /**
     * 碰牌策略
     */
    peng(card: number): boolean {
        if (this.pengAction(card)) {
            this.isMyTurn = true
            console.log(`${this.name}碰牌：${card}`)
            for (let i = 0; i < 2; i++) {
                this.removeInShouPai(card);
            }
            this.pengs.push({singPengs: [card, card, card]})
            return true;
        }
        return false;
    }

    /**
     * 出牌策略
     */
    playCardAction(): number {
        return -1;
    }


    /**
     * 出牌
     */
    playCard(): number {
        // 出牌将移除mapCount
        const number = this.playCardAction();
        this.countObj[getCardType(number)] = this.countObj[getCardType(number)] - 1;
        return number;
    }

    /**
     * 定缺策略
     */
    judgeNotNeedCardAction() {
    }

    /**
     * 定缺
     */
    judgeNotNeedCard() {
        // 初始化mapCount
        this.countObj = {
            "TONG": getCardListByType(this.drawShoupai, PaiType.TONG).length,
            "TIAO": getCardListByType(this.drawShoupai, PaiType.TIAO).length,
            "WAN": getCardListByType(this.drawShoupai, PaiType.WAN).length,
        }
        this.judgeNotNeedCardAction();
    }

    initDrawShouPai() {
        this.drawShoupai = [...this.shoupai, this.currentCard].filter(item => item != undefined)
    }

    getShouPaiStr(): string[] {
        return this.shoupai.map(value => getCardStr(value));
    }

    drawCard(card: number) {
        this.isMyTurn = true
        console.log(`${this.name}抽到了${getCardStr(card)}，当前手牌${this.getShouPaiStr()}`)
        this.currentCard = card;
        // 每次抽牌都对countMap进行维护
        this.countObj[getCardType(card)] = this.countObj[getCardType(card)] + 1;
        // 存在手牌认为牌型改变
        try {
            this.shoupaiChange()
        } catch (e) {
        }
    }

    /**
     * 是否在听牌
     */
    isTingCard(): boolean {
        return this.tingCard.length > 0
    }

    /**
     * 自摸
     */
    checkIsSelfWin(): boolean {
        if (this.isTingCard() && this.currentCard) {
            return this.tingCard.includes(this.currentCard)
        }
        return false;
    }

    /**
     * 原始杠牌
     */
    checkIsSelfGang(): boolean {
        return this.shoupai.filter(item => item === this.currentCard).length === 3;
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


    checkIsPeng(card: number): boolean {
        return this.shoupai.filter(item => item === card).length === 2;
    }

    /**
     * 从手牌中移除
     */
    removeInShouPai(card: number) {
        console.log(`${this.name}移除牌：${card}`)
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
            this.currentCard = undefined;
        } else {
            // 直接移除
            this.shoupai[index] = -1;
            this.shoupai = this.shoupai.filter(item => item > 0);
        }
        return result;
    }

    shoupaiChange() {
        this.shoupai = lodash.sortBy(this.shoupai)
        // 重新计算听牌数据
        this.tingCard = this.tingpai.tingPais(this.shoupai).getTingPais();
        if (this.tingCard.length > 0) {
            console.log("听牌了")
        }
    }

    endRound() {
        if (this.currentCard) {
            this.shoupai.push(this.currentCard);
            this.currentCard = undefined;
        }
        this.drawShoupai = []
        this.isMyTurn = false
    }

    /**
     * 记录打过的牌
     * @param card
     */
    pushPlayedCard(card: number) {
        // 存在手牌认为牌型改变
        this.shoupaiChange()
        this.cardsPlayed.push(card)
    }
}