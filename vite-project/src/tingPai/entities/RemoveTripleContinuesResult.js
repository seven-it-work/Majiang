/**
 * 手牌移除连续坊子结果类
 * @author Henry Zhou
 */
export class RemoveTripleContinuesResult {
    constructor(alltripleContinues = false, triples = []) {
        this.alltripleContinues = alltripleContinues;
        this.triples = triples;
    }
    getAlltripleContinues() {
        return this.alltripleContinues;
    }
    setAlltripleContinues(value) {
        this.alltripleContinues = value;
    }
    getTriples() {
        return this.triples;
    }
    setTriples(value) {
        this.triples = value;
    }
}
