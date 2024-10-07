const handler = {
    wan: [1, 2, 3, 8, 8, 9, 9],
    tiao: [1, 1, 2, 2, 3, 3],
    tong: [],
}

class PaiXing {
    wan = [1, 2, 3, 8, 8, 9, 9];
    tiao = [1, 1, 2, 2, 3, 3];
    tong = [];

    notInHandler = {
        wan: [],
        tiao: [],
        tong: [],
    }
    notNeedType = 'tong';

    getNotInHandlerLen() {
        return this.notInHandler.wan.length + this.notInHandler.tiao.length + this.notInHandler.tong.length
    }

    getHandlerLen() {
        return this.wan.length + this.tiao.length + this.tong.length
    }


    /**
     * 是否为大单调
     */
    checkIsBigSingleHoist() {
        return this.getHandlerLen() === 1;
    }

    /**
     * 是否为大对子
     */

    /**
     * 是否为龙7对
     */

    /**
     * 是否为暗7对
     */
    checkIs7Pairs() {
        // 如果notInHandler有数据，则不可能是暗7对
        if (this.getNotInHandlerLen() > 0) {
            return false;
        }
        return this.getPairsLen(this) === 7;
    }

    getPairsLen(handlerObj) {
        let len = 0;
        ['wang', 'tong', 'tiao'].forEach(type => {
            const countTemp = new Map()
            handlerObj[type].forEach(value => {
                countTemp.set(value, (countTemp.get(value) || 0) + 1)
            })
            len += Array.from(countTemp.values()).filter(item => item === 2).length
        })
        return len;
    }

    /**
     * 检测是否为清一色
     */
    checkIsUniform() {
        let colorCount = 0;
        if (this.wan.length > 0 || this.notInHandler.wan.length > 0) {
            colorCount++;
        }
        if (this.tiao.length > 0 || this.notInHandler.tiao.length > 0) {
            colorCount++;
        }
        if (this.tong.length > 0 || this.notInHandler.tong.length > 0) {
            colorCount++;
        }
        return colorCount === 1;
    }

    checkIsWinning(number, type) {
        if (type === this.notNeedType) {
            return false;
        }
        //



        const newObj = {
            wan: [...this.wan],
            tiao: [...this.tiao],
            tong: [...this.tong],
        }
        // 插入其中
        newObj[type].push(number);
        // 利用map统计
        const countObj = {
            wan: new Map(),
            tiao: new Map(),
            tong: new Map(),
        };
        ['wang', 'tong', 'tiao'].forEach(typeTemp => {
            const mapTemp = countObj[typeTemp];
            newObj[typeTemp].forEach(value => {
                mapTemp.set(value, (mapTemp.get(value) || 0) + 1)
            })
        });
        // 先找3、6、9、12的数量花色，这些牌可能作为将

    }


    /**
     * 检测是否能碰牌
     * @param number 牌
     * @param type 类型 万、条、筒
     */
    checkIsPeng(number, type) {
        if (type === this.notNeedType) {
            return false;
        }
        let typeList = this[type]
        const countTemp = new Map()
        typeList.forEach(value => {
            countTemp.set(value, (countTemp.get(value) || 0) + 1)
        })
        return Array.from(countTemp.values()).filter(item => item >= 2).length > 0;
    }

    /**
     * 检测是否能杠牌
     * @param number 牌
     * @param type 类型 万、条、筒
     */
    checkIsGang(number, type) {
        if (type === this.notNeedType) {
            return false;
        }
        let typeList = this[type]
        const countTemp = new Map()
        typeList.forEach(value => {
            countTemp.set(value, (countTemp.get(value) || 0) + 1)
        })
        return Array.from(countTemp.values()).filter(item => item >= 3).length > 0;
    }
}