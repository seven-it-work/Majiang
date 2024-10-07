import {Allshoupai} from "./entities/Allshoupai.ts";
import ConfigFan from "./ConfigFan.ts";
import SingleFan from "./entities/SingleFan.ts";
import FanEntity from "./entities/FanEntity.ts";
import {FanTool} from "../util/FanTool.ts";
import {SichuanTingpai} from "../tingPai/SichuanTingpai.ts";
import {tiao, tong, wan} from "../tingPai/Tingpai.ts";
import {containsAll} from "../util/utils.ts";
import {PaiType} from "../tingPai/PaiType.ts";
import Triple from "../tingPai/entities/Triple.ts";

/**
 * 四川麻将番算法类
 *
 * @author Henry Zhou
 */
export class SichuanFan {

    public findFan(allshoupai: Allshoupai, configFans: ConfigFan[]): FanEntity {
        allshoupai.checkHuedInShoupai();
        let totalFans = 0;
        let fans: SingleFan[] = [];

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

    private yiJiuJiangDui(allshoupai: Allshoupai): number {
        const allPais = allshoupai.findAllPais();
        const count = allPais.filter(singlePai => [1, 9, 11, 19, 21, 29].includes(singlePai)).length;
        return count === 0 ? 1 : 0;
    }

    private menQing(allshoupai: Allshoupai): number {
        return allshoupai.shoupai.length === 14 ? 1 : 0;
    }

    private xiaoQiDui(allshoupai: Allshoupai): number {
        return FanTool.isXiaoQiDui(allshoupai) ? 1 : 0;
    }

    private banBanGao(allshoupai: Allshoupai): number {
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

    private qingYiSe(allshoupai: Allshoupai): number {
        const allPai = allshoupai.findAllPais();
        return (containsAll(tong, allPai) ||
            containsAll(tiao, allPai) ||
            containsAll(wan, allPai)
        ) ? 1 : 0;
    }

    private jinGouDiao(allshoupai: Allshoupai): number {
        return allshoupai.shoupai.length === 2 ? 1 : 0;
    }

    private daDuiZi(allshoupai: Allshoupai): number {
        return FanTool.isDaduizi(allshoupai) ? 1 : 0;
    }

    private gang(allshoupai: Allshoupai): number {
        const gangs = FanTool.findGangs(allshoupai);
        return gangs.length;
    }

    private yiTiaoLong(allshoupai: Allshoupai): number {
        const shoupai = allshoupai.shoupai;
        return (FanTool.yiTiaoLongSpecifiedType(shoupai, PaiType.TONG) ||
            FanTool.yiTiaoLongSpecifiedType(shoupai, PaiType.TIAO) ||
            FanTool.yiTiaoLongSpecifiedType(shoupai, PaiType.WAN)
        ) ? 1 : 0;
    }

    private jiaXinWu(allshoupai: Allshoupai): number {
        if ([5, 15, 25].includes(allshoupai.hued)) {
            const shoupai = allshoupai.shoupai;
            return (FanTool.jiaXinWu(shoupai, PaiType.TONG) ||
                FanTool.jiaXinWu(shoupai, PaiType.TIAO) ||
                FanTool.jiaXinWu(shoupai, PaiType.WAN)
            ) ? 1 : 0;
        }
        return 0;
    }

    private kaErTiao(allshoupai: Allshoupai): number {
        if (allshoupai.hued !== 12) {
            return 0;
        }
        return FanTool.kaErTiao(allshoupai.shoupai) ? 1 : 0;
    }

    private singleBanbanGao(org: Triple[]): boolean {
        const distincted = org.filter((triple, index, self) => index === self.findIndex(t => t.equals(triple)));
        return org.length !== distincted.length;
    }
}