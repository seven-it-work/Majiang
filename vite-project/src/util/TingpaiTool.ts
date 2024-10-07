import Triple from "../tingPai/entities/Triple.ts";
import {RemoveTripleResult} from "../tingPai/entities/RemoveTripleResult.ts";
import {RemoveTripleContinuesResult} from "../tingPai/entities/RemoveTripleContinuesResult.ts";


/**
 * 听牌工具类
 * @author Henry Zhou
 */
export class TingpaiTool {
    /**
     * 三个数是否连续
     *
     * @param threeInt 三个数
     * @returns 是否连续
     */
    public static isThreeIntContinus(threeInt: number[]): boolean {
        if (threeInt.length !== 3) {
            throw new Error('参数必须为三个');
        }
        const sortedInt = threeInt.sort((a, b) => a - b);
        return sortedInt[1] - sortedInt[0] === 1 && sortedInt[2] - sortedInt[1] === 1;
    }

    /**
     * 判断单个数是否相同
     *
     * @param threeInt 三个整数
     * @returns 是否相同
     */
    public static isThreeIntTheSame(threeInt: number[]): boolean {
        if (threeInt.length !== 3) {
            throw new Error('参数必须为三个');
        }
        return threeInt[0] === threeInt[1] && threeInt[1] === threeInt[2];
    }

    /**
     * 移除指定的一对
     *
     * @param shoupai 手牌
     * @param removeInt 需要移除的值
     * @returns 已经移除对子的手牌
     */
    public static findshoupaiWithouCouple(shoupai: number[], removeInt: number): number[] {
        let result = [...shoupai];
        let count = 0;
        for (let i = result.length - 1; i >= 0; i--) {
            if (result[i] === removeInt) {
                result.splice(i, 1);
                count++;
                if (count === 2) {
                    break;
                }
            }
        }
        return result;
    }

    /**
     * 移除指定的三个
     *
     * @param shoupai 手牌
     * @returns 已经移除三个的手牌
     */
    public static findShoupaiWithoutTriple(shoupai: number[]): RemoveTripleResult {
        let result = [...shoupai].sort((a, b) => a - b);
        let triples: Triple[] = [];
        let removeTripleResult = new RemoveTripleResult(result, triples);

        for (let i = result.length - 3; i >= 0; i--) {
            if (result[i] === result[i + 1] && result[i] === result[i + 2]) {
                let triple = new Triple([result[i], result[i + 1], result[i + 2]]);
                triples.push(triple);
                result.splice(i, 3);
                i = i - 2;
            }
        }
        return removeTripleResult;
    }

    /**
     * 对手牌三个三个进行分组
     *
     * @param shoupai 手牌
     * @returns 三个三个进行分组
     */
    public static splitTriples(shoupai: number[]): number[][] {
        let result: number[][] = [];
        let current: number[] = [];
        for (let i = 0; i < shoupai.length; i++) {
            current.push(shoupai[i]);
            if ((i + 1) % 3 === 0) {
                result.push([...current]);
                current = [];
            }
        }
        return result;
    }

    /**
     * 移除所有的对子，返回剩下的单个
     *
     * @param shoupaiOrg 原始手牌
     * @returns 返回剩下的单个
     */
    public static removeAllCouples(shoupaiOrg: number[]): number {
        let shoupai = [...shoupaiOrg].sort((a, b) => a - b);
        for (let i = shoupai.length - 1; i >= 0; i--) {
            if (i > 0 && shoupai[i] === shoupai[i - 1]) {
                shoupai.splice(i, 1);
                shoupai.splice(i - 1, 1);
                i--;
            }
        }
        return shoupai.length === 1 ? shoupai[0] : -1;
    }

    /**
     * 以第一个开头，移除递增的数；例如第一个为2，那么移除2,3,4
     *
     * @param sortedShoupais 手牌
     * @param triples 保存的连三组
     */
    private static removeAlltripleContinues(sortedShoupais: number[], triples: Triple[]): void {
        if (sortedShoupais.length > 0) {
            const first = sortedShoupais[0];
            const secondIndex = sortedShoupais.indexOf(first + 1);
            const thirdIndex = sortedShoupais.indexOf(first + 2);
            if (secondIndex !== -1 && thirdIndex !== -1) {
                let triple = new Triple([first, first + 1, first + 2]);
                triples.push(triple);
                sortedShoupais.splice(thirdIndex, 1);
                sortedShoupais.splice(secondIndex, 1);
                sortedShoupais.splice(0, 1);
                this.removeAlltripleContinues(sortedShoupais, triples);
            }
        }
    }

    /**
     * 是否手牌全为三张连续
     *
     * @param shoupais 手牌
     * @returns
     */
    public static isAlltripleContinues(shoupais: number[]): RemoveTripleContinuesResult {
        let sortedShoupai = [...shoupais].sort((a, b) => a - b);
        let triples: Triple[] = [];
        this.removeAlltripleContinues(sortedShoupai, triples);
        let removeTripleContinuesResult = new RemoveTripleContinuesResult(
            sortedShoupai.length === 0,
            triples
        );
        return removeTripleContinuesResult;
    }
}