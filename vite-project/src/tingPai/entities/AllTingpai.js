/**
 * 听牌类
 * @author Henry Zhou
 */
export class AllTingpai {
    constructor(tingPais, tingDetails) {
        this.tingPais = []; //已经听牌集合
        this.tingDetails = []; //听牌细节
        this.tingPais = tingPais || [];
        this.tingDetails = tingDetails || [];
    }
    getTingPais() {
        return this.tingPais || [];
    }
    setTingPais(tingPais) {
        this.tingPais = tingPais;
    }
    getTingDetails() {
        return this.tingDetails || [];
    }
    toString() {
        let str = "";
        str += "听牌: " + this.tingPais + AllTingpai.LINE_BREAK;
        str += "听牌细节" + AllTingpai.LINE_BREAK;
        for (let i = 0; i < this.tingDetails.length; i++) {
            const tingDetail = this.tingDetails[i];
            str += "-----------------------------------" + AllTingpai.LINE_BREAK;
            str += "胡：" + tingDetail.getHupai() + AllTingpai.LINE_BREAK;
            str += "将：" + tingDetail.getDoublePia().getDoubles().toString() + AllTingpai.LINE_BREAK;
            // for (Triple triple : tingDetail.getTriples()) {
            //     str += "组合：" + triple.getIntegers().toString() + AllTingpai.LINE_BREAK;
            // }
            if (tingDetail.getQiDui().length != 0) {
                str += "七对:" + tingDetail.getQiDui().toString() + AllTingpai.LINE_BREAK;
            }
            str += "-----------------------------------";
        }
        return str;
    }
    setTingDetails(tingDetails) {
        this.tingDetails = tingDetails;
    }
}
AllTingpai.LINE_BREAK = "\r\n";
