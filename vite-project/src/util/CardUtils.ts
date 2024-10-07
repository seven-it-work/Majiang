import {PaiType} from "../tingPai/PaiType.ts";

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
    throw new Error("错误牌数据")
}

export function getCardListStr(card: number[]): string[] {
    return card.map(value => getCardStr(value));
}

export function getCardTypeStr(paiType: PaiType): string {
    switch (paiType) {
        case PaiType.WAN:
            return "万"
        case PaiType.TONG:
            return "筒"
        case PaiType.TIAO:
            return "条"
    }
    throw new Error("错误类型")
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

