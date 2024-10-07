import Triple from "./Triple.ts";
import DoublePia from "./DoublePia.ts";


/**
 * 听牌细节（单张）
 * @author Henry Zhou
 */
export class TingDetail {
    private triples: Triple[] = [];//坊子
    private doublePia: DoublePia = new DoublePia();//将
    private hupai: number = -1;//胡哪一张牌
    private hupaiYesNot: boolean = false;//是否已经胡牌
    private qiDui: number[] = [];//小七对


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
