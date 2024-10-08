<script setup lang="ts">
import {RealPlayer} from "../ai/RealPlayer.ts";
import {getCardType, getCardTypeStr, getCardTypeStrByCard, getCardZhStr} from "../util/CardUtils.ts";
import Card from "./Card.vue";
import {useRealPlayerStore} from "../store/RealPlayerStore.ts";
import {ref} from "vue";


const realPlayerStore = useRealPlayerStore()
const realPlayer: RealPlayer = realPlayerStore.getRealPlayer;

const discardIndex = ref(-1);
const isCurrent = ref(false);

/**
 * 出牌
 */
function discardTheCards(card: number, index: number) {
  if (index === 9999) {
    isCurrent.value = true;
    discardIndex.value = -1;
  } else {
    discardIndex.value = index;
    isCurrent.value = false;
  }
  realPlayer.cardsToBePlayed = card;
}

function getStyle(item: number, index: number, current: boolean) {
  if (current) {
    if (isCurrent.value) {
      return {backgroundColor: '#111199'}
    } else {
      if (realPlayer.notNeedType === getCardType(item)) {
        return {backgroundColor: 'red'}
      }
    }
  } else {
    if (discardIndex.value >= 0) {
      if (index === discardIndex.value) {
        return {backgroundColor: '#111199'}
      }
    }
    if (realPlayer?.notNeedType === getCardType(item)) {
      return {backgroundColor: 'red'}
    }
  }
  return {backgroundColor: ''}
}

</script>

<template>
  <!-- HTML -->
  <div class="container">
    <Card v-for="(item,index) in realPlayer?.shoupai" :key="index" :card-number="item" :card-type="getCardType(item)"
          :style="getStyle(item,index,false)"
          @click="discardTheCards(item,index)"
    >
    </Card>
    <Card v-if="realPlayer && realPlayer.currentCard" style="margin-left:50px" :card-number="realPlayer.currentCard"
          :style="getStyle( realPlayer.currentCard,9999,true)"
          :card-type="getCardType(realPlayer.currentCard)"
          @click="discardTheCards(realPlayer.currentCard,9999)">
    </Card>
  </div>
</template>

<style scoped>
/* CSS */
.container {
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: center; /* 水平居中 */
  gap: 10px; /* 盒子之间的间距 */
}

</style>