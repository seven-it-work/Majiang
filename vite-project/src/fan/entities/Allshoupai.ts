import Peng from "./Peng.ts";
import Gang from "./Gang.ts";

/**
 * 所有手牌类（包含已经胡的牌）
 *
 * @author Henry Zhou
 */
export class Allshoupai {
     shoupai: number[] = []; // 手牌
     pengs: Peng[] = []; // 已经碰的牌
     gangs: Gang[] = []; // 已经杠的牌
     hued: number = -1; // 已经胡的牌

    constructor(shoupai: number[] = [], pengs: Peng[] = [], gangs: Gang[] = [], hued: number = -1) {
        this.shoupai = shoupai;
        this.pengs = pengs;
        this.gangs = gangs;
        this.hued = hued;
    }



    /**
     * 验证手牌中是否已经包含胡的牌，如果没有那么抛出异常
     *
     * @throws {Error}
     */
    public checkHuedInShoupai(): void {
        if (!this.shoupai.includes(this.hued)) {
            throw new Error("手牌中未包含已经胡的牌");
        }
    }

    /**
     * 合并所有的手牌
     */
    public findAllPais(): number[] {
        const all = [...this.shoupai];
        this.pengs.forEach(peng => all.push(...peng.singPengs));
        this.gangs.forEach(gang => all.push(...gang.singGangs));

        return all;
    }

    /**
     * 找到将，并移除，返回无将手牌
     *
     * @returns {number[]}
     */
    public findShoupaiExceptJiang(): number[] {
        const shouPaiCopy = [...this.shoupai];
        const groups = shouPaiCopy.reduce((acc:any, val) => {
            if (!acc[val]) {
                acc[val] = { count: 0 };
            }
            acc[val].count++;
            return acc;
        }, {});

        Object.keys(groups).forEach(k => {
            const value = groups[k];
            if (value.count === 2) {
                const index = shouPaiCopy.indexOf(parseInt(k));
                if (index !== -1) {
                    shouPaiCopy.splice(index, 1);
                }
            }
        });

        return shouPaiCopy;
    }
}