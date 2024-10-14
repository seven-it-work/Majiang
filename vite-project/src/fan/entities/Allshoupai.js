/**
 * 所有手牌类（包含已经胡的牌）
 *
 * @author Henry Zhou
 */
export class Allshoupai {
    constructor(shoupai = [], pengs = [], gangs = [], hued = -1) {
        this.shoupai = []; // 手牌
        this.pengs = []; // 已经碰的牌
        this.gangs = []; // 已经杠的牌
        this.hued = -1; // 已经胡的牌
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
    checkHuedInShoupai() {
        if (!this.shoupai.includes(this.hued)) {
            throw new Error("手牌中未包含已经胡的牌");
        }
    }
    /**
     * 合并所有的手牌
     */
    findAllPais() {
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
    findShoupaiExceptJiang() {
        const shouPaiCopy = [...this.shoupai];
        const groups = shouPaiCopy.reduce((acc, val) => {
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
