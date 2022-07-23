// import css from './dropDown.scss';
// import html from './dropDown.html';
import { calcPosition, MenuItem, PositionOption } from '../helper';
import { MenuPanel } from '../menuPanel/menuPanel';

const css = `
:host{--theme: #db4d6f;--foreground: #ccc;--background: #3c3c3c;--foreground-outOfMonth: #808080;--background-outOfMonth: #222;--border-color: #222}:host(.dark){--theme: #ccc;--foreground: #ccc;--background: #3c3c3c;--foreground-outOfMonth: #808080;--background-outOfMonth: #222;--border-color: #222}:host(.white){--theme: #333;--foreground: #333;--background: #f2f2f2;--foreground-outOfMonth: #222;--background-outOfMonth: #ccc;--border-color: transparent}:host{position:absolute;left:0;top:0;display:none;background-color:var(--background)}:host(.show){display:block}*{padding:0;margin:0;box-sizing:border-box}.header{height:3rem;display:flex;flex-direction:row;justify-content:space-between}.year,.month,.next,.prev{display:inline-block;width:3rem;line-height:3rem;font-size:1.5rem;font-weight:bold;text-align:center;color:var(--foreground)}.year{width:7rem;outline:none;border:none;background-color:var(--background)}.month{width:5rem}.next,.prev{width:3rem;cursor:pointer}.next:active:not([disabled]),.prev:active:not([disabled]){transform:scale(0.95)}.next:hover,.prev:hover{color:var(--theme)}.weekdays,.days{color:var(--foreground);display:grid;grid-template-columns:repeat(7, 3rem);text-align:right}.weekdays div{color:var(--theme);border-top:solid 1px var(--theme);border-bottom:solid 1px var(--theme);height:2.4rem;line-height:2.4rem;text-align:center;-webkit-user-select:none;-moz-user-select:none;user-select:none}.days{height:auto}.days .day{position:relative;height:3rem;line-height:3rem;text-align:center;color:var(--foreground);border:solid 1px var(--border-color);-webkit-user-select:none;-moz-user-select:none;user-select:none}.days .day.outOfMonth{color:var(--foreground-outOfMonth);background-color:var(--background-outOfMonth)}.days .day.selected,.days .day:hover{font-weight:bold;outline:3px solid var(--theme);outline-offset:-3px;cursor:pointer}
`;
const html = `
<div class="wrapper"><input type="text" placeholder="SELECT"></div>
`;

const template = `<style>${css}</style>${html}`;

let currentSelect: DropDown | null = null;

type DropDownOption = {
    placeholder: string;
    useInput: boolean;
    onClick?: (e: MouseEvent) => void;
};
const defaultOption = {
    placeholder: 'SELECT',
    useInput: false,
};

export class DropDown extends HTMLElement {
    private self: DropDown;
    private root: ShadowRoot;
    private host: HTMLElement;
    private input: HTMLInputElement;
    private menu: MenuPanel;
    private items: MenuItem[] = [];

    private option: PositionOption = {
        vertical: 'auto',
        horizontal: 'auto',
    };

    constructor(option?: DropDownOption) {
        super();
        this.self = this;
        this.root = this.attachShadow({ mode: 'closed' });
        this.host = this.root.host as HTMLElement;
        this.input = this.root.querySelector('input')!;

        const userOption = Object.assign({}, defaultOption, option);
        this.input.readOnly = userOption.useInput;
        this.input.placeholder = userOption.placeholder;

        this.menu = new MenuPanel();
        this.root.appendChild(this.menu);
    }

    show(items: MenuItem[]) {
        this.items = items;

        closeCurrentMenu();

        this.menu.create(items);
        this.menu.show(items);

        currentSelect = this.self;

        this.updatePosition();
    }

    updatePosition() {
        const { left, top } = calcPosition(this.input, this.menu, this.option);

        this.menu.updatePosition({ left, top });
    }

    close() {
        this.menu.close();
        currentSelect = null;
    }
}

function closeCurrentMenu() {
    if (currentSelect != null) {
        currentSelect.close();
    }
}

jSuites.contextmenu = function (el, options) {
    // New instance
    var obj = { type: 'contextmenu' };

    obj.create = function (items) {
        // Update content
        el.innerHTML = '';

        // Add header contextmenu
        var itemHeader = createHeader();
        el.appendChild(itemHeader);

        // Append items
        for (var i = 0; i < items.length; i++) {
            var itemContainer = createItemElement(items[i]);
            el.appendChild(itemContainer);
        }
    };

    /**
     * Private function for create a new Item element
     * @param {type} item
     * @returns {jsuitesL#15.jSuites.contextmenu.createItemElement.itemContainer}
     */
    function createItemElement(item) {
        if (item.type && (item.type == 'line' || item.type == 'divisor')) {
            var itemContainer = document.createElement('hr');
        } else {
            var itemContainer = document.createElement('div');
            var itemText = document.createElement('a');
            itemText.innerHTML = item.title;

            if (item.tooltip) {
                itemContainer.setAttribute('title', item.tooltip);
            }

            if (item.icon) {
                itemContainer.setAttribute('data-icon', item.icon);
            }

            if (item.id) {
                itemContainer.id = item.id;
            }

            if (item.disabled) {
                itemContainer.className = 'jcontextmenu-disabled';
            } else if (item.onclick) {
                itemContainer.method = item.onclick;
                itemContainer.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                });
                itemContainer.addEventListener('mouseup', function (e) {
                    // Execute method
                    this.method(this, e);
                });
            }
            itemContainer.appendChild(itemText);

            if (item.submenu) {
                var itemIconSubmenu = document.createElement('span');
                itemIconSubmenu.innerHTML = '&#9658;';
                itemContainer.appendChild(itemIconSubmenu);
                itemContainer.classList.add('jcontexthassubmenu');
                var el_submenu = document.createElement('div');
                // Class definition
                el_submenu.classList.add('jcontextmenu');
                // Focusable
                el_submenu.setAttribute('tabindex', '900');

                // Append items
                var submenu = item.submenu;
                for (var i = 0; i < submenu.length; i++) {
                    var itemContainerSubMenu = createItemElement(submenu[i]);
                    el_submenu.appendChild(itemContainerSubMenu);
                }

                itemContainer.appendChild(el_submenu);
            } else if (item.shortcut) {
                var itemShortCut = document.createElement('span');
                itemShortCut.innerHTML = item.shortcut;
                itemContainer.appendChild(itemShortCut);
            }
        }
        return itemContainer;
    }

    if (typeof obj.options.onclick == 'function') {
        el.addEventListener('click', function (e) {
            obj.options.onclick(obj, e);
        });
    }

    // Create items
    if (obj.options.items) {
        obj.create(obj.options.items);
    }

    window.addEventListener('mousewheel', function () {
        obj.close();
    });

    el.contextmenu = obj;

    return obj;
};

class ruiewoSelect extends HTMLElement {
    private static initialized = false;
    private static activeWrapper: HTMLElement | null = null;

    private wrapper: HTMLElement;
    private input: HTMLInputElement;

    constructor(items: twSelectItem[], option: twSelectOption | null = null) {
        super();
        ruiewoSelect.initialize();

        const defaultOption: twSelectOption = {
            placeholder: '選択/入力して下さい',
            useInput: false,
        };
        option = Object.assign(defaultOption, option) as twSelectOption;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = template + ruiewoSelect.render(items, option);

        this.wrapper = this.shadowRoot!.querySelector('div')!;
        this.input = this.shadowRoot!.querySelector('input')!;

        this.wrapper.onmouseup = e => {
            const target = e.target as HTMLElement;
            if (target.nodeName === 'INPUT') {
                target.focus();
                ruiewoSelect.showSelectPanel(this.wrapper);
                ruiewoSelect.filterSelectPanelItem(target as HTMLInputElement);
                return;
            }

            const selectedItem = target.closest('.menuItem') as HTMLElement | null;
            if (selectedItem) {
                this.wrapper.querySelectorAll('.selected').forEach(x => x.classList.remove('selected'));
                selectedItem.classList.add('selected');

                this.input.value = selectedItem.textContent!;
                this.input.dataset.value = selectedItem.dataset.value;

                // functionによる代入ではinputの変更をoninput/onchangeで補足できないため、能動的に発火する。
                const changeEvent = document.createEvent('HTMLEvents');
                changeEvent.initEvent('change', false, true);
                this.input.dispatchEvent(changeEvent);
            }

            ruiewoSelect.closeSelectPanel();
        };

        this.input.onkeydown = e => {
            const keyCode = e.code;

            switch (keyCode) {
                case 'Enter': {
                    const item = this.wrapper.querySelector<HTMLElement>('.menuItem.selected');
                    if (item) {
                        this.input.value = item.textContent!;
                        this.input.dataset.value = item.dataset.value;
                        ruiewoSelect.closeSelectPanel();
                    }
                    break;
                }
                case 'ArrowDown':
                case 'ArrowUp': {
                    const itemNodeList = this.wrapper.querySelectorAll('.menuItem:not(.hidden)');
                    if (itemNodeList.length === 0) {
                        return;
                    }

                    const items = [...itemNodeList];
                    const currentIndex = items.findIndex(x => x.classList.contains('selected'));

                    let newIndex = currentIndex;
                    switch (keyCode) {
                        case 'ArrowUp':
                            newIndex--;
                            newIndex = newIndex < 0 ? items.length - 1 : newIndex;
                            break;
                        case 'ArrowDown':
                            newIndex++;
                            newIndex = newIndex >= items.length ? 0 : newIndex;
                            break;
                    }

                    items[currentIndex]?.classList.remove('selected');
                    items[newIndex].classList.add('selected');
                    break;
                }
                default:
                    break;
            }
        };

        this.input.oninput = () => {
            this.input.dataset.value = '';
            ruiewoSelect.filterSelectPanelItem(this.input);
        };
    }

    static render(items: twSelectItem[], option: twSelectOption) {
        const wrapper =
            `<div class="wrapper">` +
            `<input type="text" placeholder="${option.placeholder}" ${option.useInput ? 'readonly' : ''}>` +
            this.renderItems(items) +
            `</div>`;

        return wrapper;
    }

    // changeItems(items: twSelectItem[]) {
    //     const itemsHtml = TwSelect.renderItems(items, true);
    //     this.menu.innerHTML = itemsHtml;
    // }

    static renderItems(items: twSelectItem[], onlyItems = false): string {
        const menuItems = items.map(item => {
            if (item.separator === true) {
                return `<li class="separator"></li>`;
            }
            if (item.children && item.children.length > 0) {
                const subMenu = this.renderItems(item.children);
                return this.createMenuItem(item, subMenu);
            }
            return this.createMenuItem(item);
        });

        if (onlyItems) {
            return menuItems.join('');
        }

        return '<ul>' + menuItems.join('') + '</ul>';
    }

    static initialize() {
        if (!ruiewoSelect.initialized) {
            document.addEventListener('mouseup', function (e) {
                if ((e.target as HTMLElement).closest('tw-select')) {
                    return;
                }

                ruiewoSelect.closeSelectPanel();
            });

            ruiewoSelect.initialized = true;
        }
    }

    static closeSelectPanel() {
        if (!ruiewoSelect.activeWrapper) return;

        ruiewoSelect.activeWrapper.classList.remove('active');
        ruiewoSelect.activeWrapper = null;
    }

    static showSelectPanel(wrapper: HTMLElement) {
        if (!wrapper) return;

        if (ruiewoSelect.activeWrapper == wrapper) return;

        ruiewoSelect.closeSelectPanel();
        wrapper.classList.add('active');
        ruiewoSelect.activeWrapper = wrapper;
    }

    static filterSelectPanelItem(input: HTMLInputElement) {
        if (input.readOnly) {
            return;
        }

        const items = input.parentNode!.querySelectorAll('.menuItem');
        for (const item of items) {
            const str = new RegExp(input.value, 'gi');
            const li = item.closest('li')!;
            if (item.innerHTML.match(str)) {
                // item.classList.remove('hidden');
                li.classList.remove('hidden');
            } else {
                // item.classList.add('hidden');
                li.classList.add('hidden');
                item.classList.remove('selected');
            }
        }
    }

    static createMenuItem(item: twSelectItem, subMenu: string | null = null) {
        const classNames = item.classList?.join(' ') ?? '';

        return `<li class="${subMenu == null ? '' : 'subMenu'}"><div class="menuItem ${classNames}" data-value="${item.value}"><i part="${
            item.icon ?? ''
        }"></i><span>${item.text}</span></div>${subMenu == null ? '' : subMenu}</li>`;
    }
}

customElements.define('tw-select', ruiewoSelect);

export { ruiewoSelect as TwSelect };

export type twSelectItem = { text: string; value: string; icon?: string; classList?: string[]; children: twSelectItem[]; separator?: boolean };

export type twSelectOption = {
    // event: string;
    // predicate?: (e: MouseEvent) => boolean;
    // onShow?: (e: MouseEvent) => void;
    // onClick?: (e: MouseEvent) => void;
    // onClose?: (e: MouseEvent) => void;
    // setPosition?: (e: MouseEvent) => HTMLElement;
    // inheritWidth?: boolean;
    placeholder: string;
    useInput: boolean;
};
