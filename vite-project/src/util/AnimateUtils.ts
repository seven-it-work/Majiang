// 动画库
// 几倍速

export const beChu = (node: HTMLElement | undefined | null|any, time: number = 1): Promise<any> => {
    return animateCSS(node, 'bounce', time)
}

const animateCSS = (node: HTMLElement | undefined | null, animation: string, time: number, prefix = 'animate__'): Promise<any> => {
    if (!node) {
        return Promise.resolve('node 为空');
    }
    return new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;

        node.classList.add(`${prefix}animated`, animationName);
        node.style.setProperty('--animate-duration', `${time}s`);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }

        node.addEventListener('animationend', handleAnimationEnd, {once: true});
    });
}