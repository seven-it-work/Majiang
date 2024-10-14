import DoublePia from "./DoublePia.ts";
/**
 * 听牌细节（单张）
 * @author Henry Zhou
 */
export class TingDetail {
    constructor(triples, doublePia, hupai, hupaiYesNot, qiDui) {
        this.triples = []; //坊子
        this.doublePia = new DoublePia(); //将
        this.hupai = -1; //胡哪一张牌
        this.hupaiYesNot = false; //是否已经胡牌
        this.qiDui = []; //小七对
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
    getTriples() {
        return this.triples;
    }
    setTriples(value) {
        this.triples = value;
    }
    getDoublePia() {
        return this.doublePia;
    }
    setDoublePia(value) {
        this.doublePia = value;
    }
    getHupai() {
        return this.hupai;
    }
    setHupai(value) {
        this.hupai = value;
    }
    getHupaiYesNot() {
        return this.hupaiYesNot;
    }
    setHupaiYesNot(value) {
        this.hupaiYesNot = value;
    }
    getQiDui() {
        return this.qiDui;
    }
    setQiDui(value) {
        this.qiDui = value;
    }
}
