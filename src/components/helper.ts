export type MenuItemType = 'line' | 'divisor';
export type MenuItem = {
    type?: MenuItemType;
    text: string;
    icon?: string;
    value: string;
    onClick?: (e: MouseEvent) => void;
};

type Vertical = 'auto' | 'top' | 'bottom';
type Horizontal = 'auto' | 'left' | 'right';
export type PositionOption = {
    vertical: Vertical;
    horizontal: Horizontal;
};

export const calcPosition = (target: Element, menu: Element, option: PositionOption) => {
    const inputRect = target.getBoundingClientRect();
    const calendarRect = menu.getBoundingClientRect();

    const { vertical, horizontal } = option;

    let top = 0;
    let left = 0;

    if (
        vertical === 'top' ||
        (vertical === 'auto' && inputRect.bottom + calendarRect.height > window.innerHeight && window.pageYOffset > calendarRect.height)
    ) {
        top = inputRect.top + window.pageYOffset - calendarRect.height;
    } else {
        top = inputRect.bottom + window.pageYOffset;
    }

    if (horizontal === 'right' || (horizontal === 'auto' && inputRect.left + calendarRect.width > window.innerWidth)) {
        left = inputRect.right + window.pageXOffset - calendarRect.width;
    } else {
        left = inputRect.left + window.pageXOffset;
    }

    return { top, left };
};
