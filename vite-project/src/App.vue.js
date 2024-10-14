import ConfigFan from "./fan/ConfigFan.ts";
import { FanType } from "./fan/enumType/FanType.ts";
import GameView from "./components/GameView.vue";
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const configFans = [
    new ConfigFan(FanType.GANG, true, 1),
    new ConfigFan(FanType.DA_DUI_ZI, true, 1),
    new ConfigFan(FanType.QING_YI_SE, true, 2),
    new ConfigFan(FanType.JIA_XIN_WU, true, 1),
    new ConfigFan(FanType.KA_ER_TIAO, true, 1),
    new ConfigFan(FanType.JIN_GOU_DIAO, true, 1),
    new ConfigFan(FanType.MEN_QING, true, 1),
    new ConfigFan(FanType.YI_JIU_JIANG_DUI, true, 1),
    new ConfigFan(FanType.BAN_BAN_GAO, true, 1),
    new ConfigFan(FanType.YI_TIAO_LONG, true, 2),
    new ConfigFan(FanType.XIAO_QI_DUI, true, 2)
];
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
    // @ts-ignore
    [GameView, GameView,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(GameView, new GameView({}));
    const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
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
            GameView: GameView,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
;
