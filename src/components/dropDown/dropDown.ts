import { triggerEvent } from '../../index';
import { calcPosition, MenuItem, PositionOption } from '../helper';
import { MenuPanel } from '../menuPanel/menuPanel';

const css = `
:host{--color: var(--foreground-color);--color-hover: #eee;--placeholder: dimgray;--arrow-color: var(--foreground-color);--background: transparent;--background-focus: var(--active-background-color);--height: 3rem;--fontSize: 1.5rem;--bottomBorder: 2px solid var(--foreground-color);--bottomBorder-focus: var(--theme-color)}*{padding:0;margin:0;box-sizing:border-box;font-size:var(--fontSize);line-height:var(--height)}div{display:inline-block;position:relative;width:12rem;height:var(--height);background-color:rgba(0,0,0,0);cursor:pointer}div::before{position:absolute;content:"▼";color:var(--arrow-color);right:1rem;line-height:var(--height)}div.active::before{transform:rotateX(180deg)}input{display:inline-block;width:100%;height:100%;padding:.1rem .5rem;color:var(--color);text-align:left;background-color:var(--background);border:none;border-bottom:var(--bottomBorder);outline:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}input:focus{background-color:var(--background-focus);border-bottom-color:var(--bottomBorder-focus)}input:-moz-read-only{cursor:pointer}input:read-only{cursor:pointer}input::-moz-placeholder{color:var(--placeholder)}input::placeholder{color:var(--placeholder)}
`;
const html = `
<div><input type="text" placeholder="SELECT" spellcheck="false"></div>
`;

const template = `<style>${css}</style>${html}`;

let currentMenu: DropDown | null = null;

type DropDownOption = {
    items: MenuItem[];
    placeholder?: string;
    useInput?: boolean;
    onClick?: (e: MouseEvent) => void;
};
const defaultOption = {
    placeholder: '選択/入力して下さい',
    useInput: false,
};

export class DropDown extends HTMLElement {
    private self: DropDown;
    private root: ShadowRoot;
    private host: HTMLElement;
    private wrapper: HTMLElement;
    private input: HTMLInputElement;
    private menu: MenuPanel;
    private items: MenuItem[] = [];

    private option: PositionOption = {
        vertical: 'auto',
        horizontal: 'auto',
    };

    constructor(userOption?: DropDownOption) {
        super();
        this.self = this;
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = template;

        this.host = this.root.host as HTMLElement;
        this.wrapper = this.root.querySelector('div')!;
        this.input = this.root.querySelector('input')!;

        const option = Object.assign({}, defaultOption, userOption);
        this.items = option.items;
        this.input.readOnly = option.useInput != true;

        if (!userOption?.placeholder) {
            option.placeholder = option.useInput ? '選択/入力して下さい' : '選択して下さい';
        }
        this.input.placeholder = option.placeholder;

        this.menu = new MenuPanel();
        this.wrapper.appendChild(this.menu);

        this.menu.onClick = item => {
            this.input.value = item.text;
            this.input.dataset.value = item.value;

            // functionによる代入ではinputの変更をoninput/onchangeで補足できないため、能動的に発火する。
            triggerEvent('change', this.input);

            this.close();
        };

        this.wrapper.onmouseup = e => {
            const target = e.target as HTMLElement;
            if (target.nodeName === 'INPUT') {
                target.focus();
                this.show(this.items);
                this.menu.filter(this.input.value);
                return;
            }

            this.close();
        };

        this.input.oninput = () => {
            this.input.dataset.value = '';
            this.menu.filter(this.input.value);
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
    }

    show(items?: MenuItem[]) {
        closeMenuPanel();

        if (items != null) {
            this.items = items;
        }

        this.menu.show(this.items);
        currentMenu = this.self;

        this.wrapper.classList.add('active');

        this.updatePosition();
    }

    updatePosition() {
        const { left, top } = calcPosition(this.input, this.menu, this.option);
        this.menu.updatePosition({ left, top });
    }

    close() {
        this.menu.close();
        this.wrapper.classList.remove('active');
        currentMenu = null;
    }
}

function closeMenuPanel() {
    if (currentMenu != null) {
        currentMenu.close();
    }
}

function initialize() {
    customElements.define('drop-down', DropDown);
    document.addEventListener('mouseup', function (e) {
        if ((e.target as HTMLElement).closest('drop-down')) {
            return;
        }

        closeMenuPanel();
    });
}
initialize();

// class ruiewoSelect extends HTMLElement {
//     private static initialized = false;
//     private static activeWrapper: HTMLElement | null = null;

//     private wrapper: HTMLElement;
//     private input: HTMLInputElement;

//     constructor(items: twSelectItem[], option: twSelectOption | null = null) {
//         super();
//         ruiewoSelect.initialize();

//         const defaultOption: twSelectOption = {
//             placeholder: '選択/入力して下さい',
//             useInput: false,
//         };
//         option = Object.assign(defaultOption, option) as twSelectOption;

//         this.attachShadow({ mode: 'open' });
//         this.shadowRoot!.innerHTML = template + ruiewoSelect.render(items, option);

//         this.wrapper = this.shadowRoot!.querySelector('div')!;
//         this.input = this.shadowRoot!.querySelector('input')!;

//         this.wrapper.onmouseup = e => {
//             const target = e.target as HTMLElement;
//             if (target.nodeName === 'INPUT') {
//                 target.focus();
//                 ruiewoSelect.showSelectPanel(this.wrapper);
//                 ruiewoSelect.filterSelectPanelItem(target as HTMLInputElement);
//                 return;
//             }

//             const selectedItem = target.closest('.menuItem') as HTMLElement | null;
//             if (selectedItem) {
//                 this.wrapper.querySelectorAll('.selected').forEach(x => x.classList.remove('selected'));
//                 selectedItem.classList.add('selected');

//                 this.input.value = selectedItem.textContent!;
//                 this.input.dataset.value = selectedItem.dataset.value;

//                 // functionによる代入ではinputの変更をoninput/onchangeで補足できないため、能動的に発火する。
//                 const changeEvent = document.createEvent('HTMLEvents');
//                 changeEvent.initEvent('change', false, true);
//                 this.input.dispatchEvent(changeEvent);
//             }

//             ruiewoSelect.closeSelectPanel();
//         };

//         this.input.onkeydown = e => {
//             const keyCode = e.code;

//             switch (keyCode) {
//                 case 'Enter': {
//                     const item = this.wrapper.querySelector<HTMLElement>('.menuItem.selected');
//                     if (item) {
//                         this.input.value = item.textContent!;
//                         this.input.dataset.value = item.dataset.value;
//                         ruiewoSelect.closeSelectPanel();
//                     }
//                     break;
//                 }
//                 case 'ArrowDown':
//                 case 'ArrowUp': {
//                     const itemNodeList = this.wrapper.querySelectorAll('.menuItem:not(.hidden)');
//                     if (itemNodeList.length === 0) {
//                         return;
//                     }

//                     const items = [...itemNodeList];
//                     const currentIndex = items.findIndex(x => x.classList.contains('selected'));

//                     let newIndex = currentIndex;
//                     switch (keyCode) {
//                         case 'ArrowUp':
//                             newIndex--;
//                             newIndex = newIndex < 0 ? items.length - 1 : newIndex;
//                             break;
//                         case 'ArrowDown':
//                             newIndex++;
//                             newIndex = newIndex >= items.length ? 0 : newIndex;
//                             break;
//                     }

//                     items[currentIndex]?.classList.remove('selected');
//                     items[newIndex].classList.add('selected');
//                     break;
//                 }
//                 default:
//                     break;
//             }
//         };

//         this.input.oninput = () => {
//             this.input.dataset.value = '';
//             ruiewoSelect.filterSelectPanelItem(this.input);
//         };
//     }

//     static render(items: twSelectItem[], option: twSelectOption) {
//         const wrapper =
//             `<div class="wrapper">` +
//             `<input type="text" placeholder="${option.placeholder}" ${option.useInput ? 'readonly' : ''}>` +
//             this.renderItems(items) +
//             `</div>`;

//         return wrapper;
//     }

//     // changeItems(items: twSelectItem[]) {
//     //     const itemsHtml = TwSelect.renderItems(items, true);
//     //     this.menu.innerHTML = itemsHtml;
//     // }

//     static renderItems(items: twSelectItem[], onlyItems = false): string {
//         const menuItems = items.map(item => {
//             if (item.separator === true) {
//                 return `<li class="separator"></li>`;
//             }
//             if (item.children && item.children.length > 0) {
//                 const subMenu = this.renderItems(item.children);
//                 return this.createMenuItem(item, subMenu);
//             }
//             return this.createMenuItem(item);
//         });

//         if (onlyItems) {
//             return menuItems.join('');
//         }

//         return '<ul>' + menuItems.join('') + '</ul>';
//     }

//     static initialize() {
//         if (!ruiewoSelect.initialized) {
//             document.addEventListener('mouseup', function (e) {
//                 if ((e.target as HTMLElement).closest('tw-select')) {
//                     return;
//                 }

//                 ruiewoSelect.closeSelectPanel();
//             });

//             ruiewoSelect.initialized = true;
//         }
//     }

//     static closeSelectPanel() {
//         if (!ruiewoSelect.activeWrapper) return;

//         ruiewoSelect.activeWrapper.classList.remove('active');
//         ruiewoSelect.activeWrapper = null;
//     }

//     static showSelectPanel(wrapper: HTMLElement) {
//         if (!wrapper) return;

//         if (ruiewoSelect.activeWrapper == wrapper) return;

//         ruiewoSelect.closeSelectPanel();
//         wrapper.classList.add('active');
//         ruiewoSelect.activeWrapper = wrapper;
//     }

//     static filterSelectPanelItem(input: HTMLInputElement) {
//         if (input.readOnly) {
//             return;
//         }

//         const items = input.parentNode!.querySelectorAll('.menuItem');
//         for (const item of items) {
//             const str = new RegExp(input.value, 'gi');
//             const li = item.closest('li')!;
//             if (item.innerHTML.match(str)) {
//                 // item.classList.remove('hidden');
//                 li.classList.remove('hidden');
//             } else {
//                 // item.classList.add('hidden');
//                 li.classList.add('hidden');
//                 item.classList.remove('selected');
//             }
//         }
//     }

//     static createMenuItem(item: twSelectItem, subMenu: string | null = null) {
//         const classNames = item.classList?.join(' ') ?? '';

//         return `<li class="${subMenu == null ? '' : 'subMenu'}"><div class="menuItem ${classNames}" data-value="${item.value}"><i part="${
//             item.icon ?? ''
//         }"></i><span>${item.text}</span></div>${subMenu == null ? '' : subMenu}</li>`;
//     }
// }

// customElements.define('tw-select', ruiewoSelect);

// export { ruiewoSelect as TwSelect };

// export type twSelectItem = { text: string; value: string; icon?: string; classList?: string[]; children: twSelectItem[]; separator?: boolean };

// export type twSelectOption = {
//     // event: string;
//     // predicate?: (e: MouseEvent) => boolean;
//     // onShow?: (e: MouseEvent) => void;
//     // onClick?: (e: MouseEvent) => void;
//     // onClose?: (e: MouseEvent) => void;
//     // setPosition?: (e: MouseEvent) => HTMLElement;
//     // inheritWidth?: boolean;
//     placeholder: string;
//     useInput: boolean;
// };
