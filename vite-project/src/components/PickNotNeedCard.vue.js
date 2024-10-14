import { PaiType } from "../tingPai/PaiType.ts";
import Card from "./Card.vue";
import { useRealPlayerStore } from "../store/RealPlayerStore.ts";
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const realPlayerStore = useRealPlayerStore();
const realPlayer = realPlayerStore.realPlayer;
realPlayer.notNeedType = PaiType.TONG;
function clickCard(cardType) {
    if (realPlayer) {
        realPlayer.notNeedType = cardType;
    }
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("container") }, });
    // @ts-ignore
    [Card, Card,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(Card, new Card({ ...{ 'onClick': {} }, cardType: ((__VLS_ctx.PaiType.TONG)), ...{ style: (({ backgroundColor: __VLS_ctx.realPlayer.notNeedType === __VLS_ctx.PaiType.TONG ? 'red' : '' })) }, }));
    const __VLS_1 = __VLS_0({ ...{ 'onClick': {} }, cardType: ((__VLS_ctx.PaiType.TONG)), ...{ style: (({ backgroundColor: __VLS_ctx.realPlayer.notNeedType === __VLS_ctx.PaiType.TONG ? 'red' : '' })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_5;
    const __VLS_6 = {
        onClick: (...[$event]) => {
            __VLS_ctx.clickCard(__VLS_ctx.PaiType.TONG);
        }
    };
    let __VLS_2;
    let __VLS_3;
    const __VLS_4 = __VLS_pickFunctionalComponentCtx(Card, __VLS_1);
    // @ts-ignore
    [Card, Card,];
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(Card, new Card({ ...{ 'onClick': {} }, cardType: ((__VLS_ctx.PaiType.TIAO)), ...{ style: (({ backgroundColor: __VLS_ctx.realPlayer.notNeedType === __VLS_ctx.PaiType.TIAO ? 'red' : '' })) }, }));
    const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, cardType: ((__VLS_ctx.PaiType.TIAO)), ...{ style: (({ backgroundColor: __VLS_ctx.realPlayer.notNeedType === __VLS_ctx.PaiType.TIAO ? 'red' : '' })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_12;
    const __VLS_13 = {
        onClick: (...[$event]) => {
            __VLS_ctx.clickCard(__VLS_ctx.PaiType.TIAO);
        }
    };
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = __VLS_pickFunctionalComponentCtx(Card, __VLS_8);
    // @ts-ignore
    [Card, Card,];
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(Card, new Card({ ...{ 'onClick': {} }, cardType: ((__VLS_ctx.PaiType.WAN)), ...{ style: (({ backgroundColor: __VLS_ctx.realPlayer.notNeedType === __VLS_ctx.PaiType.WAN ? 'red' : '' })) }, }));
    const __VLS_15 = __VLS_14({ ...{ 'onClick': {} }, cardType: ((__VLS_ctx.PaiType.WAN)), ...{ style: (({ backgroundColor: __VLS_ctx.realPlayer.notNeedType === __VLS_ctx.PaiType.WAN ? 'red' : '' })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_19;
    const __VLS_20 = {
        onClick: (...[$event]) => {
            __VLS_ctx.clickCard(__VLS_ctx.PaiType.WAN);
        }
    };
    let __VLS_16;
    let __VLS_17;
    const __VLS_18 = __VLS_pickFunctionalComponentCtx(Card, __VLS_15);
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
            PaiType: PaiType,
            Card: Card,
            realPlayer: realPlayer,
            clickCard: clickCard,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
;
