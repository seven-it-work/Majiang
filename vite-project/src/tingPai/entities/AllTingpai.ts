import {TingDetail} from "./TingDetail.ts";

/**
 * 听牌类
 * @author Henry Zhou
 */
export class AllTingpai {

    tingPais: number[] = [];//已经听牌集合

    tingDetails: TingDetail[] = [];//听牌细节
    private static readonly LINE_BREAK: string = "\r\n";

    constructor(tingPais?: number[], tingDetails?: TingDetail[]) {
        this.tingPais = tingPais || [];
        this.tingDetails = tingDetails || [];
    }


    public getTingPais(): number[] {
        return this.tingPais || [];
    }

    public setTingPais(tingPais: number[]) {
        this.tingPais = tingPais;
    }

    public getTingDetails(): TingDetail[] {
        return this.tingDetails || [];
    }

    public toString(): string {
        let str: string = "";
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

    public setTingDetails(tingDetails: TingDetail[]) {
        this.tingDetails = tingDetails;
    }
}
