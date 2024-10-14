<script setup lang="ts">

import Save from "./Save.vue";
import {getCardType} from "../util/CardUtils.ts";
import NoHoverCard from "./NoHoverCard.vue";

const prop=defineProps({
      cardNumber: Number,
    })
</script>

<template>
  <a-flex>
    <NoHoverCard :card-number="cardNumber" :card-type="getCardType(cardNumber)"></NoHoverCard>
  </a-flex>
  <Save></Save>
</template>

<style scoped>

</style>