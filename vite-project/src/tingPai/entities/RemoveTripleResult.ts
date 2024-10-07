import Triple from "./Triple.ts";

/**
 * 移除坊子结果类
 */
export class RemoveTripleResult {
     result: number[] = []; // 移除后的结果
     triples: Triple[] = []; // 被移除的 triple 集合

    constructor(result: number[] = [], triples: Triple[] = []) {
        this.result = result;
        this.triples = triples;
    }

    public getResult(): number[] {
        return this.result;
    }

    public setResult(value: number[]) {
        this.result = value;
    }

    public getTriples(): Triple[] {
        return this.triples;
    }

    public setTriples(value: Triple[]) {
        this.triples = value;
    }
}