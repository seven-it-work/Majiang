import { allDistintPai } from "./Tingpai.ts";
import { TingpaiTool } from "../util/TingpaiTool.ts";
import { TingDetail } from "./entities/TingDetail.ts";
import DoublePia from "./entities/DoublePia.ts";
import { AllTingpai } from "./entities/AllTingpai.ts";
import { containsAll } from "../util/utils.ts"; // 假设 entities 包含相关实体类
/**
 * 四川麻将听牌类
 */
export class SichuanTingpai {
    isTingCurrentPai(shoupai, currentPai) {
        const distinctShoupai = Array.from(new Set(shoupai));
        const tingDetails = [];
        for (let i = 0; i < distinctShoupai.length; i++) {
            const toRemoveCopule = distinctShoupai[i];
            const removedCoupleShoupai = TingpaiTool.findshoupaiWithouCouple(shoupai, toRemoveCopule);
            if (removedCoupleShoupai.length < shoupai.length) {
                const sortedRemovedCoupleShoupai = removedCoupleShoupai.sort((a, b) => a - b);
                const tingDetailPre = this.hupaiJudgePre(currentPai, toRemoveCopule, sortedRemovedCoupleShoupai);
                if (tingDetailPre) {
                    tingDetails.push(tingDetailPre);
                }
                const removeTripleResult = TingpaiTool.findShoupaiWithoutTriple(sortedRemovedCoupleShoupai);
                if (removeTripleResult.triples.length !== 0) {
                    const tingDetail = this.hupaiJudge(currentPai, toRemoveCopule, removeTripleResult);
                    if (tingDetail) {
                        tingDetails.push(tingDetail);
                    }
                }
            }
        }
        return tingDetails;
    }
    hupaiJudge(currentPai, toRemoveCopule, removeTripleResult) {
        const isAllTripleContinues = TingpaiTool.isAlltripleContinues(removeTripleResult.result);
        if (isAllTripleContinues.alltripleContinues) {
            isAllTripleContinues.triples.push(...removeTripleResult.triples);
            const tingDetail = new TingDetail(isAllTripleContinues.triples, new DoublePia([toRemoveCopule, toRemoveCopule]), currentPai, true);
            return tingDetail;
        }
        return null;
    }
    hupaiJudgePre(currentPai, toRemoveCopule, removedCoupleShoupai) {
        const removeTripleContinuesResult = TingpaiTool.isAlltripleContinues(removedCoupleShoupai);
        if (removeTripleContinuesResult.alltripleContinues) {
            const tingDetail = new TingDetail(removeTripleContinuesResult.triples, new DoublePia([toRemoveCopule, toRemoveCopule]), currentPai, true);
            return tingDetail;
        }
        return null;
    }
    tingPais(shoupai) {
        if (shoupai.length % 3 !== 1) {
            throw new Error('手牌数量必须为1,4,7,10,13张');
        }
        if (!containsAll(allDistintPai, shoupai)) {
            throw new Error('手牌中包含了未知牌');
        }
        if (this.isThreeKindsAvailable(shoupai)) {
            return new AllTingpai();
        }
        const tingpais = [];
        const tingDetailsAll = [];
        for (const singlePai of allDistintPai) {
            const combinedShouPai = [...shoupai, singlePai];
            const tingDetails = this.isTingCurrentPai(combinedShouPai, singlePai);
            tingDetailsAll.push(...tingDetails);
            if (tingDetails.length > 0) {
                tingpais.push(singlePai);
            }
        }
        const remainInt = TingpaiTool.removeAllCouples(shoupai);
        if (remainInt !== -1) {
            if (!tingpais.includes(remainInt)) {
                tingpais.push(remainInt);
            }
            const qidui = [...shoupai, remainInt].sort((a, b) => a - b);
            const tingDetailQiDui = new TingDetail(undefined, undefined, remainInt, true, qidui);
            tingDetailsAll.push(tingDetailQiDui);
        }
        return new AllTingpai(tingpais, tingDetailsAll);
    }
    isTingPai(shoupai) {
        const allTingpai = this.tingPais(shoupai);
        return allTingpai.tingPais.length > 0;
    }
    isHuPai(shoupai) {
        const tingDetails = this.isTingCurrentPai(shoupai, shoupai[0]);
        return tingDetails.length > 0;
    }
    isThreeKindsAvailable(shoupai) {
        const tongs = shoupai.filter(single => single <= 9);
        const tiaos = shoupai.filter(single => single > 9 && single <= 18);
        const wans = shoupai.filter(single => single > 18 && single <= 27);
        return tongs.length > 0 && tiaos.length > 0 && wans.length > 0;
    }
}
