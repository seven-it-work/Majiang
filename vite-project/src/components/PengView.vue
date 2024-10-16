<script setup lang="ts">

import Save from "./Save.vue";
import {getCardType} from "../util/CardUtils.ts";
import NoHoverCard from "./NoHoverCard.vue";
import {  Flex } from 'ant-design-vue';

const prop=defineProps({
      cardNumber: Number,
    })
</script>

<template>
  <Flex :justify="'space-between'" :align="'flex-end'">
    <NoHoverCard :card-number="cardNumber" :card-type="getCardType(cardNumber)"></NoHoverCard>
    <Save></Save>
  </Flex>

</template>

<style scoped>

</style>