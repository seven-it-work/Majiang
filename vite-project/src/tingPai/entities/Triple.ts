import {ListTool} from "../../util/utils.ts";


/**
 * 坊子（例如3,4,5条，6，6,6条）
 * @author Henry Zhou
 */
class Triple {
    private integers: number[] = [];

    constructor(integers?: number[]) {
        if (integers) {
            this.integers = integers;
        }
    }

    getIntegers(): number[] {
        return this.integers;
    }

    setIntegers(integers: number[]): void {
        this.integers = integers;
    }

    threeIntTheSame(): boolean {
        return (
            this.integers.length === 3 &&
            this.integers[0] === this.integers[1] &&
            this.integers[1] === this.integers[2]
        );
    }

    sameTriple(toCompare: Triple): boolean {
        return ListTool.checkDiffrent(this.integers, toCompare.getIntegers());
    }

    equals(obj: any): boolean {
        if (this === obj) {
            return true;
        }

        if (!(obj instanceof Triple)) {
            return false;
        }

        const triple = obj as Triple;
        return this.sameTriple(triple);
    }

    hashCode(): number {
        return this.integers.reduce((acc, curr) => acc + curr, 0);
    }
}

export default Triple;