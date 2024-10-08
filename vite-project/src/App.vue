<script setup lang="ts">


import {SichuanTingpai} from "./tingPai/SichuanTingpai.ts";
import {Tingpai} from "./tingPai/Tingpai.ts";
import ConfigFan from "./fan/ConfigFan.ts";
import {FanType} from "./fan/enumType/FanType.ts";
import {Gang} from "./fan/entities/Gang.ts";
import {Allshoupai} from "./fan/entities/Allshoupai.ts";
import {SichuanFan} from "./fan/SichuanFan.ts";
import {Peng} from "./fan/entities/Peng.ts";
import {GameInformation} from "./objs/GameInformation.ts";
import {Rookie} from "./ai/Rookie.ts";
import MyCard from "./components/MyCard.vue";
import {RealPlayer} from "./ai/RealPlayer.ts";
import {computed} from "vue";
import {useRealPlayerStore} from "./store/RealPlayerStore.ts";


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
const gangs: Gang[] = [{singGangs: [11, 11, 11, 11]}];
const allshoupai: Allshoupai = new Allshoupai(shoupai, pengs, gangs, 2);

var sichuanFan = new SichuanFan();
console.log(sichuanFan.findFan(allshoupai, configFans).totalFans);

const tingpai: Tingpai = new SichuanTingpai();
console.log(tingpai.tingPais(shoupai).getTingPais());

var realPlayer = new RealPlayer("我叫王老虎");
const realPlayerStore = useRealPlayerStore()
realPlayerStore.init(realPlayer)

const playerList = [realPlayer, new Rookie("玩家2"), new Rookie("玩家3"), new Rookie("玩家4"),]
const gameInformation = new GameInformation();
gameInformation.doStart(playerList)

while (true) {
  if (gameInformation.isNoCard()) {
    console.log("结束了")
    break;
  } else {
    await gameInformation.doNext();
  }
}
</script>

<template>
  <div style="margin: 50px">

  </div>
  <MyCard></MyCard>
</template>

<style scoped>

</style>
