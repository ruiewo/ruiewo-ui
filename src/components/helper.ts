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

/**
 * 画面左上からの位置を求める。targetの上下に要素が出現するパターン用。
 */
export const calcPosition = (target: Element, menu: Element, option: PositionOption = { vertical: 'auto', horizontal: 'auto' }) => {
    const targetRect = target.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    const { vertical, horizontal } = option;

    let top = 0;
    let left = 0;

    if (
        vertical === 'top' ||
        (vertical === 'auto' && targetRect.bottom + menuRect.height > window.innerHeight && targetRect.top + window.pageYOffset > menuRect.height)
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

/**
 * 画面左上からの位置を求める。targetの左右に要素が出現するパターン用。
 */
export const calcPositionH = (target: Element, menu: Element, option: PositionOption = { vertical: 'auto', horizontal: 'auto' }) => {
    const targetRect = target.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    const { vertical, horizontal } = option;

    let top = 0;
    let left = 0;

    if (
        vertical === 'top' ||
        (vertical === 'auto' && targetRect.bottom + menuRect.height > window.innerHeight && targetRect.top + window.pageYOffset > menuRect.height)
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

/**
 * Inputからの相対位置を求める。ドロップダウン系用。
 */
export const calcPositionForDropDown = (input: Element, menu: Element, option: PositionOption) => {
    const inputRect = input.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    const { vertical, horizontal } = option;

    let top: number | undefined = undefined;
    let left: number | undefined = undefined;
    let bottom: number | undefined = undefined;
    let right: number | undefined = undefined;

    if (
        vertical === 'top' ||
        (vertical === 'auto' && inputRect.bottom + menuRect.height > window.innerHeight && window.pageYOffset > menuRect.height)
    ) {
        bottom = -inputRect.height;
    } else {
        top = inputRect.height;
    }

    if (horizontal === 'right' || (horizontal === 'auto' && inputRect.left + menuRect.width > window.innerWidth)) {
        right = 0;
    } else {
        left = 0;
    }

    return { top, right, bottom, left };
};

export const calcPositionFromPoint = (e: MouseEvent, menu: Element, option: PositionOption) => {
    const x = e.pageX;
    const y = e.pageY;

    const menuRect = menu.getBoundingClientRect();

    const { vertical, horizontal } = option;

    let top = 0;
    let left = 0;

    if (vertical === 'top' || (vertical === 'auto' && y + menuRect.height > window.innerHeight && y + window.pageYOffset > menuRect.height)) {
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

export const createCommonMenuItem = (item: MenuItem, index: number) => {
    if (item.type === 'divisor') {
        return document.createElement('hr');
    }

    const li = document.createElement('li');
    li.setAttribute('data-index', index.toString());

    if (item.icon) {
        li.setAttribute('data-icon', item.icon);
    }

    if (item.onClick) {
        li.addEventListener('mousedown', e => e.preventDefault());
        li.addEventListener('mouseup', e => {
            item.onClick!(e);
        });
    }

    const label = document.createElement('span');
    label.textContent = item.text;
    li.appendChild(label);

    if (item.children && item.children.length > 0) {
        li.classList.add('subMenu');
    }

    return li;
};
