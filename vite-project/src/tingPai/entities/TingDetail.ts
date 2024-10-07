import Triple from "./Triple.ts";
import DoublePia from "./DoublePia.ts";


/**
 * 听牌细节（单张）
 * @author Henry Zhou
 */
export class TingDetail {
    triples: Triple[] = [];//坊子
    doublePia: DoublePia = new DoublePia();//将
    hupai: number = -1;//胡哪一张牌
    hupaiYesNot: boolean = false;//是否已经胡牌
    qiDui: number[] = [];//小七对


    constructor(triples?: Triple[], doublePia?: DoublePia, hupai?: number, hupaiYesNot?: boolean, qiDui?: number[]) {
        if (triples) {
            this.triples = triples;
        }
        if (doublePia) {
            this.doublePia = doublePia;
        }
        if (hupai) {
            this.hupai = hupai;
        }
        if (hupaiYesNot) {
            this.hupaiYesNot = hupaiYesNot;
        }
        if (qiDui) {
            this.qiDui = qiDui;
        }
    }

    getTriples(): Triple[] {
        return this.triples;
    }

    setTriples(value: Triple[]) {
        this.triples = value;
    }

    getDoublePia(): DoublePia {
        return this.doublePia;
    }

    setDoublePia(value: DoublePia) {
        this.doublePia = value;
    }

    getHupai(): number {
        return this.hupai;
    }

    setHupai(value: number) {
        this.hupai = value;
    }

    getHupaiYesNot(): boolean {
        return this.hupaiYesNot;
    }

    setHupaiYesNot(value: boolean) {
        this.hupaiYesNot = value;
    }

    getQiDui(): number[] {
        return this.qiDui;
    }

    setQiDui(value: number[]) {
        this.qiDui = value;
    }
}
