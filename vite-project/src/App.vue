<script setup lang="ts">


import {SichuanTingpai} from "./tingPai/SichuanTingpai.ts";
import {Tingpai} from "./tingPai/Tingpai.ts";
import {AllTingpai} from "./tingPai/entities/AllTingpai.ts";

const shoupai = [3, 3, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16]
const tingpai: Tingpai = new SichuanTingpai();
const allTingpai: AllTingpai = tingpai.tingPais(shoupai);

console.log(111111)
console.log(allTingpai.getTingPais())

</script>

<template>
    <div>
        测试
    </div>
</template>

<style scoped>

</style>
