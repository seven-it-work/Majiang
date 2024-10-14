/**
 * 将（即麻将中胡牌必须要有一对中的一对）
 */
class DoublePia {
    constructor(doubles) {
        this.doubles = [];
        if (doubles) {
            this.doubles = doubles;
        }
    }
    getDoubles() {
        return this.doubles;
    }
    setDoubles(doubles) {
        this.doubles = doubles;
    }
}
export default DoublePia;
