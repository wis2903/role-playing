export const isDescendant = function (parent: HTMLElement, child: HTMLElement): boolean {
    let node = child.parentNode;
    while (node) {
        if (node === parent) return true;
        node = node.parentNode;
    }

    return false;
};

const pow = Math.pow;

// The easing function that makes the scroll decelerate over time
const easeOutQuart = (x: number): number => {
    return 1 - pow(1 - x, 4);
};

export const animateScroll = ({ targetPosition, initialPosition, duration }: { targetPosition: number, initialPosition: number, duration: number }): void => {
    let start: number;
    let position: number;
    let animationFrame: number;

    const requestAnimationFrame = window.requestAnimationFrame;
    const cancelAnimationFrame = window.cancelAnimationFrame;

    // maximum amount of pixels we can scroll
    const maxAvailableScroll =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

    const amountOfPixelsToScroll = initialPosition - targetPosition;

    const step = (timestamp: number): void => {
        if (start === undefined) {
            start = timestamp;
        }

        const elapsed = timestamp - start;

        // this just gives us a number between 0 (start) and 1 (end)
        const relativeProgress = elapsed / duration;

        // ease out that number
        const easedProgress = easeOutQuart(relativeProgress);

        // calculate new position for every thick of the requesAnimationFrame
        position =
            initialPosition - amountOfPixelsToScroll * Math.min(easedProgress, 1);


        // set the scrollbar position
        window.scrollTo(0, position);

        // Stop when max scroll is reached
        if (
            initialPosition !== maxAvailableScroll &&
            window.scrollY === maxAvailableScroll
        ) {
            cancelAnimationFrame(animationFrame);
            return;
        }

        // repeat until the end is reached
        if (elapsed < duration) {
            animationFrame = requestAnimationFrame(step);
        }

    };

    animationFrame = requestAnimationFrame(step);
};

export const animateScrollAdvance = ({ element, targetPositionX, targetPositionY, duration }: { element: HTMLDivElement, targetPositionX: number, targetPositionY: number, duration: number }): void => {
    let start: number;
    let positionX: number;
    let positionY: number;
    let animationFrame: number;

    const initialPositionX = element.scrollLeft;
    const initialPositionY = element.scrollTop;

    const requestAnimationFrame = window.requestAnimationFrame;
    const cancelAnimationFrame = window.cancelAnimationFrame;

    // maximum amount of pixels we can scroll
    const maxAvailableScrollY = element.scrollHeight - element.clientHeight;
    const maxAvailableScrollX = element.scrollWidth - element.clientWidth;
    const amountOfPixelsToScrollY = initialPositionY - targetPositionY;
    const amountOfPixelsToScrollX = initialPositionX - targetPositionX;

    const step = (timestamp: number): void => {
        if (start === undefined) {
            start = timestamp;
        }

        const elapsed = timestamp - start;

        // this just gives us a number between 0 (start) and 1 (end)
        const relativeProgress = elapsed / duration;

        // ease out that number
        const easedProgress = easeOutQuart(relativeProgress);

        // calculate new position for every thick of the requesAnimationFrame
        positionX =
            initialPositionX - amountOfPixelsToScrollX * Math.min(easedProgress, 1);
        positionY =
            initialPositionY - amountOfPixelsToScrollY * Math.min(easedProgress, 1);


        // set the scrollbar position
        element.scrollTo(positionX, positionY);

        // Stop when max scroll is reached
        if ((
            initialPositionY !== maxAvailableScrollY &&
            element.scrollTop === maxAvailableScrollY
        ) || (
                initialPositionX !== maxAvailableScrollX &&
                element.scrollLeft === maxAvailableScrollX
            )
        ) {
            cancelAnimationFrame(animationFrame);
            return;
        }

        // repeat until the end is reached
        if (elapsed < duration) {
            animationFrame = requestAnimationFrame(step);
        }

    };

    animationFrame = requestAnimationFrame(step);
};