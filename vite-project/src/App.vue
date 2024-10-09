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
import GameView from "./components/GameView.vue";


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

</script>

<template>
  <div style="margin: 50px">

  </div>
  <GameView></GameView>
</template>

<style scoped>

</style>
