// stores/userStore.ts
import {defineStore} from 'pinia';
import {RealPlayer} from "../ai/RealPlayer.ts";
import {Player} from "../objs/Player.ts";
import {GameInformation} from "../objs/GameInformation.ts";

// 定义状态类型
interface State {
    realPlayer?: RealPlayer;
    playerList: Player[];
    realPlayerIndex: number;
    gameInformation?: GameInformation;
}


export const useRealPlayerStore = defineStore('realPlayer', {
    state: (): State => ({playerList: [], realPlayerIndex: 0}),
    actions: {
        init(realPlayer: RealPlayer, playerList: Player[],gameInformation:GameInformation) {
            this.realPlayer = realPlayer;
            this.playerList = playerList;
            this.realPlayerIndex = playerList.findIndex(item => item.id === realPlayer.id);
            this.gameInformation = gameInformation;
        },
    },
    getters: {
        getRealPlayer: (state) => state.realPlayer,
        getPlayerList: (state) => state.playerList,
        getRealPlayerRight: (state) => {
            return state.playerList[(state.realPlayerIndex + 1) % 4]
        },

        getRealPlayerOn: (state) => {
            return state.playerList[(state.realPlayerIndex + 2) % 4]
        },
        getRealPlayerLeft: (state) => {
            return state.playerList[(state.realPlayerIndex + 3) % 4]
        },
        getGameInformation: (state):GameInformation => {
            return state.gameInformation
        },
    },
});