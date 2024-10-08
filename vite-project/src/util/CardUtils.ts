import {PaiType} from "../tingPai/PaiType.ts";

const zh_num_map: any = {
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
    8: '八',
    9: '九',
}

export function getCardZhStr(card: number): string {
    let number;
    if (card < 10) {
        number = card;
    }
    if (card < 20 && card > 10) {
        number = card - 10;
    }
    if (card < 30 && card > 20) {
        number = card - 20;
    }
    if (number != undefined && zh_num_map[number]) {
        return zh_num_map[number]
    }
    return ''
}

export function getCardStr(card: number): string {
    if (card < 10) {
        return card + getCardTypeStr(PaiType.TONG);
    }
    if (card < 20) {
        return card - 10 + getCardTypeStr(PaiType.TIAO);
    }
    if (card < 30) {
        return card - 20 + getCardTypeStr(PaiType.WAN);
    }
    return "错误牌数据"
}

export function getCardListStr(card: number[]): string[] {
    return card.map(value => getCardStr(value));
}

export function getCardTypeStr(paiType: PaiType | undefined): string {
    switch (paiType) {
        case PaiType.WAN:
            return "万"
        case PaiType.TONG:
            return "筒"
        case PaiType.TIAO:
            return "条"
    }
    return "错误类型"
}

export function getCardTypeStrByCard(card: number): string {
    return getCardTypeStr(getCardType(card))
}

export function getCardType(card: number): PaiType {
    if (card < 10) {
        return PaiType.TONG;
    }
    if (card < 20) {
        return PaiType.TIAO;
    }
    if (card < 30) {
        return PaiType.WAN;
    }
    throw new Error("错误牌数据")
}

export function getCardListByType(cardList: number[], paiType: PaiType): number[] {
    switch (paiType) {
        case PaiType.TONG:
            return cardList.filter(value => value < 10 && value > 0)
        case PaiType.TIAO:
            return cardList.filter(value => value < 20 && value > 10)
        case PaiType.WAN:
            return cardList.filter(value => value < 30 && value > 20)
    }
    return []
}

