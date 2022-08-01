import { escapedRegex, isNullOrWhiteSpace, triggerEvent } from '../../utility/utility';
import { MenuItem, PositionOption } from '../helper';
import { MenuPanel } from '../menuPanel/menuPanel';

const css = `
:host{--color: var(--foreground-color);--color-hover: #eee;--placeholder: dimgray;--arrow-color: var(--foreground-color);--background: transparent;--background-focus: var(--active-background-color);--height: 3rem;--fontSize: 1.5rem;--bottomBorder: 0.3rem solid var(--foreground-color);--bottomBorder-focus: var(--theme-color);width:12rem;display:inline-block}*{padding:0;margin:0;box-sizing:border-box;font-size:var(--fontSize)}div{display:inline-block;position:relative;width:inherit;height:var(--height);background-color:rgba(0,0,0,0);cursor:pointer}div::before{position:absolute;content:"▼";color:var(--arrow-color);right:1rem;line-height:var(--height)}div.active::before{transform:rotateX(180deg)}input{display:inline-block;width:100%;height:100%;line-height:var(--height);padding:.1rem .5rem;color:var(--color);text-align:left;background-color:var(--background);border:none;border-bottom:var(--bottomBorder);outline:none;-webkit-user-select:none;-moz-user-select:none;user-select:none;font-family:inherit}input:focus{background-color:var(--background-focus);border-bottom-color:var(--bottomBorder-focus)}input:-moz-read-only{cursor:pointer}input:read-only{cursor:pointer}input::-moz-placeholder{color:var(--placeholder)}input::placeholder{color:var(--placeholder)}
`;
const html = `
<div><input type="text" placeholder="SELECT" spellcheck="false"></div>
`;

const template = `<style>${css}</style>${html}`;

let currentMenu: TreeSelect | null = null;

export type TreeSelectOption = {
    valueKey: string;
    textKey: string;
    placeholder: string;
    useBlank: boolean;
    useInput: boolean;
    onSelect: (item: MenuItem) => void;
};
const defaultOption = {
    valueKey: 'value',
    textKey: 'text',
    placeholder: '選択/入力して下さい',
    useBlank: false,
    useInput: false,
    onSelect: () => {},
};

type GetValuesOption = {
    onlyValue: boolean;
    onlyBottomLayer: boolean;
};

export class TreeSelect extends HTMLElement {
    private self: TreeSelect;
    private root: ShadowRoot;
    private host: HTMLElement;
    private wrapper: HTMLElement;
    public input: HTMLInputElement; // input is public for usability.
    private menu: MenuPanel;
    private items: MenuItem[] = [];
    private option: TreeSelectOption;

    private position: PositionOption = {
        vertical: 'auto',
        horizontal: 'auto',
    };

    constructor(items: any[], userOption?: Partial<TreeSelectOption>) {
        super();
        this.self = this;
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = template;

        this.host = this.root.host as HTMLElement;
        this.wrapper = this.root.querySelector('div')!;
        this.input = this.root.querySelector('input')!;

        this.option = Object.assign({}, defaultOption, userOption);
        this.items = this.convert(items);
        this.input.readOnly = this.option.useInput != true;

        if (!userOption?.placeholder) {
            this.option.placeholder = this.option.useInput ? '選択/入力して下さい' : '選択して下さい';
        }
        this.input.placeholder = this.option.placeholder!;

        this.menu = new MenuPanel('treeSelect');
        this.wrapper.appendChild(this.menu);

        this.menu.onClick = item => {
            if (item.children != null) {
                this.close(); // 最下層以外のクリックは無視する。
                return;
            }

            this.input.value = item.text;
            this.input.dataset.value = item.value;

            // functionによる代入ではinputの変更をoninput/onchangeで補足できないため、能動的に発火する。
            triggerEvent('change', this.input);

            this.option.onSelect(item);

            this.close();
        };

        this.wrapper.onmouseup = e => {
            const target = e.target as HTMLElement;
            if (target.nodeName === 'INPUT') {
                target.focus();
                this.show();
                // if (this.option.useInput) {
                //     this.menu.filter(this.input.value);
                // }
                return;
            }

            // this.close();
        };

        this.input.oninput = () => {
            listWorker.filterSelectPanelItem(this.input, this.menu.ul);
        };

        this.input.onkeydown = e => {
            const keyCode = e.code;

            switch (keyCode) {
                case 'Enter':
                    this.menu.select();
                    break;
                case 'ArrowDown':
                    this.menu.selectNext();
                    break;
                case 'ArrowUp':
                    this.menu.selectPrev();
                    break;
                default:
                    break;
            }
        };

        this.menu.ul.onmouseup = e => {
            const target = e.target as HTMLElement;

            if (target.classList.contains('expander')) {
                const selectedItem = target.closest<HTMLElement>('.treeSelect')!;
                selectedItem.classList.toggle('closed');
                return;
            }

            if (target.classList.contains('checkbox') || target.classList.contains('label')) {
                const currentItem = target.closest<HTMLElement>('.treeSelect')!;
                const childItems = currentItem.querySelectorAll<HTMLElement>('.treeSelect');
                if (currentItem.classList.contains('checked')) {
                    listWorker.uncheck(currentItem);
                    childItems.forEach(listWorker.uncheck);
                } else {
                    listWorker.check(currentItem);
                    childItems.forEach(listWorker.check);
                }
                listWorker.checkParentRecursively(currentItem);
                return;
            }
        };
    }

    show() {
        closeMenuPanel();

        this.menu.show(this.items);
        currentMenu = this.self;

        this.wrapper.classList.add('active');

        this.updatePosition();
    }

    updatePosition() {
        const { top, right, bottom, left } = calcPosition(this.input, this.menu, this.position);
        this.menu.updatePosition({ top, right, bottom, left });
    }
    resetPlaceholder() {
        const selectedItems = this.menu.ul.querySelectorAll('.checked.bottomLayer');
        this.input.placeholder =
            selectedItems.length === 0
                ? this.input.dataset.placeholder!
                : selectedItems.length === 1
                ? selectedItems[0].textContent!
                : `${selectedItems.length}件選択中`;
    }

    close() {
        this.menu.close();
        this.resetPlaceholder();
        this.wrapper.classList.remove('active');
        currentMenu = null;
    }

    changeItems(items: any[]) {
        this.items = this.convert(items);
        this.show();
    }

    convert(items: any[]): MenuItem[] {
        const menuItems = items.map(x => {
            if (x.type === 'divisor') {
                return { text: '', value: '', type: 'divisor' };
            }

            const text = isNullOrWhiteSpace(this.option.textKey) ? (x as string) : (x[this.option.textKey!] as string);
            const value = isNullOrWhiteSpace(this.option.valueKey) ? (x as string) : (x[this.option.valueKey!] as string);
            if (x.children != null) {
                const children = this.convert(x.children);

                return { text, value, children };
            } else {
                return { text, value };
            }
        });

        if (this.option.useBlank) {
            menuItems.unshift({ text: '', value: '' });
        }

        return menuItems as MenuItem[];
    }

    getValue(userOption: Partial<GetValuesOption> | null) {
        const defaultOption: GetValuesOption = {
            onlyValue: true,
            onlyBottomLayer: true,
        };

        const option = { ...defaultOption, ...userOption };

        function getCheckItemRecursively(
            items: MenuItem[],
            listItems: NodeListOf<HTMLElement>,
            option: Partial<GetValuesOption>,
            checkedItems: MenuItem[]
        ) {
            listItems.forEach((listItem, index) => {
                const item = items[index];
                if (option.onlyBottomLayer) {
                    if (listItem.classList.contains('bottomLayer')) {
                        if (!listItem.classList.contains('checked')) {
                            checkedItems.push(item);
                        }
                    }
                } else {
                    if (!listItem.classList.contains('checked')) {
                        checkedItems.push(item);
                    }
                }

                if (item.children && item.children.length > 0) {
                    getCheckItemRecursively(item.children, listItem.querySelectorAll<HTMLElement>(':scope > .treeSelect'), option, checkedItems);
                }
            });
        }

        const listItems = this.menu.ul.querySelectorAll<HTMLElement>(':scope > .treeSelect');
        const checkedItems: MenuItem[] = [];

        getCheckItemRecursively(this.items, listItems, option, checkedItems);

        if (option.onlyValue) {
            return checkedItems.map(x => x.value);
        }

        return checkedItems;
    }

    setValue(values: string[]) {
        function checkItemRecursively(items: MenuItem[], listItems: NodeListOf<HTMLElement>) {
            items.forEach((item, index) => {
                const listItem = listItems.item(index);
                if (values.includes(item.value)) {
                    listWorker.check(listItem);
                    listWorker.open(listItem);
                } else {
                    listWorker.uncheck(listItem);
                    listWorker.close(listItem);
                }

                if (item.children && item.children.length > 0) {
                    checkItemRecursively(item.children, listItem.querySelectorAll<HTMLElement>(':scope > .treeSelect'));
                }
            });
        }

        const listItems = this.menu.ul.querySelectorAll<HTMLElement>(':scope > .treeSelect');
        checkItemRecursively(this.items, listItems);

        const checkedItems = this.menu.ul.querySelectorAll<HTMLElement>('.checked');
        checkedItems.forEach(item => {
            // Only treat towards the upper layer
            listWorker.openParentListRecursively(item);
            listWorker.checkParentRecursively(item);
        });

        this.resetPlaceholder();

        // functionによる代入ではinputの変更をoninput/onchangeで補足できないため、能動的に発火する。
        triggerEvent('change', this.input);
    }
}

const listWorker = (() => {
    function checkParentRecursively(item: HTMLElement) {
        const parentItem = (item.parentNode as HTMLElement).closest<HTMLElement>('.treeSelect:not(.wrapper)');
        if (!parentItem) {
            return;
        }

        if (item.classList.contains('halfChecked')) {
            if (parentItem.classList.contains('halfChecked')) {
                // already half checked. cause no affect.
                return;
            } else {
                listWorker.halfCheck(parentItem);
            }
        } else if (item.classList.contains('checked')) {
            const notCheckedItem = Array.prototype.some.call(item.parentNode!.children, sibling => sibling.matches('.treeSelect:not(.checked)'));
            if (notCheckedItem) {
                listWorker.halfCheck(parentItem);
            } else {
                listWorker.check(parentItem);
            }
        } else {
            const checkedItem = Array.prototype.some.call(item.parentNode!.children, sibling =>
                sibling.matches('.treeSelect.checked, .treeSelect.halfChecked')
            );
            if (checkedItem) {
                listWorker.halfCheck(parentItem);
            } else {
                listWorker.uncheck(parentItem);
            }
        }
        checkParentRecursively(parentItem);
    }

    function openParentListRecursively(node: HTMLElement) {
        if ((node.parentNode as HTMLElement).classList.contains('wrapper')) {
            return;
        }

        const parentItem = node.parentNode!.parentNode as HTMLElement | null;
        if (!parentItem || parentItem.nodeName === '#document-fragment' || !parentItem.classList.contains('treeSelect')) {
            return;
        }

        if (!parentItem.classList.contains('closed')) {
            // it is already opened.
            return;
        }

        listWorker.open(parentItem);
        openParentListRecursively(parentItem);
    }

    function openChildeListRecursively(node: HTMLElement, regExp: RegExp | null = null) {
        if (!regExp) {
            node.querySelectorAll<HTMLElement>('.treeSelect').forEach(listWorker.open);
            return;
        }

        const childItems = node.querySelectorAll<HTMLElement>(':scope > .treeSelectList > .treeSelect');

        for (const item of childItems) {
            if (item.querySelector<HTMLElement>('.label')!.textContent!.match(regExp)) {
                listWorker.open(item);
                openChildeListRecursively(item);
                openParentListRecursively(item);
            } else {
                listWorker.close(item);
                openChildeListRecursively(item, regExp);
            }
        }
    }

    function filterSelectPanelItem(input: HTMLInputElement, ul: HTMLElement) {
        if (input.readOnly) {
            return;
        }

        if (isNullOrWhiteSpace(input.value)) {
            ul.querySelectorAll<HTMLElement>('.treeSelect').forEach(listWorker.close);
            return;
        }

        const regExp = escapedRegex(input.value, 'i');
        const liList = [...ul.children];
        for (const li of ul.children) {
            if (li.classList.contains('treeSelect')) {
                openChildeListRecursively(li as HTMLElement, regExp);
            }
        }
        // ul.querySelectorAll<HTMLElement>('.treeSelect').forEach(li => openChildeListRecursively(li, regExp));
        // openChildeListRecursively(ul, regExp);
    }

    return {
        check: (item: HTMLElement) => {
            item.classList.add('checked');
            item.classList.remove('halfChecked');
        },
        halfCheck: (item: HTMLElement) => {
            item.classList.remove('checked');
            item.classList.add('halfChecked');
        },
        uncheck: (item: HTMLElement) => {
            item.classList.remove('checked');
            item.classList.remove('halfChecked');
        },
        open: (item: HTMLElement) => {
            item.classList.remove('closed');
        },
        close: (item: HTMLElement) => {
            item.classList.add('closed');
        },
        checkParentRecursively,
        openParentListRecursively,
        filterSelectPanelItem,
    };
})();

function calcPosition(input: Element, menu: Element, option: PositionOption) {
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
}

function closeMenuPanel() {
    if (currentMenu != null) {
        currentMenu.close();
    }
}

function initialize() {
    customElements.define('rui-treeselect', TreeSelect);
    document.addEventListener('mouseup', function (e) {
        if ((e.target as HTMLElement).closest('rui-treeselect')) {
            return;
        }

        closeMenuPanel();
    });
}

initialize();
