export function containsAll(sourceArray, targetArray) {
    return targetArray.every(element => sourceArray.includes(element));
}
export class ListTool {
    /**
     * 比较两个数组是否完全相等。
     *
     * @param arr1 第一个数组
     * @param arr2 第二个数组
     * @returns 如果两个数组相等则返回 true，否则返回 false。
     */
    static checkDiffrent(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
}
