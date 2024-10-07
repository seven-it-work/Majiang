
/**
 * 番类型
 * @author Henry Zhou
 */
export enum FanType {
    YI_TIAO_LONG='YI_TIAO_LONG',//一条龙（手牌中包含筒条万中任意1-9,但是移除1-9后任然能胡牌）
    BAN_BAN_GAO='BAN_BAN_GAO',//板板高（手牌中包含包含重复坊子，例如1，1,2,2,3,3,但是移除后任然能胡牌）
    DA_DUI_ZI='DA_DUI_ZI',//大对子（无需解释）
    GANG='GANG',//杠（无需解释）
    JIA_XIN_WU='JIA_XIN_WU',//夹心五（即胡的牌是5条或5万或5筒，但是是以卡五条类似方式胡的）
    KA_ER_TIAO='KA_ER_TIAO',//卡二条（同上）
    QING_YI_SE='QING_YI_SE',//清一色（无需解释）
    JIN_GOU_DIAO='JIN_GOU_DIAO',//金钩钓（无需解释）
    MEN_QING='MEN_QING',//门清（即未碰或杠任何牌）
    YI_JIU_JIANG_DUI='YI_JIU_JIANG_DUI',//一九将对（牌中无任何1或9）
    XIAO_QI_DUI='XIAO_QI_DUI'//小七对（无需解释）

}
