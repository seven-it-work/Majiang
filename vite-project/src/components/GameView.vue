<script setup lang="ts">

import {getCardType} from "../util/CardUtils.ts";
import Card from "./Card.vue";
import {useRealPlayerStore} from "../store/RealPlayerStore.ts";
import {RealPlayer} from "../ai/RealPlayer.ts";
import {ref} from "vue";
import {Rookie} from "../ai/Rookie.ts";
import {GameInformation} from "../objs/GameInformation.ts";
import {Player} from "../objs/Player.ts";
import PickNotNeedCard from "./PickNotNeedCard.vue";

const realPlayerStore = useRealPlayerStore()
realPlayerStore.init(new RealPlayer("我叫王老虎"))
// @ts-ignore
const realPlayer: RealPlayer = realPlayerStore.getRealPlayer;


const PickNotNeedCardOpen = ref(false)
const currentPlayerIndex = ref(0);

// 初始化游戏信息
const playerList: Player[] = [realPlayer, new Rookie("玩家2"), new Rookie("玩家3"), new Rookie("玩家4"),]
const gameInformation = new GameInformation();

const methods = {
  getCurrentPlayer: (): Player => {
    return playerList[currentPlayerIndex.value]
  },
  PickNotNeedCardOpenOk: () => {
    // 玩家定缺完成后，才能继续执行
    PickNotNeedCardOpen.value = false;
    doPlayCardAction();
  }
}

// 1、发牌，发完之后进行出牌判断
// 每次拿4张，一共拿3次
for (let i = 0; i < 3; i++) {
  playerList.forEach(player => {
    player.gameInformation = gameInformation;
    const numbers = gameInformation.takeCards();
    player.shoupai.push(...numbers);
  })
}
// 再每人一张
playerList.forEach(player => {
  player.drawCard(gameInformation.takeOneCard())
  player.endRound();
})
// 第一个人在摸一张
methods.getCurrentPlayer().drawCard(gameInformation.takeOneCard())
// 定缺
playerList.forEach(player => {
  if (player.isAi) {
    player.judgeNotNeedCard();
  } else {
    // 玩家定缺，玩家弹窗，弹窗执行后才开始
    PickNotNeedCardOpen.value = true;
  }
})

function currentNextMove() {
  currentPlayerIndex.value += 1;
  currentPlayerIndex.value = currentPlayerIndex.value % 4;
}

/**
 * 出牌执行
 */
function doPlayCardAction() {
  // 开始出牌
  const currentPlayer = methods.getCurrentPlayer();
  if (currentPlayer.isAi) {
    // 出牌前判断
    if (currentPlayer.judgeBeforeYouPlayYourCards()) {
      if (currentPlayer.checkIsSelfWin()) {
        // 如果胡牌，胡牌执行策略
        // @ts-ignore
        if (currentPlayer.hupai(currentPlayer.currentCard)) {
          console.log(`${currentPlayer.name}自摸：${currentPlayer.currentCard}`)
          // 改变下一个执行人
          currentNextMove()
          return
        }
      }
      if (currentPlayer.checkIsSelfGang()) {
        // 如果杠牌，杠牌执行策略
        // @ts-ignore
        if (currentPlayer.gangAction(currentPlayer.currentCard)) {
          console.log(`${currentPlayer.name}原始杠牌：${currentPlayer.currentCard}`)
          // 继续执行  摸牌
          currentDrawCard()
          doPlayCardAction()
          return
        }
      }
      // 否则出牌
    }
    // 出牌
    const number = currentPlayer.playCard();
    console.log(`${currentPlayer.name}打出牌：${number}`)
    // 结束回合
    currentPlayer.endRound();
    // 判断
    if (discardCard(currentPlayer, number)) {
      // 被改变了下一个执行人
      doPlayCardAction()
      return
    } else {
      // 改变下一个执行人
      currentNextMove()
      // 摸牌
      currentDrawCard()
      doPlayCardAction()
      return
    }
  } else {
    // 玩家出牌
    console.log("玩家出牌")
    return
  }
}

function currentDrawCard() {
  methods.getCurrentPlayer().drawCard(gameInformation.takeOneCard())
}

/**
 * 别人出牌后，进行检测
 */
function discardCard(dealer: Player, card: number): boolean {
  const hupai: Player[] = [];
  const gang: Player[] = [];
  const peng: Player[] = [];
  playerList
      .filter(item => item.id !== dealer.id)
      .map((item) => {
        // 检测是否胡牌
        if (item.checkIsHuPai(card)) {
          hupai.push(item);
        }
        // 检测是否杠
        if (item.checkIsGang(card)) {
          gang.push(item);
        }
        // 检测是否碰
        if (item.checkIsPeng(card)) {
          peng.push(item);
        }
      })
  // 执行顺序胡牌->杠->碰
  for (let i = 0; i < hupai.length; i++) {
    const hupaiElement = hupai[i];
    if (hupaiElement.isAi) {
      if (hupaiElement.hupai(card)) {
        console.log(`${hupaiElement.name}胡牌：${card}`)
        // 这里是胡牌的下一个人继续执行
        // 改变下一个执行人
        currentNextMove()
        // 摸牌
        currentDrawCard()
        return true;
      }
    } else {
      // 这里可能要采用弹窗形式去阻塞了
      console.log("todo 玩家是否需要胡牌")
    }
  }
  for (let i = 0; i < gang.length; i++) {
    const element = gang[i];
    if (element.isAi) {
      if (element.gang(card)) {
        console.log(`${element.name}杠牌：${card}`)
        // 这里杠了继续摸牌执行
        // 摸牌
        currentDrawCard()
        return true;
      }
    } else {
      // 这里可能要采用弹窗形式去阻塞了
      console.log("todo 玩家是否需要杠牌")
    }
  }
  for (let i = 0; i < peng.length; i++) {
    const element = peng[i];
    if (element.isAi) {
      if (element.peng(card)) {
        console.log(`${element.name}碰牌：${card}`)
        currentPlayerIndex.value = playerList.findIndex(item => item.id === element.id)
        // 这里碰了，继续执行
        return true;
      }
    } else {
      // 这里可能要采用弹窗形式去阻塞了
      console.log("todo 玩家是否需要碰牌")
    }
  }
  return false;
}

/**
 * 玩家出牌
 */
function discardTheCards(card: number) {
  const currentPlayer = methods.getCurrentPlayer();
  // 从手牌中移除
  currentPlayer.removeInShouPai(card)
  console.log("玩家打出：" + card)
  // 结束回合
  currentPlayer.endRound();
  // 判断
  if (discardCard(currentPlayer, card)) {
    console.log(`${card}：有人需要`)
    // 被改变了下一个执行人
    doPlayCardAction()
  } else {
    // 改变下一个执行人
    currentNextMove()
    // 摸牌
    currentDrawCard()
    doPlayCardAction()
  }
}

function getStyle(item: number, index: number, current: boolean) {

  return {backgroundColor: ''}
}
</script>


<template>
  <!-- HTML -->
  <div class="container">
    <Card v-for="(item,index) in realPlayer?.shoupai" :key="index" :card-number="item" :card-type="getCardType(item)"
          :style="getStyle(item,index,false)"
          @click="discardTheCards(item)"
    >
    </Card>
    <Card v-if="realPlayer && realPlayer.currentCard" style="margin-left:50px" :card-number="realPlayer.currentCard"
          :style="getStyle( realPlayer.currentCard,9999,true)"
          :card-type="getCardType(realPlayer.currentCard)"
          @click="discardTheCards(realPlayer.currentCard)">
    </Card>
  </div>

  <!--定缺-->
  <a-modal ref="PickNotNeedCardRef" v-model:open="PickNotNeedCardOpen" @ok="methods.PickNotNeedCardOpenOk">
    <PickNotNeedCard></PickNotNeedCard>
  </a-modal>
</template>

<style scoped>
/* CSS */
.container {
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: center; /* 水平居中 */
  gap: 10px; /* 盒子之间的间距 */
}
</style>