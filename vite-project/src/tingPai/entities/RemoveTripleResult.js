/**
 * 移除坊子结果类
 */
export class RemoveTripleResult {
    constructor(result = [], triples = []) {
        this.result = []; // 移除后的结果
        this.triples = []; // 被移除的 triple 集合
        this.result = result;
        this.triples = triples;
    }
    getResult() {
        return this.result;
    }
    setResult(value) {
        this.result = value;
    }
    getTriples() {
        return this.triples;
    }
    setTriples(value) {
        this.triples = value;
    }
}
