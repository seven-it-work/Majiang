import Save from "./Save.vue";
import { getCardType } from "../util/CardUtils.ts";
import NoHoverCard from "./NoHoverCard.vue";
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const prop = defineProps({
    cardNumber: Number,
});
const __VLS_fnComponent = (await import('vue')).defineComponent({
    props: {
        cardNumber: Number,
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.AFlex;
    /** @type { [typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, typeof __VLS_components.AFlex, typeof __VLS_components.aFlex, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore
    [NoHoverCard, NoHoverCard,];
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(NoHoverCard, new NoHoverCard({ cardNumber: ((__VLS_ctx.cardNumber)), cardType: ((__VLS_ctx.getCardType(__VLS_ctx.cardNumber))), }));
    const __VLS_7 = __VLS_6({ cardNumber: ((__VLS_ctx.cardNumber)), cardType: ((__VLS_ctx.getCardType(__VLS_ctx.cardNumber))), }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_nonNullable(__VLS_5.slots).default;
    const __VLS_5 = __VLS_pickFunctionalComponentCtx(__VLS_0, __VLS_2);
    // @ts-ignore
    [Save, Save,];
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(Save, new Save({}));
    const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
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
            Save: Save,
            getCardType: getCardType,
            NoHoverCard: NoHoverCard,
        };
    },
    props: {
        cardNumber: Number,
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        cardNumber: Number,
    },
});
;
