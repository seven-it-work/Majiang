// stores/userStore.ts
import { defineStore } from 'pinia';
import {RealPlayer} from "../ai/RealPlayer.ts";

// 定义状态类型
interface State {
    realPlayer?: RealPlayer;
}


export const useRealPlayerStore = defineStore('realPlayer', {
    state: (): State => ({}),
    actions: {
        init(realPlayer: RealPlayer) {
            this.realPlayer = realPlayer;
        },
    },
    getters: {
        getRealPlayer: (state) => state.realPlayer,
    },
});