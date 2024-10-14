import { getCardType } from "../util/CardUtils.ts";
import Card from "./Card.vue";
import { useRealPlayerStore } from "../store/RealPlayerStore.ts";
import { ref } from "vue";
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const realPlayerStore = useRealPlayerStore();
const realPlayer = realPlayerStore.getRealPlayer;
const discardIndex = ref(-1);
const isCurrent = ref(false);
/**
 * 出牌
 */
function discardTheCards(card, index) {
    if (index === 9999) {
        isCurrent.value = true;
        discardIndex.value = -1;
    }
    else {
        discardIndex.value = index;
        isCurrent.value = false;
    }
    realPlayer.cardsToBePlayed = card;
}
function getStyle(item, index, current) {
    if (current) {
        if (isCurrent.value) {
            return { backgroundColor: '#111199' };
        }
        else {
            if (realPlayer.notNeedType === getCardType(item)) {
                return { backgroundColor: 'red' };
            }
        }
    }
    else {
        if (discardIndex.value >= 0) {
            if (index === discardIndex.value) {
                return { backgroundColor: '#111199' };
            }
        }
        if (realPlayer?.notNeedType === getCardType(item)) {
            return { backgroundColor: 'red' };
        }
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("container") }, });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.realPlayer?.shoupai))) {
        // @ts-ignore
        [Card, Card,];
        // @ts-ignore
        const __VLS_0 = __VLS_asFunctionalComponent(Card, new Card({ ...{ 'onClick': {} }, key: ((index)), cardNumber: ((item)), cardType: ((__VLS_ctx.getCardType(item))), ...{ style: ((__VLS_ctx.getStyle(item, index, false))) }, }));
        const __VLS_1 = __VLS_0({ ...{ 'onClick': {} }, key: ((index)), cardNumber: ((item)), cardType: ((__VLS_ctx.getCardType(item))), ...{ style: ((__VLS_ctx.getStyle(item, index, false))) }, }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        let __VLS_5;
        const __VLS_6 = {
            onClick: (...[$event]) => {
                __VLS_ctx.discardTheCards(item, index);
            }
        };
        let __VLS_2;
        let __VLS_3;
        const __VLS_4 = __VLS_pickFunctionalComponentCtx(Card, __VLS_1);
    }
    if (__VLS_ctx.realPlayer && __VLS_ctx.realPlayer.currentCard) {
        // @ts-ignore
        [Card, Card,];
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(Card, new Card({ ...{ 'onClick': {} }, ...{ style: ({}) }, cardNumber: ((__VLS_ctx.realPlayer.currentCard)), ...{ style: ((__VLS_ctx.getStyle(__VLS_ctx.realPlayer.currentCard, 9999, true))) }, cardType: ((__VLS_ctx.getCardType(__VLS_ctx.realPlayer.currentCard))), }));
        const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, ...{ style: ({}) }, cardNumber: ((__VLS_ctx.realPlayer.currentCard)), ...{ style: ((__VLS_ctx.getStyle(__VLS_ctx.realPlayer.currentCard, 9999, true))) }, cardType: ((__VLS_ctx.getCardType(__VLS_ctx.realPlayer.currentCard))), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        let __VLS_12;
        const __VLS_13 = {
            onClick: (...[$event]) => {
                if (!((__VLS_ctx.realPlayer && __VLS_ctx.realPlayer.currentCard)))
                    return;
                __VLS_ctx.discardTheCards(__VLS_ctx.realPlayer.currentCard, 9999);
            }
        };
        let __VLS_9;
        let __VLS_10;
        const __VLS_11 = __VLS_pickFunctionalComponentCtx(Card, __VLS_8);
    }
    __VLS_styleScopedClasses['container'];
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
            realPlayer: realPlayer,
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
