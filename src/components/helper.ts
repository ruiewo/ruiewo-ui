export type MenuItemType = 'line' | 'divisor';
export type MenuItem = {
    type?: MenuItemType;
    text: string;
    value: string;
    icon?: string;
    onClick?: (e: MouseEvent) => void;
    children?: MenuItem[];
};

type Vertical = 'auto' | 'top' | 'bottom';
type Horizontal = 'auto' | 'left' | 'right';
export type PositionOption = {
    vertical: Vertical;
    horizontal: Horizontal;
};

export const calcPosition = (target: Element, menu: Element, option: PositionOption = { vertical: 'auto', horizontal: 'auto' }) => {
    const targetRect = target.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    const { vertical, horizontal } = option;

    let top = 0;
    let left = 0;

    if (
        vertical === 'top' ||
        (vertical === 'auto' && targetRect.bottom + menuRect.height > window.innerHeight && window.pageYOffset > menuRect.height)
    ) {
        top = targetRect.top + window.pageYOffset - menuRect.height;
    } else {
        top = targetRect.bottom + window.pageYOffset;
    }

    if (horizontal === 'right' || (horizontal === 'auto' && targetRect.left + menuRect.width > window.innerWidth)) {
        left = targetRect.right + window.pageXOffset - menuRect.width;
    } else {
        left = targetRect.left + window.pageXOffset;
    }

    return { top, left };
};

export const calcPositionH = (target: Element, menu: Element, option: PositionOption = { vertical: 'auto', horizontal: 'auto' }) => {
    const targetRect = target.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    const { vertical, horizontal } = option;

    let top = 0;
    let left = 0;

    if (
        vertical === 'top' ||
        (vertical === 'auto' && targetRect.bottom + menuRect.height > window.innerHeight && window.pageYOffset > menuRect.height)
    ) {
        top = targetRect.bottom + window.pageYOffset - menuRect.height;
    } else {
        top = targetRect.top + window.pageYOffset;
    }

    if (horizontal === 'left' || (horizontal === 'auto' && targetRect.left + menuRect.width > window.innerWidth)) {
        left = targetRect.left + window.pageXOffset - menuRect.width;
    } else {
        left = targetRect.right + window.pageXOffset;
    }

    return { top, left };
};

export const calcPositionFromPoint = (e: MouseEvent, menu: Element, option: PositionOption) => {
    const x = e.pageX;
    const y = e.pageY;

    const menuRect = menu.getBoundingClientRect();

    const { vertical, horizontal } = option;

    let top = 0;
    let left = 0;

    if (vertical === 'top' || (vertical === 'auto' && y + menuRect.height > window.innerHeight && window.pageYOffset > menuRect.height)) {
        top = y + window.pageYOffset - menuRect.height;
    } else {
        top = y + window.pageYOffset;
    }

    if (horizontal === 'right' || (horizontal === 'auto' && x + menuRect.width > window.innerWidth)) {
        left = x + window.pageXOffset - menuRect.width;
    } else {
        left = x + window.pageXOffset;
    }

    return { top, left };
};
