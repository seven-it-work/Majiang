import { ListTool } from "../../util/utils.ts";
/**
 * 坊子（例如3,4,5条，6，6,6条）
 * @author Henry Zhou
 */
class Triple {
    constructor(integers) {
        this.integers = [];
        if (integers) {
            this.integers = integers;
        }
    }
    getIntegers() {
        return this.integers;
    }
    setIntegers(integers) {
        this.integers = integers;
    }
    threeIntTheSame() {
        return (this.integers.length === 3 &&
            this.integers[0] === this.integers[1] &&
            this.integers[1] === this.integers[2]);
    }
    sameTriple(toCompare) {
        return ListTool.checkDiffrent(this.integers, toCompare.getIntegers());
    }
    equals(obj) {
        if (this === obj) {
            return true;
        }
        if (!(obj instanceof Triple)) {
            return false;
        }
        const triple = obj;
        return this.sameTriple(triple);
    }
    hashCode() {
        return this.integers.reduce((acc, curr) => acc + curr, 0);
    }
}
export default Triple;
