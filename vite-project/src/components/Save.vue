<script setup lang="ts">
import { writeText } from 'clipboard-polyfill';
import {useRealPlayerStore} from "../store/RealPlayerStore.ts";
const realPlayerStore = useRealPlayerStore()
function doSave(){
  realPlayerStore.doSave()
  writeText(realPlayerStore.saveJson).then(()=>{
    console.log("成功")
  });
}
</script>

<template>
<a-button @click="doSave">
  获取保存数据
</a-button>
</template>

<style scoped>

</style>