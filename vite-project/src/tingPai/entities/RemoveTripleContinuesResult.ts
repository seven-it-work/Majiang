import Triple from "./Triple.ts";

/**
 * 手牌移除连续坊子结果类
 * @author Henry Zhou
 */
export class RemoveTripleContinuesResult {
     alltripleContinues: boolean;
     triples: Triple[];

    constructor(alltripleContinues: boolean = false, triples: Triple[] = []) {
        this.alltripleContinues = alltripleContinues;
        this.triples = triples;
    }

    public getAlltripleContinues(): boolean {
        return this.alltripleContinues;
    }

    public setAlltripleContinues(value: boolean) {
        this.alltripleContinues = value;
    }

    public getTriples(): Triple[] {
        return this.triples;
    }

    public setTriples(value: Triple[]) {
        this.triples = value;
    }
}