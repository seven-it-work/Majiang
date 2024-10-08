<script setup lang="ts">

const props = defineProps({
  cardNumber: Number,
  cardType: PaiType,
});

import {getCardTypeStr, getCardTypeStrByCard, getCardZhStr} from "../util/CardUtils.ts";
import {PaiType} from "../tingPai/PaiType.ts";
</script>

<template>
  <div class="box">
    <div style="font-size: 40px;text-align: center" v-if="cardNumber">{{ getCardZhStr(cardNumber) }}</div>
    <div style="font-size: 40px;text-align: center">{{ getCardTypeStr(cardType) }}</div>
  </div>
</template>

<style scoped>

.box {
  width: 80px;
  height: 125px;
  background-color: gainsboro;
  transition: transform 0.3s ease; /* 添加过渡效果 */
}

.box:hover {
  transform: translateY(-20px); /* 向上移动 20px */
}
</style>