// stores/userStore.ts
import { defineStore } from 'pinia';
export const useRealPlayerStore = defineStore('realPlayer', {
    state: () => ({ playerList: [], realPlayerIndex: 0, saveJson: '' }),
    actions: {
        init(realPlayer, playerList, gameInformation) {
            this.realPlayer = realPlayer;
            this.playerList = playerList;
            this.realPlayerIndex = playerList.findIndex(item => item.id === realPlayer.id);
            this.gameInformation = gameInformation;
        },
        doSave() {
            this.playerList.forEach(item => {
                // @ts-ignore
                item.classType = item.constructor.name;
                console.log(item);
            });
            // 转换为json
            this.saveJson = JSON.stringify({
                realPlayer: this.realPlayer?.toJsonObj(),
                playerList: this.playerList.map(o => o.toJsonObj()),
                realPlayerIndex: this.realPlayerIndex,
                gameInformation: this.gameInformation,
            });
        }
    },
    getters: {
        getRealPlayer: (state) => state.realPlayer,
        getPlayerList: (state) => state.playerList,
        getRealPlayerRight: (state) => {
            return state.playerList[(state.realPlayerIndex + 1) % 4];
        },
        getRealPlayerOn: (state) => {
            return state.playerList[(state.realPlayerIndex + 2) % 4];
        },
        getRealPlayerLeft: (state) => {
            return state.playerList[(state.realPlayerIndex + 3) % 4];
        },
        getGameInformation: (state) => {
            return state.gameInformation;
        },
        getSaveJson: (state) => {
            return state.saveJson;
        },
    },
});
