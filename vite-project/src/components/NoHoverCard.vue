<script setup lang="ts">

const props = defineProps({
  cardNumber: Number,
  cardType: PaiType,
  isShowCard: {
    type: Boolean,
    default: true,
  },
});

import {getCardTypeStr, getCardZhStr} from "../util/CardUtils.ts";
import {PaiType} from "../tingPai/PaiType.ts";

function getCardTypeColor(){
  switch (props.cardType){
    case PaiType.WAN:
      return {color:"#FF6A6A"}
    case PaiType.TONG:
      return {color:"#98FB98"}
    case PaiType.TIAO:
      return {color:"#87CEEB"}
  }
  return {}
}
</script>

<template>
  <div class="box">
    <div style="font-size: 25px;text-align: center" v-if="cardNumber && isShowCard">{{ getCardZhStr(cardNumber) }}</div>
    <div style="font-size: 25px;text-align: center" v-if="isShowCard" :style="getCardTypeColor()">{{ getCardTypeStr(cardType) }}</div>
  </div>
</template>

<style scoped>

.box {
  width: 40px;
  height: 60px;
  background-color: gainsboro;
  transition: transform 0.3s ease; /* 添加过渡效果 */
}
</style>