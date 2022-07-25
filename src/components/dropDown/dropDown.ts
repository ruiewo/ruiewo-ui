import { isNullOrWhiteSpace, triggerEvent } from '../../utility/utility';
import { MenuItem, PositionOption } from '../helper';
import { MenuPanel } from '../menuPanel/menuPanel';

const css = `
:host{--color: var(--foreground-color);--color-hover: #eee;--placeholder: dimgray;--arrow-color: var(--foreground-color);--background: transparent;--background-focus: var(--active-background-color);--height: 3rem;--fontSize: 1.5rem;--bottomBorder: 0.3rem solid var(--foreground-color);--bottomBorder-focus: var(--theme-color);width:12rem}*{padding:0;margin:0;box-sizing:border-box;font-size:var(--fontSize)}div{display:inline-block;position:relative;width:inherit;height:var(--height);background-color:rgba(0,0,0,0);cursor:pointer}div::before{position:absolute;content:"▼";color:var(--arrow-color);right:1rem;line-height:var(--height)}div.active::before{transform:rotateX(180deg)}input{display:inline-block;width:100%;height:100%;line-height:var(--height);padding:.1rem .5rem;color:var(--color);text-align:left;background-color:var(--background);border:none;border-bottom:var(--bottomBorder);outline:none;-webkit-user-select:none;-moz-user-select:none;user-select:none;font-family:inherit}input:focus{background-color:var(--background-focus);border-bottom-color:var(--bottomBorder-focus)}input:-moz-read-only{cursor:pointer}input:read-only{cursor:pointer}input::-moz-placeholder{color:var(--placeholder)}input::placeholder{color:var(--placeholder)}
`;
const html = `
<div><input type="text" placeholder="SELECT" spellcheck="false"></div>
`;

const template = `<style>${css}</style>${html}`;

let currentMenu: DropDown | null = null;

export type DropDownOption = {
    valueKey: string;
    textKey: string;
    placeholder: string;
    useBlank: boolean;
    useInput: boolean;
    onSelect: (value: string) => void;
};
const defaultOption = {
    valueKey: 'value',
    textKey: 'text',
    placeholder: '選択/入力して下さい',
    useBlank: false,
    useInput: false,
    onSelect: () => {},
};

export class DropDown extends HTMLElement {
    private self: DropDown;
    private root: ShadowRoot;
    private host: HTMLElement;
    private wrapper: HTMLElement;
    private input: HTMLInputElement;
    private menu: MenuPanel;
    private items: MenuItem[] = [];
    private option: DropDownOption;

    private position: PositionOption = {
        vertical: 'auto',
        horizontal: 'auto',
    };

    constructor(items: any[], userOption?: Partial<DropDownOption>) {
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

        this.menu = new MenuPanel();
        this.wrapper.appendChild(this.menu);

        this.menu.onClick = item => {
            this.input.value = item.text;
            this.input.dataset.value = item.value;

            // functionによる代入ではinputの変更をoninput/onchangeで補足できないため、能動的に発火する。
            triggerEvent('change', this.input);

            this.option.onSelect(item.value);

            this.close();
        };

        this.wrapper.onmouseup = e => {
            const target = e.target as HTMLElement;
            if (target.nodeName === 'INPUT') {
                target.focus();
                this.show();
                if (this.option.useInput) {
                    this.menu.filter(this.input.value);
                }
                return;
            }

            this.close();
        };

        this.input.oninput = () => {
            this.input.dataset.value = '';
            if (this.option.useInput) {
                this.menu.filter(this.input.value);
            }
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

    close() {
        this.menu.close();
        this.wrapper.classList.remove('active');
        currentMenu = null;
    }

    convert(items: any[]): MenuItem[] {
        const menuItems = items.map(x => {
            if (x.type === 'divisor') {
                return { text: '', value: '', type: 'divisor' };
            }

            const text = isNullOrWhiteSpace(this.option.textKey) ? (x as string) : (x[this.option.textKey!] as string);
            const value = isNullOrWhiteSpace(this.option.valueKey) ? (x as string) : (x[this.option.valueKey!] as string);

            return { text, value };
        });

        if (this.option.useBlank) {
            menuItems.unshift({ text: '', value: '' });
        }

        return menuItems as MenuItem[];
    }

    getValue() {
        return this.input.dataset.value!;
    }

    setValue(value: string | number | null | undefined) {
        // const valueStr = value ? value.toString() : '';
        const item = this.items.find(x => x.value === value);

        if (item != null) {
            this.input.value = item.text;
            this.input.dataset.value = item.value;
        } else if (this.option.useBlank) {
            this.input.value = '';
            this.input.dataset.value = '';
        } else {
            const item = this.items[0];
            if (item) {
                this.input.value = item.text;
                this.input.dataset.value = item.value;
            } else {
                this.input.value = '';
                this.input.dataset.value = '';
            }
        }

        // functionによる代入ではinputの変更をoninput/onchangeで補足できないため、能動的に発火する。
        triggerEvent('change', this.input);
    }
}

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
    customElements.define('drop-down', DropDown);
    document.addEventListener('mouseup', function (e) {
        if ((e.target as HTMLElement).closest('drop-down')) {
            return;
        }

        closeMenuPanel();
    });
}

initialize();
