import {Player} from "../objs/Player.ts";
import {Modal} from "ant-design-vue";
import {h, ref} from "vue";
import {getCardTypeStr} from "../util/CardUtils.ts";
import MyCard from "../components/MyCard.vue";
import PlayerView from "../components/PlayerView.vue";

// 自定义函数，用于将 Modal.confirm 包装成一个返回 Promise 的函数
const warningWithPromise = (options: any) => {
    return new Promise((resolve, reject) => {
        Modal.warning({
            ...options,
            onOk: () => {
                console.log("Ok")
                resolve(true);
            },
            onCancel: () => {
                console.log("cancel")
                reject(false)
            }
        });
    });
}

// 自定义函数，用于将 Modal.confirm 包装成一个返回 Promise 的函数
const confirmWithPromise = (options: any) => {
    return new Promise((resolve, reject) => {
        Modal.confirm({
            ...options,
            onOk: () => {
                console.log("Ok")
                resolve(true);
            },
            onCancel: () => {
                console.log("cancel")
                reject(false)
            }
        });
    });
}

export class RealPlayer extends Player {
    isAi = false;
    cardsToBePlayed: number = -1;


    async judgeTheLackOfCards() {
        const {default: PickNotNeedCard} = await import("../components/PickNotNeedCard.vue"); // 动态导入组件
        console.log("你缺什么牌")
        await warningWithPromise({
            title: '选择定缺牌类型',
            content: () => h(PickNotNeedCard, {realPlayer: this}),
            okText: '确定',
            closable: false,
            keyboard: false,
            height: '100%',
        })
        console.log('用户点击了确定');
        console.log(`${this.name}缺${getCardTypeStr(this.notNeedType)}，当前手牌${this.getShouPaiStr()}`)
    }

    async doAction() {
        await super.doAction();
        console.log("等待玩家出牌")
        const isOpen=ref(true)
        await warningWithPromise({
            title: '选择要打出的牌',
            content: () => h(PlayerView, {isOpen: isOpen}),
            open:isOpen.value,
            okText: '确定',
            closable: false,
            keyboard: false,
            wrapClassName: "full-modal",
            width: "100%",
        })
        console.log('用户点击了确定');
        const number = this.removeInShouPai(this.cardsToBePlayed);
        await this.discardOneCard(number);
        this.endRound();
        this.cardsToBePlayed = -1;
        return
    }

    async doPeng(card: number): Promise<boolean> {
        if (await this.doPengHuGang("碰")) {
            return await super.doPeng(card);
        } else {
            return false;
        }
    }

    async doGang(card: number): Promise<boolean> {
        if (await this.doPengHuGang("杠")) {
            return await super.doGang(card);
        } else {
            return false;
        }
    }

    async doHupai(): Promise<boolean> {
        if (await this.doPengHuGang("胡")) {
            return await super.doHupai();
        } else {
            return false;
        }
    }

    async doPengHuGang(msg: string): Promise<boolean> {
        console.log("玩家决策")
        return await confirmWithPromise({
            title: '是否' + msg + "牌？",
            okText: '确定',
            cancelText: '取消',
            closable: false,
            keyboard: false,
        })
    }
}