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
    saveJson: string;
}


export const useRealPlayerStore = defineStore('realPlayer', {
    state: (): State => ({playerList: [], realPlayerIndex: 0, saveJson: ''}),
    actions: {
        init(realPlayer: RealPlayer, playerList: Player[], gameInformation: GameInformation) {
            this.realPlayer = realPlayer;
            this.playerList = playerList;
            this.realPlayerIndex = playerList.findIndex(item => item.id === realPlayer.id);
            this.gameInformation = gameInformation;
        },
        doSave() {
            this.playerList.forEach(item => {
                // @ts-ignore
                item.classType = (item.constructor as any).name;
                console.log(item)
            })
            // 转换为json
            this.saveJson = JSON.stringify({
                realPlayer: this.realPlayer?.toJsonObj(),
                playerList: this.playerList.map(o=>o.toJsonObj()),
                realPlayerIndex: this.realPlayerIndex,
                gameInformation: this.gameInformation,
            })
        }
    },
    getters: {
        getRealPlayer: (state):RealPlayer => state.realPlayer,
        getPlayerList: (state):Player[] => state.playerList,
        getRealPlayerRight: (state):Player => {
            return state.playerList[(state.realPlayerIndex + 1) % 4]
        },

        getRealPlayerOn: (state):Player => {
            return state.playerList[(state.realPlayerIndex + 2) % 4]
        },
        getRealPlayerLeft: (state):Player => {
            return state.playerList[(state.realPlayerIndex + 3) % 4]
        },
        getGameInformation: (state): GameInformation => {
            return state.gameInformation
        },
        getSaveJson: (state): string => {
            return state.saveJson
        },
    },
});