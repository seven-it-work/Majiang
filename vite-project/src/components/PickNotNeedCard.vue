<script setup lang="ts">

import {PaiType} from "../tingPai/PaiType.ts";
import Card from "./Card.vue";
import {RealPlayer} from "../ai/RealPlayer.ts";
import {computed, ref} from "vue";
import {useRealPlayerStore} from "../store/RealPlayerStore.ts";



const realPlayerStore = useRealPlayerStore()
const realPlayer: RealPlayer = realPlayerStore.realPlayer;


function clickCard(cardType: PaiType) {
  if (realPlayer) {
    realPlayer.notNeedType = cardType
  }
}
</script>

<template>
  <div style="margin-top: 20px">
    <div class="container">
      <Card @click="clickCard(PaiType.TONG)" :card-type="PaiType.TONG" :style="{backgroundColor:realPlayer.notNeedType===PaiType.TONG?'red':''}"></Card>
      <Card @click="clickCard(PaiType.TIAO)" :card-type="PaiType.TIAO" :style="{backgroundColor:realPlayer.notNeedType===PaiType.TIAO?'red':''}"></Card>
      <Card @click="clickCard(PaiType.WAN)" :card-type="PaiType.WAN" :style="{backgroundColor:realPlayer.notNeedType===PaiType.WAN?'red':''}"></Card>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: center; /* 水平居中 */
  gap: 10px; /* 盒子之间的间距 */
}

</style>