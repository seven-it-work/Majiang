
/**
 * 将（即麻将中胡牌必须要有一对中的一对）
 */
class DoublePia {
    private doubles: number[] = [];

    constructor(doubles?: number[]) {
        if (doubles) {
            this.doubles = doubles;
        }
    }

    getDoubles(): number[] {
        return this.doubles;
    }

    setDoubles(doubles: number[]): void {
        this.doubles = doubles;
    }
}

export default DoublePia;