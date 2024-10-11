<script setup lang="ts">

import NoHoverCard from "./NoHoverCard.vue";
import {allDistintPai, tiao, tong, wan} from "../tingPai/Tingpai.ts";
import {getCardType} from "../util/CardUtils.ts";
import {useRealPlayerStore} from "../store/RealPlayerStore.ts";

const realPlayerStore = useRealPlayerStore()
// @ts-ignore
const playerList: Player[] = realPlayerStore.getPlayerList;

function getHavePlayedCard(card: number): number {
  // 获取所有人的出牌区
  const allPlayedCard: number[] = []
  playerList.forEach(p => {
    allPlayedCard.push(...p.cardsPlayed)
  })
  // 碰、杠收集
  playerList.forEach(p => {
    allPlayedCard.push(...p.gangs.flatMap(temp => temp.singGangs))
    allPlayedCard.push(...p.pengs.flatMap(temp => temp.singPengs))
  })
  const count = new Map<number, number>();
  for (let i = 0; i < allPlayedCard.length; i++) {
    count.set(allPlayedCard[i], (count.get(allPlayedCard[i]) || 0) + 1);
  }
  return count.get(card) || 0;
}
</script>

<template>
  <a-flex :vertical="true">
    <a-flex>
      <div v-for="card in tiao" :key="card">
        <div>{{ getHavePlayedCard(card) }}</div>
        <NoHoverCard
            :card-type="getCardType(card)"
            :card-number="card"
        >
        </NoHoverCard>
      </div>
    </a-flex>
    <a-flex>
      <div v-for="card in tong" :key="card">
        <div>{{ getHavePlayedCard(card) }}</div>
        <NoHoverCard
            :card-type="getCardType(card)"
            :card-number="card"
        >
        </NoHoverCard>
      </div>
    </a-flex>
    <a-flex>
      <div v-for="card in wan" :key="card">
        <div>{{ getHavePlayedCard(card) }}</div>
        <NoHoverCard
            :card-type="getCardType(card)"
            :card-number="card"
        >
        </NoHoverCard>
      </div>
    </a-flex>
  </a-flex>
</template>

<style scoped>

</style>