<script setup lang="ts">


import {SichuanTingpai} from "./tingPai/SichuanTingpai.ts";
import {Tingpai} from "./tingPai/Tingpai.ts";
import {AllTingpai} from "./tingPai/entities/AllTingpai.ts";
import ConfigFan from "./fan/ConfigFan.ts";
import {FanType} from "./fan/enumType/FanType.ts";
import {Gang} from "./fan/entities/Gang.ts";
import {Allshoupai} from "./fan/entities/Allshoupai.ts";
import {SichuanFan} from "./fan/SichuanFan.ts";
import {Peng} from "./fan/entities/Peng.ts";
import {GameInformation} from "./objs/GameInformation.ts";
import {Player} from "./objs/Player.ts";
import {Rookie} from "./ai/Rookie.ts";


const configFans = [
    new ConfigFan(FanType.GANG, true, 1),
    new ConfigFan(FanType.DA_DUI_ZI, true, 1),
    new ConfigFan(FanType.QING_YI_SE, true, 2),
    new ConfigFan(FanType.JIA_XIN_WU, true, 1),
    new ConfigFan(FanType.KA_ER_TIAO, true, 1),
    new ConfigFan(FanType.JIN_GOU_DIAO, true, 1),
    new ConfigFan(FanType.MEN_QING, true, 1),
    new ConfigFan(FanType.YI_JIU_JIANG_DUI, true, 1),
    new ConfigFan(FanType.BAN_BAN_GAO, true, 1),
    new ConfigFan(FanType.YI_TIAO_LONG, true, 2),
    new ConfigFan(FanType.XIAO_QI_DUI, true, 2)
]
const shoupai: number[] = [2, 12, 3, 13, 3, 5, 16];
const pengs: Peng[] = [{singPengs: [5, 5, 5]}];
const gangs:Gang[] = [{singGangs:[11, 11, 11, 11]}];
const allshoupai: Allshoupai = new Allshoupai(shoupai, pengs, gangs, 2);

var sichuanFan = new SichuanFan();
console.log(sichuanFan.findFan(allshoupai, configFans).totalFans);

const tingpai: Tingpai = new SichuanTingpai();
console.log(tingpai.tingPais(shoupai).getTingPais());

const playerList = [new Rookie("玩家1"), new Rookie("玩家2"), new Rookie("玩家3"), new Rookie("玩家4"),]
var gameInformation = new GameInformation();
gameInformation.doStart(playerList)
for (let i = 0; i < 100; i++) {
    gameInformation.doNext()
}
</script>

<template>
    <div>
        测试
    </div>
</template>

<style scoped>

</style>
