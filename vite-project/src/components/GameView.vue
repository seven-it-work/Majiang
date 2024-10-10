<script setup lang="ts">

import {getCardType} from "../util/CardUtils.ts";
import Card from "./Card.vue";
import {useRealPlayerStore} from "../store/RealPlayerStore.ts";
import {RealPlayer} from "../ai/RealPlayer.ts";
import {h, ref} from "vue";
import {Rookie} from "../ai/Rookie.ts";
import {GameInformation} from "../objs/GameInformation.ts";
import {Player} from "../objs/Player.ts";
import PickNotNeedCard from "./PickNotNeedCard.vue";
import {Modal} from "ant-design-vue";
import NoHoverCard from "./NoHoverCard.vue";
import lodash from 'lodash';
import CardBackLeftRight from "./CardBackLeftRight.vue";


const realPlayerStore = useRealPlayerStore()
realPlayerStore.init(new RealPlayer("我叫王老虎"))
// @ts-ignore
const realPlayer: RealPlayer = realPlayerStore.getRealPlayer;


const PickNotNeedCardOpen = ref(false)
const currentPlayerIndex = ref(0);
const cardsPlayed = ref([])

// 初始化游戏信息
const playerList: Player[] = [realPlayer, new Rookie("玩家2"), new Rookie("玩家3"), new Rookie("玩家4"),]
const realPlayerIndex = 0;
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
    Modal.warning({
      title: '请选择定缺牌',
      content: h(PickNotNeedCard),
      closable: false,
      keyboard: false,
      okText: "确定",
      onOk: () => {
        methods.PickNotNeedCardOpenOk();
      }
    });
  }
})

// 自定义函数，用于将 Modal.confirm 包装成一个返回 Promise 的函数
const confirmWithPromise = (options: any): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      ...options,
      onOk: () => {
        console.log("Ok")
        resolve(true);
      },
      onCancel: () => {
        console.log("cancel")
        reject(false)
      }
    });
  });
}

function currentNextMove() {
  console.log("该下一个人了")
  // 判断是否都胡牌了
  if (playerList.filter(item => !item.isHupai).length > 0) {
    currentPlayerIndex.value += 1;
    currentPlayerIndex.value = currentPlayerIndex.value % 4;
    if (methods.getCurrentPlayer().isHupai) {
      currentNextMove();
    }
  } else {
    // 结束了，都胡牌了
    console.log("结束了，都胡牌了")
  }
}

/**
 * 出牌执行
 */
async function doPlayCardAction() {
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
          await doPlayCardAction()
          return
        }
      }
      // 否则出牌
    }
    // 出牌
    const number = currentPlayer.playCard();
    console.log(`${currentPlayer.name}打出牌：${number}`)
    cardsPlayed.value.push(number)
    // 结束回合
    currentPlayer.endRound();
    // 判断
    if (await discardCard(currentPlayer, number)) {
      // 被改变了下一个执行人
      await doPlayCardAction()
      return
    } else {
      // 改变下一个执行人
      currentNextMove()
      // 摸牌
      currentDrawCard()
      await doPlayCardAction()
      return
    }
  } else {
    // 玩家出牌
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
          await doPlayCardAction()
          return
        }
      }
      // 否则出牌
      console.log("玩家出牌")
    }
    return
  }
}

function currentDrawCard() {
  methods.getCurrentPlayer().drawCard(gameInformation.takeOneCard())
}

/**
 * 别人出牌后，进行检测
 */
async function discardCard(dealer: Player, card: number): Promise<boolean> {
  const hupai: Player[] = [];
  const gang: Player[] = [];
  const peng: Player[] = [];
  // todo 这里有问题，遍历顺序 应该是从当前人员开始往下走
  playerList
      .filter(item => item.id !== dealer.id)
      .filter(item => item.isHupai)
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
      const result = await confirmWithPromise(
          {
            title: '是否需要胡牌',
            content: '这里是胡牌页面',
            closable: false,
            keyboard: false,
            okText: "确定",
            cancelText: "取消",
          }
      )
      if (result) {
        console.log("玩家胡牌")
        hupaiElement.hupai(card);
        // 改变下一个执行人
        currentNextMove()
        // 摸牌
        currentDrawCard()
        return result
      }
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
      const result = await confirmWithPromise(
          {
            title: '是否需要杠牌',
            content: '这里是杠牌页面',
            closable: false,
            keyboard: false,
            okText: "确定",
            cancelText: "取消",
          }
      )
      if (result) {
        console.log("玩家杠牌")
        element.gang(card);
        // 摸牌
        currentDrawCard()
        return result
      }
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
      const result = await confirmWithPromise(
          {
            title: '是否需要碰牌',
            content: '这里是碰牌页面',
            closable: false,
            keyboard: false,
            okText: "确定",
            cancelText: "取消",
          }
      )
      if (result) {
        console.log("玩家碰牌")
        // 移除碰
        element.peng(card);
        currentPlayerIndex.value = playerList.findIndex(item => item.id === element.id)
        return result
      }
    }
  }
  return false;
}

/**
 * 玩家出牌
 */
async function discardTheCards(card: number) {
  const currentPlayer = methods.getCurrentPlayer();
  // 从手牌中移除
  currentPlayer.removeInShouPai(card)
  console.log("玩家打出：" + card)
  cardsPlayed.value.push(card)
  // 结束回合
  currentPlayer.endRound();
  // 判断
  if (await discardCard(currentPlayer, card)) {
    console.log(`${card}：有人需要`)
    // 被改变了下一个执行人
    await doPlayCardAction()
  } else {
    // 改变下一个执行人
    currentNextMove()
    // 摸牌
    currentDrawCard()
    await doPlayCardAction()
  }
}

function getStyle(item: number) {
  if (realPlayer.notNeedType === getCardType(item)) {
    return {backgroundColor: 'red'}
  }
  if (realPlayer?.notNeedType === getCardType(item)) {
    return {backgroundColor: 'red'}
  }
  return {backgroundColor: ''}
}

function getRealPlayerRight() {
  return playerList[(realPlayerIndex + 1) % 4]
}

function getRealPlayerOn() {
  return playerList[(realPlayerIndex + 2) % 4]
}

function getRealPlayerLeft() {
  return playerList[(realPlayerIndex + 3) % 4]
}
</script>


<template>
  <a-row class="container">
    <Card v-if="getRealPlayerOn() && getRealPlayerOn().isHupai" >
      <template>
        胡牌
      </template>
    </Card>
    <Card v-if="getRealPlayerOn() && getRealPlayerOn().notNeedType"
          :card-type="getRealPlayerOn().notNeedType">
    </Card>
    <!--碰牌-->
    <div v-for="(item,index) in getRealPlayerOn().pengs" :key="index" class="container" style="margin: 20px">
      <NoHoverCard v-for="(card,index2) in item.singPengs" :key="index2" :card-number="card"
                   :card-type="getCardType(card)"
      >
      </NoHoverCard>
    </div>
    <!--杠牌-->
    <div v-for="(item,index) in realPlayer?.gangs" :key="index" class="container" style="margin: 20px">
      <NoHoverCard v-for="(card,index2) in item.singGangs" :key="index2" :card-number="card"
                   :card-type="getCardType(card)"
      >
      </NoHoverCard>
    </div>
    <!-- 对家-->
    <NoHoverCard v-for="(card,index2) in getRealPlayerOn().shoupai" :key="index2" :card-number="card"
                 :card-type="getCardType(card)" :is-show-card="false">
    </NoHoverCard>
  </a-row>
  <a-flex justify="space-between" align="center">
    <a-flex style="width: 25%;" justify="space-between" align="center" :vertical="true">
      <CardBackLeftRight v-if="getRealPlayerLeft() && getRealPlayerLeft().isHupai" >
        <template>
          胡牌
        </template>
      </CardBackLeftRight>
      <CardBackLeftRight v-if="getRealPlayerLeft() && getRealPlayerLeft().notNeedType"
            :card-type="getRealPlayerLeft().notNeedType">
      </CardBackLeftRight>
      <CardBackLeftRight v-for="(card,index2) in getRealPlayerLeft().shoupai" :key="index2" style="margin: 5px"
                         :card-number="card"
                         :card-type="getCardType(card)" :is-show-card="false">
      </CardBackLeftRight>
    </a-flex>
    <a-flex style="width: 50%;"  align="center" wrap="wrap">
<!--      <div class="container" style="margin-bottom: 10px" v-for="(cardList,index) in lodash.chunk(cardsPlayed,10)"-->
<!--           :key="index">-->
        <!--    出牌区：-->
        <NoHoverCard style="margin: 5px" v-for="(card,index2) in cardsPlayed" :key="index2" :card-number="card"
                     :card-type="getCardType(card)"
        >
        </NoHoverCard>
<!--      </div>-->
    </a-flex>
    <a-flex style="width: 25%;" justify="space-between" align="center" :vertical="true">
      <CardBackLeftRight v-if="getRealPlayerRight() && getRealPlayerRight().isHupai" >
        <template>
          胡牌
        </template>
      </CardBackLeftRight>
      <CardBackLeftRight v-if="getRealPlayerRight() && getRealPlayerRight().notNeedType"
                         :card-type="getRealPlayerRight().notNeedType">
      </CardBackLeftRight>
      <CardBackLeftRight v-for="(card,index2) in getRealPlayerRight().shoupai" :key="index2" style="margin: 5px"
                         :card-number="card"
                         :card-type="getCardType(card)" :is-show-card="false">
      </CardBackLeftRight>
    </a-flex>
  </a-flex>



  <div style="margin-bottom: 50px"></div>

  <div class="container">
    <div>胡牌：</div>
    <NoHoverCard v-for="(card,index2) in realPlayer.tingCard" :key="index2" :card-number="card"
                 :card-type="getCardType(card)"
    >
    </NoHoverCard>
  </div>
  <div class="container">
    <!--碰牌-->
    <div v-for="(item,index) in realPlayer?.pengs" :key="index" class="container" style="margin: 20px">
      <NoHoverCard v-for="(card,index2) in item.singPengs" :key="index2" :card-number="card"
                   :card-type="getCardType(card)"
      >
      </NoHoverCard>
    </div>
    <!--杠牌-->
    <div v-for="(item,index) in realPlayer?.gangs" :key="index" class="container" style="margin: 20px">
      <NoHoverCard v-for="(card,index2) in item.singGangs" :key="index2" :card-number="card"
                   :card-type="getCardType(card)"
      >
      </NoHoverCard>
    </div>
  </div>
  <!-- HTML -->
  <div class="container">
    <Card v-if="realPlayer && realPlayer.isHupai" >
      <template>
        胡牌
      </template>
    </Card>
    <Card v-if="realPlayer && realPlayer.notNeedType"
          :card-type="realPlayer.notNeedType">
    </Card>
    <Card v-for="(item,index) in realPlayer?.shoupai" :key="index" :card-number="item" :card-type="getCardType(item)"
          :style="getStyle(item)"
          @click="discardTheCards(item)"
    >
    </Card>
    <Card v-if="realPlayer && realPlayer.currentCard" style="margin-left:50px" :card-number="realPlayer.currentCard"
          :style="getStyle( realPlayer.currentCard)"
          :card-type="getCardType(realPlayer.currentCard)"
          @click="discardTheCards(realPlayer.currentCard)">
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