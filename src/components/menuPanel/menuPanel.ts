import { MenuItem } from '../helper';

const css = `
:host{--color: var(--foreground-color);--color-hover: #eee;--background: var(--active-background-color);--background-hover: var(--lightDark-theme-color);--arrow-color: var(--foreground-color);--arrow-color-hover: #eee;--shadow-color: #fff5;--height: 3rem;--fontSize: 1.5rem;--leftBorder: dimgray;position:absolute;display:block;width:inherit}*{padding:0;margin:0;box-sizing:border-box}ul{display:none;list-style-type:none;text-align:left;background-color:var(--twSelectListBackground);width:inherit;max-height:calc(var(--height)*8);overflow-y:auto;z-index:1;box-shadow:0 3px 7px -2px rgba(0,0,0,.4)}:host(.show) ul{display:block}li{display:block;position:relative;margin:0;padding:0;white-space:nowrap}li:hover{color:var(--color-hover);background:var(--background-hover)}li.disabled{opacity:.5;pointer-events:none;cursor:default}li.hidden{display:none}li{display:block;width:100%;height:var(--height);padding:.4rem .7rem;color:var(--color);border:1px solid rgba(0,0,0,0);font-size:var(--fontSize);text-align:left;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none}li.dropDown{padding:0 .5em;font-size:inherit;line-height:inherit;border-left:.3rem solid rgba(0,0,0,0)}li.dropDown.selected{border-left-color:var(--leftBorder)}li.dropDown span{margin-left:0;height:var(--height);line-height:var(--height)}li.dropDown i{display:none}li.contextMenu{height:unset;padding:.4rem .7rem;font-size:1rem}li.contextMenu span{margin-left:2.2rem}li.contextMenu i{position:absolute;left:.5rem;width:2rem;height:2rem;top:50%;transform:translateY(-50%);background-position:right;background-repeat:no-repeat;background-size:contain}hr{display:block;margin:7px 5px;height:1px;background-color:var(--color)}li.subMenu::after{content:"";position:absolute;right:6px;top:50%;transform:translateY(-50%);border:5px solid rgba(0,0,0,0);border-left-color:var(--arrow-color)}li.subMenu:hover::after{border-left-color:var(--arrow-color-hover)}ul ul{top:4px;left:99%}:host(.show)>ul{display:block;-webkit-animation:fadeInUp 400ms;animation:fadeInUp 400ms}li:hover>ul{display:block;-webkit-animation:fadeInUp 400ms;animation:fadeInUp 400ms}@-webkit-keyframes fadeInUp{from{opacity:0;transform:translate3d(0, calc(var(--height) * 0.6), 0)}to{opacity:1;transform:none}}@keyframes fadeInUp{from{opacity:0;transform:translate3d(0, calc(var(--height) * 0.6), 0)}to{opacity:1;transform:none}}@-webkit-keyframes fadeOut{from{opacity:1}to{opacity:0}}@keyframes fadeOut{from{opacity:1}to{opacity:0}}
`;
const html = `
<ul class="wrapper"></ul>
`;
const template = `<style>${css}</style>${html}`;

let currentMenuPanel: MenuPanel | null = null;

type MenuType = 'DropDown' | 'ContextMenu' | 'Hg';

export class MenuPanel extends HTMLElement {
    private self: MenuPanel;
    private root: ShadowRoot;
    private host: HTMLElement;
    private ul: HTMLElement;
    private items: MenuItem[] = [];

    public onClick = (item: MenuItem) => {};

    constructor() {
        super();
        this.self = this;
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = template;

        this.host = this.root.host as HTMLElement;
        this.ul = this.root.querySelector('ul')!;

        this.ul.onclick = e => {
            const indexStr = (e.target as HTMLElement).closest('li')!.dataset.index;
            if (!indexStr) {
                return;
            }

            this.onClick(this.items[Number(indexStr)]);
        };
    }

    show(items: MenuItem[], type: MenuType) {
        this.items = items;
        this.create(items, type);

        this.host.classList.add('show');
        currentMenuPanel = this.self;
    }

    create(items: MenuItem[], type: MenuType) {
        this.ul.innerHTML = '';

        let createItem: CreateItem;
        switch (type) {
            case 'DropDown':
                createItem = dropDown.createItem;
                break;
            case 'ContextMenu':
                createItem = contextMenu.createItem;
                break;
            default:
                throw new Error();
        }

        for (let i = 0; i < items.length; i++) {
            const itemContainer = createItem(items[i], i);
            this.ul.appendChild(itemContainer);
        }
    }

    updatePosition({ top, right, bottom, left }: { top?: number; right?: number; bottom?: number; left?: number }) {
        if (top != null) {
            this.host.style.top = top + 'px';
        }
        if (right != null) {
            this.host.style.right = right + 'px';
        }
        if (bottom != null) {
            this.host.style.bottom = bottom + 'px';
        }
        if (left != null) {
            this.host.style.left = left + 'px';
        }
    }

    close() {
        this.host.classList.remove('show');
        currentMenuPanel = null;
    }

    // for DropDown
    select() {
        this.ul.querySelector<HTMLElement>('.selected')?.click();
    }
    filter(text: string) {
        dropDown.filterItem(text, this.ul);
    }
    selectNext() {
        dropDown.moveSelect(this.ul, true);
    }
    selectPrev() {
        dropDown.moveSelect(this.ul, false);
    }
}

type CreateItem = (item: MenuItem, index: number) => HTMLElement;

function createItemElement(item: MenuItem, index: number) {
    if (item.type && (item.type == 'line' || item.type == 'divisor')) {
        return document.createElement('hr');
    }

    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = item.text;
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
    li.appendChild(label);

    // if (item.submenu) {
    //     var itemIconSubmenu = document.createElement('span');
    //     itemIconSubmenu.innerHTML = '&#9658;';
    //     li.appendChild(itemIconSubmenu);
    //     li.classList.add('jcontexthassubmenu');
    //     var el_submenu = document.createElement('div');

    //     el_submenu.classList.add('jcontextmenu');
    //     el_submenu.setAttribute('tabindex', '900');

    //     var submenu = item.submenu;
    //     for (var i = 0; i < submenu.length; i++) {
    //         var itemContainerSubMenu = createItemElement(submenu[i]);
    //         el_submenu.appendChild(itemContainerSubMenu);
    //     }

    //     li.appendChild(el_submenu);
    // }

    return li;
}

const contextMenu = (() => {
    function createItem(item: MenuItem, index: number): HTMLElement {
        const li = createItemElement(item, index);

        li.classList.add('contextMenu');

        return li;
    }

    return { createItem };
})();

const dropDown = (() => {
    function createItem(item: MenuItem, index: number): HTMLElement {
        const li = createItemElement(item, index);

        li.classList.add('dropDown');

        return li;
    }

    function filterItem(text: string, ul: HTMLElement) {
        const items = ul.querySelectorAll('li');
        for (const li of items) {
            const str = new RegExp(text, 'gi');
            if (li.textContent!.match(str)) {
                li.classList.remove('hidden');
            } else {
                li.classList.add('hidden');
                li.classList.remove('selected');
            }
        }
    }

    function moveSelect(ul: HTMLElement, isNext = true) {
        const itemNodeList = ul.querySelectorAll('li:not(.hidden)');
        if (itemNodeList.length === 0) {
            return;
        }

        const items = [...itemNodeList];
        const currentIndex = items.findIndex(x => x.classList.contains('selected'));

        let newIndex = currentIndex;
        if (isNext) {
            newIndex++;
            newIndex = newIndex >= items.length ? 0 : newIndex;
        } else {
            newIndex--;
            newIndex = newIndex < 0 ? items.length - 1 : newIndex;
        }

        items[currentIndex]?.classList.remove('selected');
        items[newIndex].classList.add('selected');
    }

    return { createItem, filterItem, moveSelect };
})();

function initialize() {
    customElements.define('rui-menupanel', MenuPanel);
    // document.addEventListener('mouseup', function (e) {
    //     if ((e.target as HTMLElement).closest('menu-panel')) {
    //         return;
    //     }

    //     closeMenuPanel();
    // });
}

initialize();
