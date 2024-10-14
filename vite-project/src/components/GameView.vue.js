import { getCardType } from "../util/CardUtils.ts";
import Card from "./Card.vue";
import { useRealPlayerStore } from "../store/RealPlayerStore.ts";
import { RealPlayer } from "../ai/RealPlayer.ts";
import { h, ref } from "vue";
import { Rookie } from "../ai/Rookie.ts";
import { GameInformation } from "../objs/GameInformation.ts";
import PickNotNeedCard from "./PickNotNeedCard.vue";
import { Modal } from "ant-design-vue";
import NoHoverCard from "./NoHoverCard.vue";
import CardBackLeftRight from "./CardBackLeftRight.vue";
import lodash from "lodash";
import CardCounter from "./CardCounter.vue";
import Save from "./Save.vue";
import Checkout from "./Checkout.vue";
import PengView from "./PengView.vue";
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
// 初始化游戏信息
var realPlayer1 = new RealPlayer("我叫王老虎");
var rookieOn = new Rookie("玩家3");
var rookieRight = new Rookie("玩家2");
var rookieLeft = new Rookie("玩家4");
const realPlayerStore = useRealPlayerStore();
realPlayerStore.init(realPlayer1, [realPlayer1, rookieRight, rookieOn, rookieLeft,], new GameInformation());
const PickNotNeedCardOpen = ref(false);
const currentPlayerIndex = ref(0);
const isDebugger = ref(true);
const jsonData = ref('');
function loadData() {
    try {
        const parse = JSON.parse(jsonData.value);
        const playerInfo = new RealPlayer().initByJson(parse.realPlayer);
        const gameInformationInit = new GameInformation().initByJson(parse.gameInformation);
        const data = parse.playerList.map((o) => {
            switch (o.classType) {
                case "RealPlayer":
                    return playerInfo;
                case "Rookie":
                    return new Rookie().initByJson(o);
            }
        });
        data.forEach(player => {
            player.getGameInformation = gameInformationInit;
        });
        realPlayerStore.init(playerInfo, data, gameInformationInit);
        // 初始化完成后，进行打牌方法调用
        doPlayCardAction();
    }
    catch (e) {
        console.log(e);
    }
}
const methods = {
    getCurrentPlayer: () => {
        return realPlayerStore.getPlayerList[currentPlayerIndex.value];
    },
    PickNotNeedCardOpenOk: () => {
        // 玩家定缺完成后，才能继续执行
        PickNotNeedCardOpen.value = false;
        doPlayCardAction();
    }
};
// 1、发牌，发完之后进行出牌判断
// 每次拿4张，一共拿3次
for (let i = 0; i < 3; i++) {
    realPlayerStore.getPlayerList.forEach(player => {
        player.gameInformation = realPlayerStore.getGameInformation;
        const numbers = realPlayerStore.getGameInformation.takeCards();
        player.shoupai.push(...numbers);
    });
}
// 再每人一张
realPlayerStore.getPlayerList.forEach(player => {
    player.drawCard(realPlayerStore.getGameInformation.takeOneCard());
    player.endRound();
});
// 第一个人在摸一张
methods.getCurrentPlayer().drawCard(realPlayerStore.getGameInformation.takeOneCard());
// 定缺
realPlayerStore.getPlayerList.forEach(player => {
    if (player.isAi) {
        player.judgeNotNeedCard();
    }
    else {
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
});
// 自定义函数，用于将 Modal.confirm 包装成一个返回 Promise 的函数
const confirmWithPromise = (options) => {
    return new Promise((resolve) => {
        Modal.confirm({
            ...options,
            onOk: () => {
                console.log("Ok");
                resolve(true);
            },
            onCancel: () => {
                console.log("cancel");
                resolve(false);
            }
        });
    });
};
function currentNextMove() {
    console.log("该下一个人了");
    // 判断是否都胡牌了
    if (realPlayerStore.getPlayerList.filter(item => !item.isHupai).length > 0) {
        currentPlayerIndex.value += 1;
        currentPlayerIndex.value = currentPlayerIndex.value % 4;
        if (methods.getCurrentPlayer().isHupai) {
            currentNextMove();
        }
    }
    else {
        // 结束了，都胡牌了
        console.log("结束了，都胡牌了");
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
                    console.log(`${currentPlayer.name}自摸：${currentPlayer.currentCard}`);
                    currentPlayer.currentCard = undefined;
                    currentPlayer.isSelfWin = true;
                    // 改变下一个执行人
                    currentNextMove();
                    return;
                }
            }
            if (currentPlayer.checkIsSelfGang()) {
                // 如果杠牌，杠牌执行策略
                // @ts-ignore
                if (currentPlayer.gangAction(currentPlayer.currentCard)) {
                    currentPlayer.currentCard = undefined;
                    console.log(`${currentPlayer.name}原始杠牌：${currentPlayer.currentCard}`);
                    // 继续执行  摸牌
                    if (!currentDrawCard()) {
                        return;
                    }
                    await doPlayCardAction();
                    return;
                }
            }
            // 否则出牌
        }
        // 出牌
        const number = currentPlayer.playCard();
        console.log(`${currentPlayer.name}打出牌：${number}`);
        currentPlayer.pushPlayedCard(number);
        // 结束回合
        currentPlayer.endRound();
        // 执行动画
        await playDh();
        // 判断
        if (await discardCard(currentPlayer, number)) {
            // 被改变了下一个执行人
            await doPlayCardAction();
            return;
        }
        else {
            // 改变下一个执行人
            currentNextMove();
            // 摸牌
            if (!currentDrawCard()) {
                return;
            }
            await doPlayCardAction();
            return;
        }
    }
    else {
        // 玩家出牌
        // 出牌前判断
        if (currentPlayer.judgeBeforeYouPlayYourCards()) {
            if (currentPlayer.checkIsSelfWin()) {
                // 如果胡牌，胡牌执行策略
                // @ts-ignore
                if (currentPlayer.hupai(currentPlayer.currentCard)) {
                    console.log(`${currentPlayer.name}自摸：${currentPlayer.currentCard}`);
                    // 改变下一个执行人
                    currentNextMove();
                    return;
                }
            }
            if (currentPlayer.checkIsSelfGang()) {
                // 如果杠牌，杠牌执行策略
                // @ts-ignore
                if (currentPlayer.gangAction(currentPlayer.currentCard)) {
                    console.log(`${currentPlayer.name}原始杠牌：${currentPlayer.currentCard}`);
                    // 继续执行  摸牌
                    if (!currentDrawCard()) {
                        return;
                    }
                    await doPlayCardAction();
                    return;
                }
            }
            // 否则出牌
            console.log("玩家出牌");
        }
        return;
    }
}
function currentDrawCard() {
    if (realPlayerStore.getGameInformation.isNoCard()) {
        console.log("牌摸完了，结束游戏");
        // 游戏结束表示，弹窗结算弹窗
        Modal.confirm({
            content: h(Checkout),
            okText: "新的开始",
            cancelText: "退出",
            onOk: () => {
            },
            onCancel: () => {
            }
        });
        return false;
    }
    methods.getCurrentPlayer().drawCard(realPlayerStore.getGameInformation.takeOneCard());
    return true;
}
/**
 * 别人出牌后，进行检测
 */
async function discardCard(dealer, card) {
    const hupai = [];
    const gang = [];
    const peng = [];
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
    });
    // 执行顺序胡牌->杠->碰
    for (let i = 0; i < hupai.length; i++) {
        const hupaiElement = hupai[i];
        if (hupaiElement.isAi) {
            if (hupaiElement.hupai(card)) {
                console.log(`${hupaiElement.name}胡牌：${card}`);
                // 这里是胡牌的下一个人继续执行
                // 移除出牌人的出牌数据
                dealer.cardsPlayed.pop();
                // 改变下一个执行人
                currentNextMove();
                // 摸牌
                if (!currentDrawCard()) {
                    return;
                }
                return true;
            }
        }
        else {
            // 这里可能要采用弹窗形式去阻塞了
            console.log("todo 玩家是否需要胡牌");
            const result = await confirmWithPromise({
                title: '是否需要胡牌',
                content: '这里是胡牌页面',
                closable: false,
                keyboard: false,
                okText: "确定",
                cancelText: "取消",
            });
            if (result) {
                console.log("玩家胡牌");
                // 移除出牌人的出牌数据
                dealer.cardsPlayed.pop();
                hupaiElement.hupai(card);
                // 改变下一个执行人
                currentNextMove();
                // 摸牌
                if (!currentDrawCard()) {
                    return;
                }
                return result;
            }
        }
    }
    for (let i = 0; i < gang.length; i++) {
        const element = gang[i];
        if (element.isAi) {
            if (element.gang(card)) {
                console.log(`${element.name}杠牌：${card}`);
                // 这里杠了继续摸牌执行
                // 移除出牌人的出牌数据
                dealer.cardsPlayed.pop();
                // 摸牌
                if (!currentDrawCard()) {
                    return;
                }
                return true;
            }
        }
        else {
            // 这里可能要采用弹窗形式去阻塞了
            console.log("玩家是否需要杠牌");
            // 移除出牌人的出牌数据
            dealer.cardsPlayed.pop();
            const result = await confirmWithPromise({
                title: '是否需要杠牌',
                content: '这里是杠牌页面',
                closable: false,
                keyboard: false,
                okText: "确定",
                cancelText: "取消",
            });
            if (result) {
                console.log("玩家杠牌");
                element.gang(card);
                // 摸牌
                if (!currentDrawCard()) {
                    return;
                }
                return result;
            }
        }
    }
    for (let i = 0; i < peng.length; i++) {
        const element = peng[i];
        if (element.isAi) {
            if (element.peng(card)) {
                console.log(`${element.name}碰牌：${card}`);
                currentPlayerIndex.value = realPlayerStore.getPlayerList.findIndex(item => item.id === element.id);
                // 移除出牌人的出牌数据
                dealer.cardsPlayed.pop();
                // 这里碰了，继续执行
                return true;
            }
        }
        else {
            // 这里可能要采用弹窗形式去阻塞了
            console.log("todo 玩家是否需要碰牌");
            const result = await confirmWithPromise({
                title: '是否需要碰牌',
                content: h(PengView, { cardNumber: card }),
                closable: false,
                keyboard: false,
                wrapClassName: "full-modal",
                okText: "确定",
                cancelText: "取消",
            });
            if (result) {
                console.log("玩家碰牌");
                // 移除出牌人的出牌数据
                dealer.cardsPlayed.pop();
                // 移除碰
                element.peng(card);
                currentPlayerIndex.value = realPlayerStore.getPlayerList.findIndex(item => item.id === element.id);
                return result;
            }
        }
    }
    return false;
}
confirmWithPromise({
    title: '是否需要碰牌',
    content: h(PengView, { cardNumber: 1 }),
    closable: false,
    keyboard: false,
    wrapClassName: "full-modal",
    okText: "确定",
    cancelText: "取消",
});
/**
 * 玩家出牌
 */
async function discardTheCards(card) {
    if (!realPlayerStore.getRealPlayer.isMyTurn) {
        return;
    }
    const currentPlayer = methods.getCurrentPlayer();
    // 从手牌中移除
    currentPlayer.removeInShouPai(card);
    console.log("玩家打出：" + card);
    currentPlayer.pushPlayedCard(card);
    // 结束回合
    currentPlayer.endRound();
    // 执行动画
    await playDh();
    // 判断
    if (await discardCard(currentPlayer, card)) {
        console.log(`${card}：有人需要`);
        // 被改变了下一个执行人
        await doPlayCardAction();
    }
    else {
        // 改变下一个执行人
        currentNextMove();
        // 摸牌
        if (!currentDrawCard()) {
            return;
        }
        await doPlayCardAction();
    }
}
async function playDh() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 1000);
    });
}
function getStyle(item) {
    if (realPlayerStore.getRealPlayer.notNeedType === getCardType(item)) {
        return { backgroundColor: 'red' };
    }
    if (realPlayerStore.getRealPlayer.notNeedType === getCardType(item)) {
        return { backgroundColor: 'red' };
    }
    return { backgroundColor: '' };
}
const __VLS_fnComponent = (await import('vue')).defineComponent({});
;
let __VLS_functionalComponentProps;
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_localComponents = {
        ...{},
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_components;
    const __VLS_localDirectives = {
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_directives;
    let __VLS_styleScopedClasses;
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ATextarea;
    /** @type { [typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ value: ((__VLS_ctx.jsonData)), }));
    const __VLS_2 = __VLS_1({ value: ((__VLS_ctx.jsonData)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.AButton;
    /** @type { [typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_12;
    const __VLS_13 = {
        onClick: (__VLS_ctx.loadData)
    };
    let __VLS_9;
    let __VLS_10;
    __VLS_nonNullable(__VLS_11.slots).default;
    const __VLS_11 = __VLS_pickFunctionalComponentCtx(__VLS_6, __VLS_8);
    // @ts-ignore
    [Save, Save,];
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(Save, new Save({}));
    const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
    const __VLS_19 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({ justify: ("space-between"), align: ("center"), }));
    const __VLS_21 = __VLS_20({ justify: ("space-between"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    const __VLS_25 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({ ...{ style: ({}) }, }));
    const __VLS_27 = __VLS_26({ ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({ justify: ("space-between"), align: ("center"), vertical: ((true)), }));
    const __VLS_33 = __VLS_32({ justify: ("space-between"), align: ("center"), vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerLeft.pengs))) {
        const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
        /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ key: ((index)), ...{ style: ({}) }, vertical: ((true)), }));
        const __VLS_39 = __VLS_38({ key: ((index)), ...{ style: ({}) }, vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        for (const [card, index2] of __VLS_getVForSourceType((item.singPengs))) {
            // @ts-ignore
            [CardBackLeftRight, CardBackLeftRight,];
            // @ts-ignore
            const __VLS_43 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }));
            const __VLS_44 = __VLS_43({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        }
        __VLS_nonNullable(__VLS_42.slots).default;
        const __VLS_42 = __VLS_pickFunctionalComponentCtx(__VLS_37, __VLS_39);
    }
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerLeft.gangs))) {
        const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
        /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ key: ((index)), ...{ style: ({}) }, vertical: ((true)), }));
        const __VLS_50 = __VLS_49({ key: ((index)), ...{ style: ({}) }, vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        for (const [card, index2] of __VLS_getVForSourceType((item.singGangs))) {
            // @ts-ignore
            [CardBackLeftRight, CardBackLeftRight,];
            // @ts-ignore
            const __VLS_54 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }));
            const __VLS_55 = __VLS_54({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        }
        __VLS_nonNullable(__VLS_53.slots).default;
        const __VLS_53 = __VLS_pickFunctionalComponentCtx(__VLS_48, __VLS_50);
    }
    const __VLS_59 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({ justify: ("space-between"), align: ("center"), vertical: ((true)), ...{ style: ({}) }, }));
    const __VLS_61 = __VLS_60({ justify: ("space-between"), align: ("center"), vertical: ((true)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    for (const [card, index2] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerLeft.shoupai))) {
        // @ts-ignore
        [CardBackLeftRight, CardBackLeftRight,];
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ key: ((index2)), ...{ style: ({}) }, cardNumber: ((card)), cardType: ((__VLS_ctx.getCardType(card))), isShowCard: ((__VLS_ctx.isDebugger)), }));
        const __VLS_66 = __VLS_65({ key: ((index2)), ...{ style: ({}) }, cardNumber: ((card)), cardType: ((__VLS_ctx.getCardType(card))), isShowCard: ((__VLS_ctx.isDebugger)), }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    }
    __VLS_nonNullable(__VLS_64.slots).default;
    const __VLS_64 = __VLS_pickFunctionalComponentCtx(__VLS_59, __VLS_61);
    if (__VLS_ctx.realPlayerStore.getRealPlayerLeft && __VLS_ctx.realPlayerStore.getRealPlayerLeft.notNeedType) {
        // @ts-ignore
        [CardBackLeftRight, CardBackLeftRight,];
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ ...{ style: ({}) }, cardType: ((__VLS_ctx.realPlayerStore.getRealPlayerLeft.notNeedType)), }));
        const __VLS_71 = __VLS_70({ ...{ style: ({}) }, cardType: ((__VLS_ctx.realPlayerStore.getRealPlayerLeft.notNeedType)), }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    }
    if (__VLS_ctx.realPlayerStore.getRealPlayerLeft && __VLS_ctx.realPlayerStore.getRealPlayerLeft.isHupai) {
        // @ts-ignore
        [CardBackLeftRight, CardBackLeftRight,];
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(__VLS_ctx.realPlayerStore.getRealPlayerLeft.hupaiCard))), cardNumber: ((__VLS_ctx.realPlayerStore.getRealPlayerLeft.hupaiCard)), isShowCard: ((!__VLS_ctx.realPlayerStore.getRealPlayerLeft.isSelfWin || __VLS_ctx.isDebugger)), }));
        const __VLS_76 = __VLS_75({ ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(__VLS_ctx.realPlayerStore.getRealPlayerLeft.hupaiCard))), cardNumber: ((__VLS_ctx.realPlayerStore.getRealPlayerLeft.hupaiCard)), isShowCard: ((!__VLS_ctx.realPlayerStore.getRealPlayerLeft.isSelfWin || __VLS_ctx.isDebugger)), }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_79.slots);
        }
        const __VLS_79 = __VLS_pickFunctionalComponentCtx(CardBackLeftRight, __VLS_76);
    }
    __VLS_nonNullable(__VLS_36.slots).default;
    const __VLS_36 = __VLS_pickFunctionalComponentCtx(__VLS_31, __VLS_33);
    const __VLS_80 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({ justify: ("space-between"), align: ("center"), vertical: ((true)), }));
    const __VLS_82 = __VLS_81({ justify: ("space-between"), align: ("center"), vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.lodash.chunk(__VLS_ctx.realPlayerStore.getRealPlayerLeft.cardsPlayed, 14)))) {
        const __VLS_86 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
        /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, vertical: ((true)), }));
        const __VLS_88 = __VLS_87({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_87));
        for (const [card, index] of __VLS_getVForSourceType((item))) {
            // @ts-ignore
            [CardBackLeftRight, CardBackLeftRight,];
            // @ts-ignore
            const __VLS_92 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ key: ((index)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), ...{ class: ((index === __VLS_ctx.realPlayerStore.getRealPlayerLeft.cardsPlayed.length - 1 ? 'animate__animated animate__bounce' : '')) }, }));
            const __VLS_93 = __VLS_92({ key: ((index)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), ...{ class: ((index === __VLS_ctx.realPlayerStore.getRealPlayerLeft.cardsPlayed.length - 1 ? 'animate__animated animate__bounce' : '')) }, }, ...__VLS_functionalComponentArgsRest(__VLS_92));
        }
        __VLS_nonNullable(__VLS_91.slots).default;
        const __VLS_91 = __VLS_pickFunctionalComponentCtx(__VLS_86, __VLS_88);
    }
    __VLS_nonNullable(__VLS_85.slots).default;
    const __VLS_85 = __VLS_pickFunctionalComponentCtx(__VLS_80, __VLS_82);
    if (__VLS_ctx.isDebugger) {
        const __VLS_97 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
        /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, vertical: ((true)), }));
        const __VLS_99 = __VLS_98({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        for (const [card, index2] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerOn.tingCard))) {
            // @ts-ignore
            [CardBackLeftRight, CardBackLeftRight,];
            // @ts-ignore
            const __VLS_103 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }));
            const __VLS_104 = __VLS_103({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        }
        __VLS_nonNullable(__VLS_102.slots).default;
        const __VLS_102 = __VLS_pickFunctionalComponentCtx(__VLS_97, __VLS_99);
    }
    __VLS_nonNullable(__VLS_30.slots).default;
    const __VLS_30 = __VLS_pickFunctionalComponentCtx(__VLS_25, __VLS_27);
    const __VLS_108 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({ ...{ style: ({}) }, justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), vertical: ((true)), }));
    const __VLS_110 = __VLS_109({ ...{ style: ({}) }, justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_114 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), }));
    const __VLS_116 = __VLS_115({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    if (__VLS_ctx.realPlayerStore.getRealPlayerOn && __VLS_ctx.realPlayerStore.getRealPlayerOn.notNeedType) {
        // @ts-ignore
        [NoHoverCard, NoHoverCard,];
        // @ts-ignore
        const __VLS_120 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ ...{ style: ({}) }, cardType: ((__VLS_ctx.realPlayerStore.getRealPlayerOn.notNeedType)), }));
        const __VLS_121 = __VLS_120({ ...{ style: ({}) }, cardType: ((__VLS_ctx.realPlayerStore.getRealPlayerOn.notNeedType)), }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    }
    if (__VLS_ctx.realPlayerStore.getRealPlayerOn && __VLS_ctx.realPlayerStore.getRealPlayerOn.isHupai) {
        // @ts-ignore
        [NoHoverCard, NoHoverCard,];
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(__VLS_ctx.realPlayerStore.getRealPlayerOn.hupaiCard))), cardNumber: ((__VLS_ctx.realPlayerStore.getRealPlayerOn.hupaiCard)), isShowCard: ((!__VLS_ctx.realPlayerStore.getRealPlayerOn.isSelfWin || __VLS_ctx.isDebugger)), }));
        const __VLS_126 = __VLS_125({ ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(__VLS_ctx.realPlayerStore.getRealPlayerOn.hupaiCard))), cardNumber: ((__VLS_ctx.realPlayerStore.getRealPlayerOn.hupaiCard)), isShowCard: ((!__VLS_ctx.realPlayerStore.getRealPlayerOn.isSelfWin || __VLS_ctx.isDebugger)), }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_129.slots);
        }
        const __VLS_129 = __VLS_pickFunctionalComponentCtx(NoHoverCard, __VLS_126);
    }
    const __VLS_130 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({ ...{ style: ({}) }, }));
    const __VLS_132 = __VLS_131({ ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerOn.shoupai))) {
        // @ts-ignore
        [NoHoverCard, NoHoverCard,];
        // @ts-ignore
        const __VLS_136 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ key: ((index)), cardNumber: ((item)), cardType: ((__VLS_ctx.getCardType(item))), isShowCard: ((__VLS_ctx.isDebugger)), ...{ style: ({}) }, }));
        const __VLS_137 = __VLS_136({ key: ((index)), cardNumber: ((item)), cardType: ((__VLS_ctx.getCardType(item))), isShowCard: ((__VLS_ctx.isDebugger)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_136));
    }
    __VLS_nonNullable(__VLS_135.slots).default;
    const __VLS_135 = __VLS_pickFunctionalComponentCtx(__VLS_130, __VLS_132);
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerOn.gangs))) {
        const __VLS_141 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
        /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
        // @ts-ignore
        const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({ key: ((index)), ...{ style: ({}) }, }));
        const __VLS_143 = __VLS_142({ key: ((index)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_142));
        for (const [card, index2] of __VLS_getVForSourceType((item.singGangs))) {
            // @ts-ignore
            [NoHoverCard, NoHoverCard,];
            // @ts-ignore
            const __VLS_147 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }));
            const __VLS_148 = __VLS_147({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }, ...__VLS_functionalComponentArgsRest(__VLS_147));
        }
        __VLS_nonNullable(__VLS_146.slots).default;
        const __VLS_146 = __VLS_pickFunctionalComponentCtx(__VLS_141, __VLS_143);
    }
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerOn.pengs))) {
        const __VLS_152 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
        /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({ key: ((index)), ...{ style: ({}) }, }));
        const __VLS_154 = __VLS_153({ key: ((index)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_153));
        for (const [card, index2] of __VLS_getVForSourceType((item.singPengs))) {
            // @ts-ignore
            [NoHoverCard, NoHoverCard,];
            // @ts-ignore
            const __VLS_158 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }));
            const __VLS_159 = __VLS_158({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }, ...__VLS_functionalComponentArgsRest(__VLS_158));
        }
        __VLS_nonNullable(__VLS_157.slots).default;
        const __VLS_157 = __VLS_pickFunctionalComponentCtx(__VLS_152, __VLS_154);
    }
    __VLS_nonNullable(__VLS_119.slots).default;
    const __VLS_119 = __VLS_pickFunctionalComponentCtx(__VLS_114, __VLS_116);
    const __VLS_163 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, }));
    const __VLS_165 = __VLS_164({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    for (const [card, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerOn.cardsPlayed))) {
        // @ts-ignore
        [NoHoverCard, NoHoverCard,];
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ key: ((index)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), ...{ class: ((index === __VLS_ctx.realPlayerStore.getRealPlayerOn.cardsPlayed.length - 1 ? 'animate__animated animate__bounce' : '')) }, }));
        const __VLS_170 = __VLS_169({ key: ((index)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), ...{ class: ((index === __VLS_ctx.realPlayerStore.getRealPlayerOn.cardsPlayed.length - 1 ? 'animate__animated animate__bounce' : '')) }, }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    }
    __VLS_nonNullable(__VLS_168.slots).default;
    const __VLS_168 = __VLS_pickFunctionalComponentCtx(__VLS_163, __VLS_165);
    if (__VLS_ctx.isDebugger) {
        const __VLS_174 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
        /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
        // @ts-ignore
        const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, }));
        const __VLS_176 = __VLS_175({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_175));
        for (const [card, index2] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerOn.tingCard))) {
            // @ts-ignore
            [NoHoverCard, NoHoverCard,];
            // @ts-ignore
            const __VLS_180 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }));
            const __VLS_181 = __VLS_180({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }, ...__VLS_functionalComponentArgsRest(__VLS_180));
        }
        __VLS_nonNullable(__VLS_179.slots).default;
        const __VLS_179 = __VLS_pickFunctionalComponentCtx(__VLS_174, __VLS_176);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.realPlayerStore.getGameInformation.getNumberOfCardsRemaining());
    // @ts-ignore
    [CardCounter, CardCounter,];
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(CardCounter, new CardCounter({}));
    const __VLS_186 = __VLS_185({}, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_190 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, }));
    const __VLS_192 = __VLS_191({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    for (const [card, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayer.cardsPlayed))) {
        // @ts-ignore
        [NoHoverCard, NoHoverCard,];
        // @ts-ignore
        const __VLS_196 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ key: ((index)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), ...{ class: ((index === __VLS_ctx.realPlayerStore.getRealPlayer.cardsPlayed.length - 1 ? 'animate__animated animate__bounce' : '')) }, }));
        const __VLS_197 = __VLS_196({ key: ((index)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), ...{ class: ((index === __VLS_ctx.realPlayerStore.getRealPlayer.cardsPlayed.length - 1 ? 'animate__animated animate__bounce' : '')) }, }, ...__VLS_functionalComponentArgsRest(__VLS_196));
    }
    __VLS_nonNullable(__VLS_195.slots).default;
    const __VLS_195 = __VLS_pickFunctionalComponentCtx(__VLS_190, __VLS_192);
    const __VLS_201 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, }));
    const __VLS_203 = __VLS_202({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_202));
    for (const [card, index2] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayer.tingCard))) {
        // @ts-ignore
        [NoHoverCard, NoHoverCard,];
        // @ts-ignore
        const __VLS_207 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }));
        const __VLS_208 = __VLS_207({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    }
    __VLS_nonNullable(__VLS_206.slots).default;
    const __VLS_206 = __VLS_pickFunctionalComponentCtx(__VLS_201, __VLS_203);
    const __VLS_212 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), }));
    const __VLS_214 = __VLS_213({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayer.pengs))) {
        const __VLS_218 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
        /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
        // @ts-ignore
        const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({ key: ((index)), ...{ style: ({}) }, }));
        const __VLS_220 = __VLS_219({ key: ((index)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_219));
        for (const [card, index2] of __VLS_getVForSourceType((item.singPengs))) {
            // @ts-ignore
            [NoHoverCard, NoHoverCard,];
            // @ts-ignore
            const __VLS_224 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }));
            const __VLS_225 = __VLS_224({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }, ...__VLS_functionalComponentArgsRest(__VLS_224));
        }
        __VLS_nonNullable(__VLS_223.slots).default;
        const __VLS_223 = __VLS_pickFunctionalComponentCtx(__VLS_218, __VLS_220);
    }
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayer.gangs))) {
        const __VLS_229 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
        /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
        // @ts-ignore
        const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({ key: ((index)), ...{ style: ({}) }, }));
        const __VLS_231 = __VLS_230({ key: ((index)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_230));
        for (const [card, index2] of __VLS_getVForSourceType((item.singGangs))) {
            // @ts-ignore
            [NoHoverCard, NoHoverCard,];
            // @ts-ignore
            const __VLS_235 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }));
            const __VLS_236 = __VLS_235({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }, ...__VLS_functionalComponentArgsRest(__VLS_235));
        }
        __VLS_nonNullable(__VLS_234.slots).default;
        const __VLS_234 = __VLS_pickFunctionalComponentCtx(__VLS_229, __VLS_231);
    }
    const __VLS_240 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({ ...{ style: ({}) }, }));
    const __VLS_242 = __VLS_241({ ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_241));
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayer.shoupai))) {
        // @ts-ignore
        [Card, Card,];
        // @ts-ignore
        const __VLS_246 = __VLS_asFunctionalComponent(Card, new Card({ ...{ 'onClick': {} }, key: ((index)), cardNumber: ((item)), cardType: ((__VLS_ctx.getCardType(item))), ...{ style: ((__VLS_ctx.getStyle(item))) }, ...{ style: ({}) }, }));
        const __VLS_247 = __VLS_246({ ...{ 'onClick': {} }, key: ((index)), cardNumber: ((item)), cardType: ((__VLS_ctx.getCardType(item))), ...{ style: ((__VLS_ctx.getStyle(item))) }, ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_246));
        let __VLS_251;
        const __VLS_252 = {
            onClick: (...[$event]) => {
                __VLS_ctx.discardTheCards(item);
            }
        };
        let __VLS_248;
        let __VLS_249;
        const __VLS_250 = __VLS_pickFunctionalComponentCtx(Card, __VLS_247);
    }
    __VLS_nonNullable(__VLS_245.slots).default;
    const __VLS_245 = __VLS_pickFunctionalComponentCtx(__VLS_240, __VLS_242);
    if (__VLS_ctx.realPlayerStore.getRealPlayer && __VLS_ctx.realPlayerStore.getRealPlayer.currentCard) {
        // @ts-ignore
        [Card, Card,];
        // @ts-ignore
        const __VLS_253 = __VLS_asFunctionalComponent(Card, new Card({ ...{ 'onClick': {} }, ...{ style: ({}) }, cardNumber: ((__VLS_ctx.realPlayerStore.getRealPlayer.currentCard)), ...{ style: ((__VLS_ctx.getStyle(__VLS_ctx.realPlayerStore.getRealPlayer.currentCard))) }, cardType: ((__VLS_ctx.getCardType(__VLS_ctx.realPlayerStore.getRealPlayer.currentCard))), }));
        const __VLS_254 = __VLS_253({ ...{ 'onClick': {} }, ...{ style: ({}) }, cardNumber: ((__VLS_ctx.realPlayerStore.getRealPlayer.currentCard)), ...{ style: ((__VLS_ctx.getStyle(__VLS_ctx.realPlayerStore.getRealPlayer.currentCard))) }, cardType: ((__VLS_ctx.getCardType(__VLS_ctx.realPlayerStore.getRealPlayer.currentCard))), }, ...__VLS_functionalComponentArgsRest(__VLS_253));
        let __VLS_258;
        const __VLS_259 = {
            onClick: (...[$event]) => {
                if (!((__VLS_ctx.realPlayerStore.getRealPlayer && __VLS_ctx.realPlayerStore.getRealPlayer.currentCard)))
                    return;
                __VLS_ctx.discardTheCards(__VLS_ctx.realPlayerStore.getRealPlayer.currentCard);
            }
        };
        let __VLS_255;
        let __VLS_256;
        const __VLS_257 = __VLS_pickFunctionalComponentCtx(Card, __VLS_254);
    }
    if (__VLS_ctx.realPlayerStore.getRealPlayer && __VLS_ctx.realPlayerStore.getRealPlayer.isHupai) {
        // @ts-ignore
        [NoHoverCard, NoHoverCard,];
        // @ts-ignore
        const __VLS_260 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(__VLS_ctx.realPlayerStore.getRealPlayer.hupaiCard))), cardNumber: ((__VLS_ctx.realPlayerStore.getRealPlayer.hupaiCard)), isShowCard: ((true)), }));
        const __VLS_261 = __VLS_260({ ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(__VLS_ctx.realPlayerStore.getRealPlayer.hupaiCard))), cardNumber: ((__VLS_ctx.realPlayerStore.getRealPlayer.hupaiCard)), isShowCard: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_260));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_264.slots);
        }
        const __VLS_264 = __VLS_pickFunctionalComponentCtx(NoHoverCard, __VLS_261);
    }
    if (__VLS_ctx.realPlayerStore.getRealPlayer && __VLS_ctx.realPlayerStore.getRealPlayer.notNeedType) {
        // @ts-ignore
        [NoHoverCard, NoHoverCard,];
        // @ts-ignore
        const __VLS_265 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ ...{ style: ({}) }, cardType: ((__VLS_ctx.realPlayerStore.getRealPlayer.notNeedType)), }));
        const __VLS_266 = __VLS_265({ ...{ style: ({}) }, cardType: ((__VLS_ctx.realPlayerStore.getRealPlayer.notNeedType)), }, ...__VLS_functionalComponentArgsRest(__VLS_265));
    }
    __VLS_nonNullable(__VLS_217.slots).default;
    const __VLS_217 = __VLS_pickFunctionalComponentCtx(__VLS_212, __VLS_214);
    __VLS_nonNullable(__VLS_113.slots).default;
    const __VLS_113 = __VLS_pickFunctionalComponentCtx(__VLS_108, __VLS_110);
    const __VLS_270 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({ ...{ style: ({}) }, }));
    const __VLS_272 = __VLS_271({ ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_271));
    if (__VLS_ctx.isDebugger) {
        const __VLS_276 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
        /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
        // @ts-ignore
        const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, vertical: ((true)), }));
        const __VLS_278 = __VLS_277({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_277));
        for (const [card, index2] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerOn.tingCard))) {
            // @ts-ignore
            [CardBackLeftRight, CardBackLeftRight,];
            // @ts-ignore
            const __VLS_282 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }));
            const __VLS_283 = __VLS_282({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }, ...__VLS_functionalComponentArgsRest(__VLS_282));
        }
        __VLS_nonNullable(__VLS_281.slots).default;
        const __VLS_281 = __VLS_pickFunctionalComponentCtx(__VLS_276, __VLS_278);
    }
    const __VLS_287 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_288 = __VLS_asFunctionalComponent(__VLS_287, new __VLS_287({ justify: ("space-between"), align: ("center"), vertical: ((true)), }));
    const __VLS_289 = __VLS_288({ justify: ("space-between"), align: ("center"), vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_288));
    const __VLS_293 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_294 = __VLS_asFunctionalComponent(__VLS_293, new __VLS_293({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, vertical: ((true)), }));
    const __VLS_295 = __VLS_294({ justify: ("flex-start"), align: ("flex-start"), wrap: ("wrap"), ...{ style: ({}) }, vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_294));
    for (const [card, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerRight.cardsPlayed))) {
        // @ts-ignore
        [CardBackLeftRight, CardBackLeftRight,];
        // @ts-ignore
        const __VLS_299 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ key: ((index)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), ...{ class: ((index === __VLS_ctx.realPlayerStore.getRealPlayerRight.cardsPlayed.length - 1 ? 'animate__animated animate__bounce' : '')) }, }));
        const __VLS_300 = __VLS_299({ key: ((index)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), ...{ class: ((index === __VLS_ctx.realPlayerStore.getRealPlayerRight.cardsPlayed.length - 1 ? 'animate__animated animate__bounce' : '')) }, }, ...__VLS_functionalComponentArgsRest(__VLS_299));
    }
    __VLS_nonNullable(__VLS_298.slots).default;
    const __VLS_298 = __VLS_pickFunctionalComponentCtx(__VLS_293, __VLS_295);
    __VLS_nonNullable(__VLS_292.slots).default;
    const __VLS_292 = __VLS_pickFunctionalComponentCtx(__VLS_287, __VLS_289);
    const __VLS_304 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({ justify: ("space-between"), align: ("center"), vertical: ((true)), }));
    const __VLS_306 = __VLS_305({ justify: ("space-between"), align: ("center"), vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_305));
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerRight.pengs))) {
        const __VLS_310 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
        /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
        // @ts-ignore
        const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({ key: ((index)), ...{ style: ({}) }, vertical: ((true)), }));
        const __VLS_312 = __VLS_311({ key: ((index)), ...{ style: ({}) }, vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_311));
        for (const [card, index2] of __VLS_getVForSourceType((item.singPengs))) {
            // @ts-ignore
            [CardBackLeftRight, CardBackLeftRight,];
            // @ts-ignore
            const __VLS_316 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }));
            const __VLS_317 = __VLS_316({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }, ...__VLS_functionalComponentArgsRest(__VLS_316));
        }
        __VLS_nonNullable(__VLS_315.slots).default;
        const __VLS_315 = __VLS_pickFunctionalComponentCtx(__VLS_310, __VLS_312);
    }
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerRight.gangs))) {
        const __VLS_321 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
        /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
        // @ts-ignore
        const __VLS_322 = __VLS_asFunctionalComponent(__VLS_321, new __VLS_321({ key: ((index)), ...{ style: ({}) }, vertical: ((true)), }));
        const __VLS_323 = __VLS_322({ key: ((index)), ...{ style: ({}) }, vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_322));
        for (const [card, index2] of __VLS_getVForSourceType((item.singGangs))) {
            // @ts-ignore
            [CardBackLeftRight, CardBackLeftRight,];
            // @ts-ignore
            const __VLS_327 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }));
            const __VLS_328 = __VLS_327({ key: ((index2)), cardNumber: ((card)), ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(card))), }, ...__VLS_functionalComponentArgsRest(__VLS_327));
        }
        __VLS_nonNullable(__VLS_326.slots).default;
        const __VLS_326 = __VLS_pickFunctionalComponentCtx(__VLS_321, __VLS_323);
    }
    const __VLS_332 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({ justify: ("space-between"), align: ("center"), vertical: ((true)), ...{ style: ({}) }, }));
    const __VLS_334 = __VLS_333({ justify: ("space-between"), align: ("center"), vertical: ((true)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_333));
    for (const [card, index2] of __VLS_getVForSourceType((__VLS_ctx.realPlayerStore.getRealPlayerRight.shoupai))) {
        // @ts-ignore
        [CardBackLeftRight, CardBackLeftRight,];
        // @ts-ignore
        const __VLS_338 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ key: ((index2)), ...{ style: ({}) }, cardNumber: ((card)), cardType: ((__VLS_ctx.getCardType(card))), isShowCard: ((__VLS_ctx.isDebugger)), }));
        const __VLS_339 = __VLS_338({ key: ((index2)), ...{ style: ({}) }, cardNumber: ((card)), cardType: ((__VLS_ctx.getCardType(card))), isShowCard: ((__VLS_ctx.isDebugger)), }, ...__VLS_functionalComponentArgsRest(__VLS_338));
    }
    __VLS_nonNullable(__VLS_337.slots).default;
    const __VLS_337 = __VLS_pickFunctionalComponentCtx(__VLS_332, __VLS_334);
    if (__VLS_ctx.realPlayerStore.getRealPlayerRight && __VLS_ctx.realPlayerStore.getRealPlayerRight.notNeedType) {
        // @ts-ignore
        [CardBackLeftRight, CardBackLeftRight,];
        // @ts-ignore
        const __VLS_343 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ ...{ style: ({}) }, cardType: ((__VLS_ctx.realPlayerStore.getRealPlayerRight.notNeedType)), }));
        const __VLS_344 = __VLS_343({ ...{ style: ({}) }, cardType: ((__VLS_ctx.realPlayerStore.getRealPlayerRight.notNeedType)), }, ...__VLS_functionalComponentArgsRest(__VLS_343));
    }
    if (__VLS_ctx.realPlayerStore.getRealPlayerRight && __VLS_ctx.realPlayerStore.getRealPlayerRight.isHupai) {
        // @ts-ignore
        [CardBackLeftRight, CardBackLeftRight,];
        // @ts-ignore
        const __VLS_348 = __VLS_asFunctionalComponent(CardBackLeftRight, new CardBackLeftRight({ ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(__VLS_ctx.realPlayerStore.getRealPlayerRight.hupaiCard))), cardNumber: ((__VLS_ctx.realPlayerStore.getRealPlayerRight.hupaiCard)), isShowCard: ((!__VLS_ctx.realPlayerStore.getRealPlayerRight.isSelfWin || __VLS_ctx.isDebugger)), }));
        const __VLS_349 = __VLS_348({ ...{ style: ({}) }, cardType: ((__VLS_ctx.getCardType(__VLS_ctx.realPlayerStore.getRealPlayerRight.hupaiCard))), cardNumber: ((__VLS_ctx.realPlayerStore.getRealPlayerRight.hupaiCard)), isShowCard: ((!__VLS_ctx.realPlayerStore.getRealPlayerRight.isSelfWin || __VLS_ctx.isDebugger)), }, ...__VLS_functionalComponentArgsRest(__VLS_348));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_352.slots);
        }
        const __VLS_352 = __VLS_pickFunctionalComponentCtx(CardBackLeftRight, __VLS_349);
    }
    __VLS_nonNullable(__VLS_309.slots).default;
    const __VLS_309 = __VLS_pickFunctionalComponentCtx(__VLS_304, __VLS_306);
    __VLS_nonNullable(__VLS_275.slots).default;
    const __VLS_275 = __VLS_pickFunctionalComponentCtx(__VLS_270, __VLS_272);
    __VLS_nonNullable(__VLS_24.slots).default;
    const __VLS_24 = __VLS_pickFunctionalComponentCtx(__VLS_19, __VLS_21);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {};
    var $refs;
    return {
        slots: __VLS_slots,
        refs: $refs,
        attrs: {},
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getCardType: getCardType,
            Card: Card,
            NoHoverCard: NoHoverCard,
            CardBackLeftRight: CardBackLeftRight,
            lodash: lodash,
            CardCounter: CardCounter,
            Save: Save,
            realPlayerStore: realPlayerStore,
            isDebugger: isDebugger,
            jsonData: jsonData,
            loadData: loadData,
            discardTheCards: discardTheCards,
            getStyle: getStyle,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
;
