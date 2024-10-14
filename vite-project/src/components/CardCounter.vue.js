import NoHoverCard from "./NoHoverCard.vue";
import { tiao, tong, wan } from "../tingPai/Tingpai.ts";
import { getCardType } from "../util/CardUtils.ts";
import { useRealPlayerStore } from "../store/RealPlayerStore.ts";
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const realPlayerStore = useRealPlayerStore();
// @ts-ignore
const playerList = realPlayerStore.getPlayerList;
function getHavePlayedCard(card) {
    // 获取所有人的出牌区
    const allPlayedCard = [];
    playerList.forEach(p => {
        allPlayedCard.push(...p.cardsPlayed);
    });
    // 碰、杠收集
    playerList.forEach(p => {
        allPlayedCard.push(...p.gangs.flatMap(temp => temp.singGangs));
        allPlayedCard.push(...p.pengs.flatMap(temp => temp.singPengs));
    });
    const count = new Map();
    for (let i = 0; i < allPlayedCard.length; i++) {
        count.set(allPlayedCard[i], (count.get(allPlayedCard[i]) || 0) + 1);
    }
    return count.get(card) || 0;
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ vertical: ((true)), }));
    const __VLS_2 = __VLS_1({ vertical: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    for (const [card] of __VLS_getVForSourceType((__VLS_ctx.tiao))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((card)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        (__VLS_ctx.getHavePlayedCard(card));
        // @ts-ignore
        [NoHoverCard, NoHoverCard,];
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ cardType: ((__VLS_ctx.getCardType(card))), cardNumber: ((card)), }));
        const __VLS_13 = __VLS_12({ cardType: ((__VLS_ctx.getCardType(card))), cardNumber: ((card)), }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    }
    __VLS_nonNullable(__VLS_11.slots).default;
    const __VLS_11 = __VLS_pickFunctionalComponentCtx(__VLS_6, __VLS_8);
    const __VLS_17 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({}));
    const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
    for (const [card] of __VLS_getVForSourceType((__VLS_ctx.tong))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((card)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        (__VLS_ctx.getHavePlayedCard(card));
        // @ts-ignore
        [NoHoverCard, NoHoverCard,];
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ cardType: ((__VLS_ctx.getCardType(card))), cardNumber: ((card)), }));
        const __VLS_24 = __VLS_23({ cardType: ((__VLS_ctx.getCardType(card))), cardNumber: ((card)), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    }
    __VLS_nonNullable(__VLS_22.slots).default;
    const __VLS_22 = __VLS_pickFunctionalComponentCtx(__VLS_17, __VLS_19);
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
    for (const [card] of __VLS_getVForSourceType((__VLS_ctx.wan))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((card)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        (__VLS_ctx.getHavePlayedCard(card));
        // @ts-ignore
        [NoHoverCard, NoHoverCard,];
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ cardType: ((__VLS_ctx.getCardType(card))), cardNumber: ((card)), }));
        const __VLS_35 = __VLS_34({ cardType: ((__VLS_ctx.getCardType(card))), cardNumber: ((card)), }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    }
    __VLS_nonNullable(__VLS_33.slots).default;
    const __VLS_33 = __VLS_pickFunctionalComponentCtx(__VLS_28, __VLS_30);
    __VLS_nonNullable(__VLS_5.slots).default;
    const __VLS_5 = __VLS_pickFunctionalComponentCtx(__VLS_0, __VLS_2);
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
            NoHoverCard: NoHoverCard,
            tiao: tiao,
            tong: tong,
            wan: wan,
            getCardType: getCardType,
            getHavePlayedCard: getHavePlayedCard,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
;
