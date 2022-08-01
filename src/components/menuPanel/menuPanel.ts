import { htmlToElement } from '../../index';
import { createCommonMenuItem, MenuItem, PositionOption } from '../helper';

const css = `
:host{--color: var(--foreground-color);--color-hover: #eee;--background: var(--active-background-color);--background-hover: var(--lightDark-theme-color);--arrow-color: var(--foreground-color);--arrow-color-hover: #eee;--shadow-color: #fff5;--height: 3rem;--fontSize: 1.5rem;--leftBorder: dimgray;--expanderWidth: var(--fontSize);--expanderBorderWidth: calc(var(--expanderWidth) * 0.5);--focus-theme-color: var(--theme-color);position:absolute;display:block;width:inherit;z-index:1}:host(.dropDown){--height: inherit;--fontSize: inherit}*{padding:0;margin:0;box-sizing:border-box}ul{display:none;list-style-type:none;text-align:left;background-color:var(--background);width:inherit;max-height:calc(var(--height)*8);overflow-y:auto;z-index:1;box-shadow:0 3px 7px -2px rgba(0,0,0,.4)}:host(.show) ul{display:block}ul.contextMenu{padding:.3rem 0;box-shadow:0px 0px 4px var(--shadow-color)}li{display:block;position:relative;margin:0;padding:0;white-space:nowrap}li.hover,li:hover{color:var(--color-hover);background:var(--background-hover)}li.disabled{opacity:.5;pointer-events:none;cursor:default}li.hidden{display:none}li{display:block;width:100%;height:var(--height);padding:.4rem .7rem;color:var(--color);font-size:var(--fontSize);text-align:left;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none}li.dropDown{padding:0 .5em;font-size:inherit;line-height:inherit;border-left:.3rem solid rgba(0,0,0,0)}li.dropDown.selected{border-left-color:var(--leftBorder)}li.dropDown span{margin-left:0;height:var(--height);line-height:var(--height)}li.dropDown i{display:none}li.contextMenu{height:unset;padding:.4rem .7rem;font-size:1rem}li.contextMenu span{margin-left:2.2rem}li.contextMenu i{position:absolute;left:.5rem;width:2rem;height:2rem;top:50%;transform:translateY(-50%);background-position:right;background-repeat:no-repeat;background-size:contain}ul.treeSelect{padding-left:5px !important}.buttons{display:flex;flex-direction:row;justify-content:space-around;min-height:30px;padding:.5rem 0}.buttons button{width:8rem;height:2rem;line-height:2rem;padding:0 1rem}li.treeSelect{height:auto;min-height:var(--height);padding:0}li.treeSelect:hover{background-color:var(--background-hover)}li.treeSelect>span{height:var(--height);line-height:var(--height);vertical-align:middle}li.treeSelect .expander{display:inline-block;vertical-align:middle;width:var(--expanderWidth);cursor:pointer;position:relative;transition:transform 150ms ease-out}li.treeSelect .expander:before{position:absolute;top:var(--expanderBorderWidth);display:block;content:"";border:var(--expanderBorderWidth) solid rgba(0,0,0,0);border-top:var(--expanderBorderWidth) solid var(--foreground-color);transition:border-color 150ms}li.treeSelect .expander:hover:before{border-top:var(--expanderBorderWidth) solid var(--focus-theme-color)}li.treeSelect.closed>.expander{transform:rotate(-90deg)}li.treeSelect.closed>.treeSelectList{display:none}li.treeSelect .checkbox{display:inline-block;vertical-align:middle;width:20px;height:20px;cursor:pointer;position:relative}li.treeSelect .checkbox:before{transition:all .3s;cursor:pointer;position:absolute;inset:0;margin:auto;content:"";display:block;width:18px;height:18px;border:1px solid #d9d9d9;border-radius:2px}li.treeSelect.bottomLayer>.checkbox{margin-left:var(--fontSize)}li.treeSelect .checkbox:hover:before{box-shadow:0 0 2px 1px #1890ff}li.treeSelect.checked>.checkbox:before{background-color:#1890ff;border-color:#1890ff}li.treeSelect.checked>.checkbox:after{position:absolute;content:"";display:block;top:-1px;bottom:0;left:0;right:0;margin:auto;width:5px;height:9px;border:2px solid #fff;border-top:none;border-left:none;transform:rotate(45deg)}li.treeSelect.halfChecked>.checkbox:before{background-color:#1890ff;border-color:#1890ff}li.treeSelect.halfChecked>.checkbox:after{position:absolute;content:"";display:block;inset:0;margin:auto;width:10px;height:2px;background-color:#fff}li.treeSelect .label{padding:0 5px;display:inline-block;width:calc(100% - 40px)}li.treeSelect .treeSelectList{padding-left:20px;height:auto;max-height:unset}hr{display:block;margin:7px 5px;height:1px;background-color:var(--color)}li.subMenu::after{content:"";position:absolute;right:6px;top:50%;transform:translateY(-50%);border:5px solid rgba(0,0,0,0);border-left-color:var(--arrow-color)}li.subMenu:hover::after{border-left-color:var(--arrow-color-hover)}:host(.show)>ul{display:block;-webkit-animation:fadeInUp 400ms;animation:fadeInUp 400ms}@-webkit-keyframes fadeInUp{from{opacity:0;transform:translate3d(0, calc(var(--height) * 0.6), 0)}to{opacity:1;transform:none}}@keyframes fadeInUp{from{opacity:0;transform:translate3d(0, calc(var(--height) * 0.6), 0)}to{opacity:1;transform:none}}@-webkit-keyframes fadeOut{from{opacity:1}to{opacity:0}}@keyframes fadeOut{from{opacity:1}to{opacity:0}}
`;
const html = `
<ul class="wrapper"></ul>
`;
const template = `<style>${css}</style>${html}`;

let currentMenuPanel: MenuPanel | null = null;

type MenuType = 'dropDown' | 'contextMenu' | 'treeSelect';
type CreateMenuItems = (items: MenuItem[]) => DocumentFragment;

export class MenuPanel extends HTMLElement {
    public type: MenuType;
    protected self: MenuPanel;
    protected root: ShadowRoot;
    private host: HTMLElement;
    public ul: HTMLElement;
    private items: MenuItem[] = [];
    private subMenu: SubMenuPanel | null = null;

    public onClick = (item: MenuItem) => {};
    public onClose = () => {};
    private createHtml: CreateMenuItems;
    private hasHtmlCreated = false;

    constructor(type: MenuType, createHtml: CreateMenuItems) {
        super();
        this.type = type;
        this.self = this;
        this.self.classList.add(this.type);
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = template;
        this.createHtml = createHtml;

        this.host = this.root.host as HTMLElement;
        this.ul = this.root.querySelector('ul')!;
        this.ul.classList.add(this.type);

        this.ul.onclick = e => {
            const indexStr = (e.target as HTMLElement).closest('li')!.dataset.index;
            if (!indexStr) {
                return;
            }

            const item = this.items[Number(indexStr)];
            this.onClick(item);
            this.close();
        };

        let currentLi: HTMLElement | null = null;
        this.ul.onmouseover = e => {
            const target = e.target as HTMLElement;
            if (target.nodeName !== 'LI') {
                return;
            }

            if (currentLi == target) {
                return;
            }

            currentLi = target;

            if (!target.classList.contains('subMenu')) {
                this.subMenu?.close();
                return;
            }

            this.subMenu?.close();
            this.subMenu = new SubMenuPanel(this.self, currentLi, this.createHtml);

            this.root.appendChild(this.subMenu);

            this.subMenu.onClick = item => {
                this.onClick(item);
                this.subMenu = null;
                this.close();
            };

            const items = this.items[Number(target.dataset.index)].children!;

            this.subMenu.show(items);
            const pos = calcPositionFromParent(this.self, target, this.subMenu);
            this.subMenu.updatePosition(pos);
        };
    }

    show(items?: MenuItem[]) {
        if (items != null) {
            this.items = items;
            const fragment = this.createHtml(this.items);
            this.ul.appendChild(fragment);
            this.hasHtmlCreated = true;
        }

        if (!this.hasHtmlCreated) {
            const fragment = this.createHtml(this.items);
            this.ul.appendChild(fragment);
            this.hasHtmlCreated = true;
        }

        this.host.classList.add('show');
        currentMenuPanel = this.self;
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
        this.subMenu?.close();
        this.host.classList.remove('show');
        currentMenuPanel = null;
        this.onClose();
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

    // for TreeSelect
}

type CreateItem = (item: MenuItem, index: number) => HTMLElement;

const dropDown = (() => {
    function createItem(item: MenuItem, index: number): HTMLElement {
        const li = createCommonMenuItem(item, index);

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

export class SubMenuPanel extends MenuPanel {
    private parent: MenuPanel;

    constructor(parent: MenuPanel, parentLi: HTMLElement, createHtml: CreateMenuItems) {
        super(parent.type, createHtml);
        this.parent = parent;

        this.self.onmouseenter = () => parentLi.classList.add('hover');
        this.self.onmouseleave = () => parentLi.classList.remove('hover');
    }

    close() {
        this.self.remove();
        // this.onClose();
    }
}

const calcPositionFromParent = (
    parent: Element,
    target: Element,
    menu: Element,
    option: PositionOption = { vertical: 'auto', horizontal: 'auto' }
) => {
    const parentRect = parent.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    const { vertical, horizontal } = option;

    let top = 0;
    let left = 0;

    if (
        vertical === 'top' ||
        (vertical === 'auto' && targetRect.top + menuRect.height > window.innerHeight && targetRect.bottom + window.pageYOffset > menuRect.height)
    ) {
        top = targetRect.bottom + window.pageYOffset - menuRect.height;
    } else {
        top = targetRect.top + window.pageYOffset;
    }

    if (horizontal === 'left' || (horizontal === 'auto' && targetRect.right + menuRect.width > window.innerWidth)) {
        left = targetRect.left + window.pageXOffset - menuRect.width;
    } else {
        left = targetRect.right + window.pageXOffset;
    }

    top -= parentRect.top;
    left -= parentRect.left;

    return { top, left };
};

function initialize() {
    customElements.define('rui-menupanel', MenuPanel);
    customElements.define('rui-submenupanel', SubMenuPanel);
}

initialize();
