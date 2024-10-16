<script setup lang="ts">
import { writeText } from 'clipboard-polyfill';
import {useRealPlayerStore} from "../store/RealPlayerStore.ts";
const realPlayerStore = useRealPlayerStore()
import {  Button } from 'ant-design-vue';
function doSave(){
  realPlayerStore.doSave()
  writeText(realPlayerStore.saveJson).then(()=>{
    console.log("成功")
  });
}
</script>

<template>
<div>
  <Button @click="doSave">
    获取保存数据
  </Button>
</div>
</template>

<style scoped>

</style>