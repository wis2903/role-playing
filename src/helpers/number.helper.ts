export const numberToString = (numb: number): string => {
    if (numb < 10) return `0${numb}`;
    return `${numb}`;
};