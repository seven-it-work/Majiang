const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps({
    cardNumber: Number,
    cardType: PaiType,
    isShowCard: {
        type: Boolean,
        default: true,
    },
});
import { getCardTypeStr, getCardZhStr } from "../util/CardUtils.ts";
import { PaiType } from "../tingPai/PaiType.ts";
function getCardTypeColor() {
    switch (props.cardType) {
        case PaiType.WAN:
            return { color: "#FF6A6A" };
        case PaiType.TONG:
            return { color: "#98FB98" };
        case PaiType.TIAO:
            return { color: "#87CEEB" };
    }
    return {};
}
const __VLS_fnComponent = (await import('vue')).defineComponent({
    props: {
        cardNumber: Number,
        cardType: PaiType,
        isShowCard: {
            type: Boolean,
            default: true,
        },
    },
});
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
    __VLS_styleScopedClasses['box'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box") }, });
    var __VLS_0 = {};
    if (__VLS_ctx.cardNumber && __VLS_ctx.isShowCard) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
        (__VLS_ctx.getCardZhStr(__VLS_ctx.cardNumber));
    }
    if (__VLS_ctx.cardType && __VLS_ctx.isShowCard) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, ...{ style: ((__VLS_ctx.getCardTypeColor())) }, });
        (__VLS_ctx.getCardTypeStr(__VLS_ctx.cardType));
    }
    __VLS_styleScopedClasses['box'];
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
            getCardTypeStr: getCardTypeStr,
            getCardZhStr: getCardZhStr,
            getCardTypeColor: getCardTypeColor,
        };
    },
    props: {
        cardNumber: Number,
        cardType: PaiType,
        isShowCard: {
            type: Boolean,
            default: true,
        },
    },
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        cardNumber: Number,
        cardType: PaiType,
        isShowCard: {
            type: Boolean,
            default: true,
        },
    },
});
export default {};
;
