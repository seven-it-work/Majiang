import SingleFan from "./entities/SingleFan.ts";
import FanEntity from "./entities/FanEntity.ts";
import { FanTool } from "../util/FanTool.ts";
import { SichuanTingpai } from "../tingPai/SichuanTingpai.ts";
import { tiao, tong, wan } from "../tingPai/Tingpai.ts";
import { containsAll } from "../util/utils.ts";
import { PaiType } from "../tingPai/PaiType.ts";
/**
 * 四川麻将番算法类
 *
 * @author Henry Zhou
 */
export class SichuanFan {
    findFan(allshoupai, configFans) {
        allshoupai.checkHuedInShoupai();
        let totalFans = 0;
        let fans = [];
        for (const configFan of configFans) {
            let currentFan = 0;
            if (configFan.valid) {
                switch (configFan.fanType) {
                    case 'GANG':
                        currentFan = this.gang(allshoupai) * configFan.singleFan;
                        break;
                    case 'DA_DUI_ZI':
                        currentFan = this.daDuiZi(allshoupai) * configFan.singleFan;
                        break;
                    case 'QING_YI_SE':
                        currentFan = this.qingYiSe(allshoupai) * configFan.singleFan;
                        break;
                    case 'JIA_XIN_WU':
                        currentFan = this.jiaXinWu(allshoupai) * configFan.singleFan;
                        break;
                    case 'KA_ER_TIAO':
                        currentFan = this.kaErTiao(allshoupai) * configFan.singleFan;
                        break;
                    case 'JIN_GOU_DIAO':
                        currentFan = this.jinGouDiao(allshoupai) * configFan.singleFan;
                        break;
                    case 'MEN_QING':
                        currentFan = this.menQing(allshoupai) * configFan.singleFan;
                        break;
                    case 'YI_JIU_JIANG_DUI':
                        currentFan = this.yiJiuJiangDui(allshoupai) * configFan.singleFan;
                        break;
                    case 'BAN_BAN_GAO':
                        currentFan = this.banBanGao(allshoupai) * configFan.singleFan;
                        break;
                    case 'YI_TIAO_LONG':
                        currentFan = this.yiTiaoLong(allshoupai) * configFan.singleFan;
                        break;
                    case 'XIAO_QI_DUI':
                        currentFan = this.xiaoQiDui(allshoupai) * configFan.singleFan;
                        break;
                }
                const singleFan = new SingleFan(configFan.fanType, currentFan);
                if (currentFan !== 0) {
                    fans.push(singleFan);
                    totalFans += currentFan;
                }
            }
        }
        const fanEntity = new FanEntity(fans, totalFans);
        return fanEntity;
    }
    yiJiuJiangDui(allshoupai) {
        const allPais = allshoupai.findAllPais();
        const count = allPais.filter(singlePai => [1, 9, 11, 19, 21, 29].includes(singlePai)).length;
        return count === 0 ? 1 : 0;
    }
    menQing(allshoupai) {
        return allshoupai.shoupai.length === 14 ? 1 : 0;
    }
    xiaoQiDui(allshoupai) {
        return FanTool.isXiaoQiDui(allshoupai) ? 1 : 0;
    }
    banBanGao(allshoupai) {
        const sichuanTingpai = new SichuanTingpai();
        const tingDetails = sichuanTingpai.isTingCurrentPai(allshoupai.shoupai, allshoupai.shoupai[0]);
        let countBanBanGao = 0;
        for (const tingDetail of tingDetails) {
            const triples = tingDetail.triples.filter(triple => !triple.threeIntTheSame());
            if (triples.length === 4) {
                const count = triples.filter(triple => triple.sameTriple(triples[0])).length;
                if (count === 4) {
                    countBanBanGao = 2;
                }
            }
            if (this.singleBanbanGao(triples) && countBanBanGao !== 2) {
                countBanBanGao = 1;
            }
        }
        return countBanBanGao;
    }
    qingYiSe(allshoupai) {
        const allPai = allshoupai.findAllPais();
        return (containsAll(tong, allPai) ||
            containsAll(tiao, allPai) ||
            containsAll(wan, allPai)) ? 1 : 0;
    }
    jinGouDiao(allshoupai) {
        return allshoupai.shoupai.length === 2 ? 1 : 0;
    }
    daDuiZi(allshoupai) {
        return FanTool.isDaduizi(allshoupai) ? 1 : 0;
    }
    gang(allshoupai) {
        const gangs = FanTool.findGangs(allshoupai);
        return gangs.length;
    }
    yiTiaoLong(allshoupai) {
        const shoupai = allshoupai.shoupai;
        return (FanTool.yiTiaoLongSpecifiedType(shoupai, PaiType.TONG) ||
            FanTool.yiTiaoLongSpecifiedType(shoupai, PaiType.TIAO) ||
            FanTool.yiTiaoLongSpecifiedType(shoupai, PaiType.WAN)) ? 1 : 0;
    }
    jiaXinWu(allshoupai) {
        if ([5, 15, 25].includes(allshoupai.hued)) {
            const shoupai = allshoupai.shoupai;
            return (FanTool.jiaXinWu(shoupai, PaiType.TONG) ||
                FanTool.jiaXinWu(shoupai, PaiType.TIAO) ||
                FanTool.jiaXinWu(shoupai, PaiType.WAN)) ? 1 : 0;
        }
        return 0;
    }
    kaErTiao(allshoupai) {
        if (allshoupai.hued !== 12) {
            return 0;
        }
        return FanTool.kaErTiao(allshoupai.shoupai) ? 1 : 0;
    }
    singleBanbanGao(org) {
        const distincted = org.filter((triple, index, self) => index === self.findIndex(t => t.equals(triple)));
        return org.length !== distincted.length;
    }
}
