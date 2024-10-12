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
import CardBackLeftRight from "./CardBackLeftRight.vue";
import lodash from "lodash";
import CardCounter from "./CardCounter.vue";
import Save from "./Save.vue";

// 初始化游戏信息
var realPlayer1 = new RealPlayer("我叫王老虎");
var rookieOn = new Rookie("玩家3");
var rookieRight = new Rookie("玩家2");
var rookieLeft = new Rookie("玩家4");

const realPlayerStore = useRealPlayerStore()
realPlayerStore.init(realPlayer1, [realPlayer1, rookieRight, rookieOn, rookieLeft,], new GameInformation())



const PickNotNeedCardOpen = ref(false)
const currentPlayerIndex = ref(0);
const isDebugger = ref(true);
const jsonData = ref('');


function loadData() {
  try {
    const parse = JSON.parse(jsonData.value);
    debugger
    const playerInfo: RealPlayer = new RealPlayer().initByJson(parse.realPlayer) as RealPlayer;
    const gameInformationInit = new GameInformation().initByJson(parse.gameInformation);
    const data = parse.playerList.map((o: any) => {
      switch (o.classType) {
        case "RealPlayer":
          return playerInfo;
        case "Rookie":
          return new Rookie().initByJson(o);
      }
    });
    data.forEach(player => {
      player.getGameInformation = gameInformationInit;
    })
    realPlayerStore.init(playerInfo, data, gameInformationInit)
  } catch (e) {
    console.log(e)
  }
}

const methods = {
  getCurrentPlayer: (): Player => {
    return realPlayerStore.getPlayerList[currentPlayerIndex.value]
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
  realPlayerStore.getPlayerList.forEach(player => {
    player.gameInformation = realPlayerStore.getGameInformation;
    const numbers = realPlayerStore.getGameInformation.takeCards();
    player.shoupai.push(...numbers);
  })
}
// 再每人一张
realPlayerStore.getPlayerList.forEach(player => {
  player.drawCard(realPlayerStore.getGameInformation.takeOneCard())
  player.endRound();
})
// 第一个人在摸一张
methods.getCurrentPlayer().drawCard(realPlayerStore.getGameInformation.takeOneCard())
// 定缺
realPlayerStore.getPlayerList.forEach(player => {
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
  return new Promise((resolve) => {
    Modal.confirm({
      ...options,
      onOk: () => {
        console.log("Ok")
        resolve(true);
      },
      onCancel: () => {
        console.log("cancel")
        resolve(false)
      }
    });
  });
}

function currentNextMove() {
  console.log("该下一个人了")
  // 判断是否都胡牌了
  if (realPlayerStore.getPlayerList.filter(item => !item.isHupai).length > 0) {
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
          currentPlayer.currentCard = undefined
          currentPlayer.isSelfWin = true
          // 改变下一个执行人
          currentNextMove()
          return
        }
      }
      if (currentPlayer.checkIsSelfGang()) {
        // 如果杠牌，杠牌执行策略
        // @ts-ignore
        if (currentPlayer.gangAction(currentPlayer.currentCard)) {
          currentPlayer.currentCard = undefined
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
    currentPlayer.pushPlayedCard(number)
    // 结束回合
    currentPlayer.endRound();
    // 执行动画
    await playDh()
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
  if (realPlayerStore.getGameInformation.isNoCard()) {
    console.log("牌摸完了，结束游戏")
    return
  }
  methods.getCurrentPlayer().drawCard(realPlayerStore.getGameInformation.takeOneCard())
}

/**
 * 别人出牌后，进行检测
 */
async function discardCard(dealer: Player, card: number): Promise<boolean> {
  const hupai: Player[] = [];
  const gang: Player[] = [];
  const peng: Player[] = [];
  // todo 这里有问题，遍历顺序 应该是从当前人员开始往下走
  realPlayerStore.getPlayerList
      .filter(item => item.id !== dealer.id)
      .filter(item => !item.isHupai)
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
        // 移除出牌人的出牌数据
        dealer.cardsPlayed.pop()
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
        // 移除出牌人的出牌数据
        dealer.cardsPlayed.pop()
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
        // 移除出牌人的出牌数据
        dealer.cardsPlayed.pop()
        // 摸牌
        currentDrawCard()
        return true;
      }
    } else {
      // 这里可能要采用弹窗形式去阻塞了
      console.log("玩家是否需要杠牌")
      // 移除出牌人的出牌数据
      dealer.cardsPlayed.pop()
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
        currentPlayerIndex.value = realPlayerStore.getPlayerList.findIndex(item => item.id === element.id)
        // 移除出牌人的出牌数据
        dealer.cardsPlayed.pop()
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
        // 移除出牌人的出牌数据
        dealer.cardsPlayed.pop()
        // 移除碰
        element.peng(card);
        currentPlayerIndex.value = realPlayerStore.getPlayerList.findIndex(item => item.id === element.id)
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
  if (!realPlayerStore.getRealPlayer.isMyTurn) {
    return
  }
  const currentPlayer = methods.getCurrentPlayer();
  // 从手牌中移除
  currentPlayer.removeInShouPai(card)
  console.log("玩家打出：" + card)
  currentPlayer.pushPlayedCard(card)
  // 结束回合
  currentPlayer.endRound();
  // 执行动画
  await playDh()
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

async function playDh() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

function getStyle(item: number) {
  if (realPlayerStore.getRealPlayer.notNeedType === getCardType(item)) {
    return {backgroundColor: 'red'}
  }
  if (realPlayerStore.getRealPlayer.notNeedType === getCardType(item)) {
    return {backgroundColor: 'red'}
  }
  return {backgroundColor: ''}
}


</script>


<template>
  <div>
    <a-textarea v-model:value="jsonData"></a-textarea>
    <a-button @click="loadData" type="primary">加载</a-button>
    <Save></Save>
  </div>


  <a-flex justify="space-between" align="center">
    <!--左家-->
    <a-flex style="width: 20%;">
      <a-flex justify="space-between" align="center" :vertical="true">
        <!--碰牌-->
        <a-flex v-for="(item,index) in realPlayerStore.getRealPlayerLeft.pengs" :key="index" style="margin-top: 4px" :vertical="true">
          <CardBackLeftRight v-for="(card,index2) in item.singPengs" :key="index2" :card-number="card"
                             style="margin-bottom: 2px"
                             :card-type="getCardType(card)"
          >
          </CardBackLeftRight>
        </a-flex>
        <!--杠牌-->
        <a-flex v-for="(item,index) in realPlayerStore.getRealPlayerLeft.gangs" :key="index" style="margin-top: 4px" :vertical="true">
          <CardBackLeftRight v-for="(card,index2) in item.singGangs" :key="index2" :card-number="card"
                             style="margin-bottom: 2px"
                             :card-type="getCardType(card)"
          >
          </CardBackLeftRight>
        </a-flex>
        <a-flex justify="space-between" align="center" :vertical="true" style="margin-top: 20px">
          <CardBackLeftRight v-for="(card,index2) in realPlayerStore.getRealPlayerLeft.shoupai" :key="index2" style="margin-top: 2px"
                             :card-number="card"
                             :card-type="getCardType(card)" :is-show-card="isDebugger">
          </CardBackLeftRight>
        </a-flex>
        <!--缺牌-->
        <CardBackLeftRight v-if="realPlayerStore.getRealPlayerLeft && realPlayerStore.getRealPlayerLeft.notNeedType" style="margin-top:20px"
                           :card-type="realPlayerStore.getRealPlayerLeft.notNeedType">
        </CardBackLeftRight>
        <CardBackLeftRight v-if="realPlayerStore.getRealPlayerLeft && realPlayerStore.getRealPlayerLeft.isHupai" style="margin-top:20px"
                           :cardType="getCardType(realPlayerStore.getRealPlayerLeft.hupaiCard)"
                           :cardNumber="realPlayerStore.getRealPlayerLeft.hupaiCard"
                           :isShowCard="!realPlayerStore.getRealPlayerLeft.isSelfWin || isDebugger"
        >
          <template #default>
            胡牌
          </template>
        </CardBackLeftRight>
      </a-flex>
      <a-flex justify="space-between" align="center" :vertical="true">
        <a-flex v-for="item in lodash.chunk(realPlayerStore.getRealPlayerLeft.cardsPlayed,14)" justify="flex-start" align="flex-start"
                wrap="wrap" style="margin: 5px" :vertical="true">
          出：
          <CardBackLeftRight v-for="(card,index) in item" :key="index" :card-number="card"
                             style="margin-top: 2px"
                             :card-type="getCardType(card)"
                             :class="index===realPlayerStore.getRealPlayerLeft.cardsPlayed.length-1?'animate__animated animate__bounce':''"
          >
          </CardBackLeftRight>
        </a-flex>
      </a-flex>
      <a-flex justify="flex-start" align="flex-start" wrap="wrap" style="margin: 5px" v-if="isDebugger"
              :vertical="true">
        听：
        <CardBackLeftRight v-for="(card,index2) in realPlayerStore.getRealPlayerOn.tingCard" :key="index2" :card-number="card"
                           style="margin-top: 2px"
                           :card-type="getCardType(card)"
        >
        </CardBackLeftRight>
      </a-flex>
    </a-flex>
    <a-flex style="width: 60%;" justify="flex-start" align="flex-start" wrap="wrap" :vertical="true">
      <!--对家-->
      <div>
        <a-flex justify="flex-start" align="flex-start" wrap="wrap">
          <NoHoverCard v-if="realPlayerStore.getRealPlayerOn && realPlayerStore.getRealPlayerOn.notNeedType" style="margin-right:20px"
                       :card-type="realPlayerStore.getRealPlayerOn.notNeedType">
          </NoHoverCard>
          <NoHoverCard v-if="realPlayerStore.getRealPlayerOn && realPlayerStore.getRealPlayerOn.isHupai" style="margin-right:20px"
                       :cardType="getCardType(realPlayerStore.getRealPlayerOn.hupaiCard)"
                       :cardNumber="realPlayerStore.getRealPlayerOn.hupaiCard"
                       :isShowCard="!realPlayerStore.getRealPlayerOn.isSelfWin || isDebugger"
          >
            <template #default>
              胡牌
            </template>
          </NoHoverCard>
          <a-flex style="margin-right: 20px">
            <NoHoverCard v-for="(item,index) in realPlayerStore.getRealPlayerOn.shoupai" :key="index" :card-number="item"
                         :card-type="getCardType(item)"
                         :is-show-card="isDebugger"
                         style="margin: 2px"
            >
            </NoHoverCard>
          </a-flex>
          <!--杠牌-->
          <a-flex v-for="(item,index) in realPlayerStore.getRealPlayerOn.gangs" :key="index" style="margin-right: 4px">
            <NoHoverCard v-for="(card,index2) in item.singGangs" :key="index2" :card-number="card"
                         style="margin-left: 2px"
                         :card-type="getCardType(card)"
            >
            </NoHoverCard>
          </a-flex>
          <!--碰牌-->
          <a-flex v-for="(item,index) in realPlayerStore.getRealPlayerOn.pengs" :key="index" style="margin-right: 4px">
            <NoHoverCard v-for="(card,index2) in item.singPengs" :key="index2" :card-number="card"
                         style="margin-left: 2px"
                         :card-type="getCardType(card)"
            >
            </NoHoverCard>
          </a-flex>
        </a-flex>
        <a-flex justify="flex-start" align="flex-start" wrap="wrap" style="margin: 5px">
          出：
          <NoHoverCard v-for="(card,index) in realPlayerStore.getRealPlayerOn.cardsPlayed" :key="index" :card-number="card"
                       style="margin-left: 2px"
                       :card-type="getCardType(card)"
                       :class="index===realPlayerStore.getRealPlayerOn.cardsPlayed.length-1?'animate__animated animate__bounce':''"
          >
          </NoHoverCard>
        </a-flex>
        <a-flex justify="flex-start" align="flex-start" wrap="wrap" style="margin: 5px" v-if="isDebugger">
          听：
          <NoHoverCard v-for="(card,index2) in realPlayerStore.getRealPlayerOn.tingCard" :key="index2" :card-number="card"
                       style="margin-left: 2px"
                       :card-type="getCardType(card)"
          >
          </NoHoverCard>
        </a-flex>
      </div>
      <div style="height: 400px">
        <div>todo 记牌器要包含自己的牌</div>
        <div>剩余牌：{{ realPlayerStore.getGameInformation.getNumberOfCardsRemaining() }}</div>
        <CardCounter></CardCounter>
      </div>
      <!--玩家-->
      <div>
        <a-flex justify="flex-start" align="flex-start" wrap="wrap" style="margin: 5px">
          出：
          <NoHoverCard v-for="(card,index) in realPlayerStore.getRealPlayer.cardsPlayed" :key="index" :card-number="card"
                       style="margin-left: 2px"
                       :card-type="getCardType(card)"
                       :class="index===realPlayerStore.getRealPlayer.cardsPlayed.length-1?'animate__animated animate__bounce':''"
          >
          </NoHoverCard>
        </a-flex>
        <a-flex justify="flex-start" align="flex-start" wrap="wrap" style="margin: 5px">
          听：
          <NoHoverCard v-for="(card,index2) in realPlayerStore.getRealPlayer.tingCard" :key="index2" :card-number="card"
                       style="margin-left: 2px"
                       :card-type="getCardType(card)"
          >
          </NoHoverCard>
        </a-flex>
        <!-- HTML -->
        <a-flex justify="flex-start" align="flex-start" wrap="wrap">
          <!--碰牌-->
          <a-flex v-for="(item,index) in realPlayerStore.getRealPlayer.pengs" :key="index" style="margin-right: 4px">
            <NoHoverCard v-for="(card,index2) in item.singPengs" :key="index2" :card-number="card"
                         style="margin-left: 2px"
                         :card-type="getCardType(card)"
            >
            </NoHoverCard>
          </a-flex>
          <!--杠牌-->
          <a-flex v-for="(item,index) in realPlayerStore.getRealPlayer.gangs" :key="index" style="margin-right: 4px">
            <NoHoverCard v-for="(card,index2) in item.singGangs" :key="index2" :card-number="card"
                         style="margin-left: 2px"
                         :card-type="getCardType(card)"
            >
            </NoHoverCard>
          </a-flex>
          <a-flex style="margin-left: 20px">
            <Card v-for="(item,index) in realPlayerStore.getRealPlayer.shoupai" :key="index" :card-number="item"
                  :card-type="getCardType(item)"
                  :style="getStyle(item)"
                  @click="discardTheCards(item)"
                  style="margin: 2px"
            >
            </Card>
          </a-flex>
          <Card v-if="realPlayerStore.getRealPlayer && realPlayerStore.getRealPlayer.currentCard" style="margin-left:20px"
                :card-number="realPlayerStore.getRealPlayer.currentCard"
                :style="getStyle( realPlayerStore.getRealPlayer.currentCard)"
                :card-type="getCardType(realPlayerStore.getRealPlayer.currentCard)"
                @click="discardTheCards(realPlayerStore.getRealPlayer.currentCard)">
          </Card>
          <NoHoverCard v-if="realPlayerStore.getRealPlayer && realPlayerStore.getRealPlayer.isHupai" style="margin-left:20px"
                       :cardType="getCardType(realPlayerStore.getRealPlayer.hupaiCard)"
                       :cardNumber="realPlayerStore.getRealPlayer.hupaiCard"
                       :isShowCard="true">
            <template #default>
              胡牌
            </template>
          </NoHoverCard>
          <NoHoverCard v-if="realPlayerStore.getRealPlayer && realPlayerStore.getRealPlayer.notNeedType" style="margin-left:20px"
                       :card-type="realPlayerStore.getRealPlayer.notNeedType">
          </NoHoverCard>
        </a-flex>
      </div>
    </a-flex>

    <!-- 右家-->
    <a-flex style="width: 20%;">
      <a-flex justify="flex-start" align="flex-start" wrap="wrap" style="margin: 5px" v-if="isDebugger"
              :vertical="true">
        听：
        <CardBackLeftRight v-for="(card,index2) in realPlayerStore.getRealPlayerOn.tingCard" :key="index2" :card-number="card"
                           style="margin-top: 2px"
                           :card-type="getCardType(card)"
        >
        </CardBackLeftRight>
      </a-flex>
      <a-flex justify="space-between" align="center" :vertical="true">
        <a-flex justify="flex-start" align="flex-start" wrap="wrap" style="margin: 5px" :vertical="true">
          出：
          <CardBackLeftRight v-for="(card,index) in realPlayerStore.getRealPlayerRight.cardsPlayed" :key="index" :card-number="card"
                             style="margin-top: 2px"
                             :card-type="getCardType(card)"
                             :class="index===realPlayerStore.getRealPlayerRight.cardsPlayed.length-1?'animate__animated animate__bounce':''"
          >
          </CardBackLeftRight>
        </a-flex>
      </a-flex>
      <a-flex justify="space-between" align="center" :vertical="true">
        <!--碰牌-->
        <a-flex v-for="(item,index) in realPlayerStore.getRealPlayerRight.pengs" :key="index" style="margin-top: 4px" :vertical="true">
          <CardBackLeftRight v-for="(card,index2) in item.singPengs" :key="index2" :card-number="card"
                             style="margin-bottom: 2px"
                             :card-type="getCardType(card)"
          >
          </CardBackLeftRight>
        </a-flex>
        <!--杠牌-->
        <a-flex v-for="(item,index) in realPlayerStore.getRealPlayerRight.gangs" :key="index" style="margin-top: 4px" :vertical="true">
          <CardBackLeftRight v-for="(card,index2) in item.singGangs" :key="index2" :card-number="card"
                             style="margin-bottom: 2px"
                             :card-type="getCardType(card)"
          >
          </CardBackLeftRight>
        </a-flex>
        <a-flex justify="space-between" align="center" :vertical="true" style="margin-top: 20px">
          <CardBackLeftRight v-for="(card,index2) in realPlayerStore.getRealPlayerRight.shoupai" :key="index2" style="margin-top: 2px"
                             :card-number="card"
                             :card-type="getCardType(card)" :is-show-card="isDebugger">
          </CardBackLeftRight>
        </a-flex>
        <!--缺牌-->
        <CardBackLeftRight v-if="realPlayerStore.getRealPlayerRight && realPlayerStore.getRealPlayerRight.notNeedType" style="margin-top:20px"
                           :card-type="realPlayerStore.getRealPlayerRight.notNeedType">
        </CardBackLeftRight>
        <CardBackLeftRight v-if="realPlayerStore.getRealPlayerRight && realPlayerStore.getRealPlayerRight.isHupai" style="margin-top:20px"
                           :cardType="getCardType(realPlayerStore.getRealPlayerRight.hupaiCard)"
                           :cardNumber="realPlayerStore.getRealPlayerRight.hupaiCard"
                           :isShowCard="!realPlayerStore.getRealPlayerRight.isSelfWin || isDebugger"
        >
          <template #default>
            胡牌
          </template>
        </CardBackLeftRight>
      </a-flex>
    </a-flex>
  </a-flex>


  <div style="margin-bottom: 50px"></div>


</template>

<style scoped>
/* CSS */
.container {
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: center; /* 水平居中 */
  gap: 10px; /* 盒子之间的间距 */
}
</style>