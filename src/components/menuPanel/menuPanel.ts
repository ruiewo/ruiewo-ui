import { MenuItem, PositionOption } from '../helper';

const css = `
:host{--foreground: #ccc;--foreground-hover: #eee;--background: #3c3c3c;--background-hover: rgb(168, 54, 71);--arrow-color: #ccc;--arrow-color-hover: #eee;--shadow-color: #fff5;--height: 3rem;--fontSize: 1.5rem;--leftBorder: dimgray;--expanderWidth: var(--fontSize);--expanderBorderWidth: calc(var(--expanderWidth) * 0.5);--focus-theme-color: #db4d6f}:host{position:absolute;display:block;width:inherit;z-index:1}:host(.dropDown){--height: inherit;--fontSize: inherit}*{padding:0;margin:0;box-sizing:border-box}ul{display:none;list-style-type:none;text-align:left;background-color:var(--background);width:inherit;max-height:calc(var(--height)*8);overflow-y:auto;z-index:1;box-shadow:0 3px 7px -2px rgba(0,0,0,.4)}:host(.show) ul{display:block}ul.contextMenu{padding:.3rem 0;box-shadow:0px 0px 4px var(--shadow-color)}li{display:block;position:relative;margin:0;padding:0;white-space:nowrap}li.hover,li:hover{color:var(--foreground-hover);background:var(--background-hover)}li.disabled{opacity:.5;pointer-events:none;cursor:default}li.hidden{display:none}li{display:block;width:100%;height:var(--height);padding:.4rem .7rem;color:var(--foreground);font-size:var(--fontSize);text-align:left;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none}li.dropDown{padding:0 .5em;font-size:inherit;line-height:inherit;border-left:.3rem solid rgba(0,0,0,0)}li.dropDown.selected{border-left-color:var(--leftBorder)}li.dropDown span{margin-left:0;height:var(--height);line-height:var(--height)}li.dropDown i{display:none}li.contextMenu{height:unset;padding:.4rem .7rem;font-size:1rem}li.contextMenu span{margin-left:2.2rem}li.contextMenu i{position:absolute;left:.5rem;width:2rem;height:2rem;top:50%;transform:translateY(-50%);background-position:right;background-repeat:no-repeat;background-size:contain}ul.treeSelect{padding-left:5px !important}.buttons{display:flex;flex-direction:row;justify-content:space-around;min-height:30px;padding:.5rem 0}.buttons button{width:8rem;height:2rem;line-height:2rem;padding:0 1rem}li.treeSelect{height:auto;min-height:var(--height);padding:0}li.treeSelect:hover{background-color:var(--background-hover)}li.treeSelect>span{height:var(--height);line-height:var(--height);vertical-align:middle}li.treeSelect .expander{display:inline-block;vertical-align:middle;width:var(--expanderWidth);cursor:pointer;position:relative;transition:transform 150ms ease-out}li.treeSelect .expander:before{position:absolute;top:var(--expanderBorderWidth);display:block;content:"";border:var(--expanderBorderWidth) solid rgba(0,0,0,0);border-top:var(--expanderBorderWidth) solid var(--foreground);transition:border-color 150ms}li.treeSelect .expander:hover:before{border-top:var(--expanderBorderWidth) solid var(--focus-theme-color)}li.treeSelect.closed>.expander{transform:rotate(-90deg)}li.treeSelect.closed>.treeSelectList{display:none}li.treeSelect .checkbox{display:inline-block;vertical-align:middle;width:20px;height:20px;cursor:pointer;position:relative}li.treeSelect .checkbox:before{transition:all .3s;cursor:pointer;position:absolute;inset:0;margin:auto;content:"";display:block;width:18px;height:18px;border:1px solid var(--foreground);border-radius:2px}li.treeSelect.bottomLayer>.checkbox{margin-left:var(--fontSize)}li.treeSelect .checkbox:hover:before{box-shadow:0 0 2px 1px #1890ff}li.treeSelect.checked>.checkbox:before{background-color:#1890ff;border-color:#1890ff}li.treeSelect.checked>.checkbox:after{position:absolute;content:"";display:block;top:-1px;bottom:0;left:0;right:0;margin:auto;width:5px;height:9px;border:2px solid #fff;border-top:none;border-left:none;transform:rotate(45deg)}li.treeSelect.halfChecked>.checkbox:before{background-color:#1890ff;border-color:#1890ff}li.treeSelect.halfChecked>.checkbox:after{position:absolute;content:"";display:block;inset:0;margin:auto;width:10px;height:2px;background-color:#fff}li.treeSelect .label{padding:0 5px;display:inline-block;width:calc(100% - 40px)}li.treeSelect .treeSelectList{padding-left:20px;height:auto;max-height:unset}hr{display:block;margin:7px 5px;height:1px;background-color:var(--foreground)}li.subMenu::after{content:"";position:absolute;right:6px;top:50%;transform:translateY(-50%);border:5px solid rgba(0,0,0,0);border-left-color:var(--arrow-color)}li.subMenu:hover::after{border-left-color:var(--arrow-color-hover)}:host(.show)>ul{display:block;-webkit-animation:fadeInUp 400ms;animation:fadeInUp 400ms}@-webkit-keyframes fadeInUp{from{opacity:0;transform:translate3d(0, calc(var(--height) * 0.6), 0)}to{opacity:1;transform:none}}@keyframes fadeInUp{from{opacity:0;transform:translate3d(0, calc(var(--height) * 0.6), 0)}to{opacity:1;transform:none}}@-webkit-keyframes fadeOut{from{opacity:1}to{opacity:0}}@keyframes fadeOut{from{opacity:1}to{opacity:0}}*,*::after,*::before{box-sizing:border-box}button{position:relative;border:none;font-size:1.6rem;transition:color .5s,transform .2s,background-color .2s;outline:none;border-radius:.3rem;margin:0 .5rem;padding:.8rem 1.5rem;-webkit-user-select:none;-moz-user-select:none;user-select:none}button:active{transform:translateY(0.3rem)}.shrinkButton{background-color:#db4d6f;color:#cc2950;color:#f5ccd6}.shrinkButton:hover{color:#e6e6e6}.shrinkButton::after,.shrinkButton::before{content:"";position:absolute;top:0;left:0;width:100%;height:100%;border-radius:.3rem}.shrinkButton::before{border:.3rem solid #cc2950;transition:opacity .3s}.shrinkButton:hover::before{opacity:0}.shrinkButton::after{background-color:rgba(0,0,0,0);border:.3rem solid #e6e6e6;opacity:0;transform:scaleX(1.1) scaleY(1.3);transition:transform .3s,opacity .3s}.shrinkButton:hover::after{opacity:1;transform:scaleX(1) scaleY(1)}.hoverEffect{position:relative}.hoverEffect::after,.hoverEffect::before{content:"";position:absolute;top:0;left:0;width:100%;height:100%;border-radius:inherit}.hoverEffect::before{border:.3rem solid rgba(0,0,0,0);transition:opacity .3s}.hoverEffect:hover::before{opacity:0}.hoverEffect::after{background-color:rgba(0,0,0,0);border:.3rem solid #8c8c8c;opacity:0;transform:scaleX(1.1) scaleY(1.3);transition:transform .3s,opacity .3s}.hoverEffect:hover::after{opacity:1;transform:scaleX(1) scaleY(1)}.shrinkButton.gray{background-color:#949494;color:#7b7b7b;color:#e1e1e1}.shrinkButton.gray:hover{color:#e6e6e6}.shrinkButton.gray::before{border:.3rem solid #7b7b7b}.shrinkButton.gray::after{border:.3rem solid #e6e6e6}
`;
const html = `
<ul class="wrapper"></ul>
`;
const template = `<style>${css}</style>${html}`;

const darkStyle = `
:host {
    --foreground: #ccc;
    --foreground-hover: #eee;
    --background: #3c3c3c;
    --background-hover: #555;
    --arrow-color: #ccc;
    --arrow-color-hover: #eee;
    --shadow-color: #fff5;

    /* dropDown */
    --leftBorder: dimgray;

    /* treeSelect */
    --expander-color-hover: #eee;
}`;

const lightStyle = `
:host {
    --foreground: #333;
    --foreground-hover: #333;
    --background: #f2f2f2;
    --background-hover: #ddd;
    --arrow-color: #333;
    --arrow-color-hover: #111;
    --shadow-color: #fff5;

    /* dropDown */
    --leftBorder: dimgray;

    /* treeSelect */
    --expander-color-hover: #333;
}`;

let currentMenuPanel: MenuPanel | null = null;

type MenuType = 'dropDown' | 'contextMenu' | 'treeSelect';
type CreateMenuItems = (items: MenuItem[]) => DocumentFragment;

export type ColorTheme = 'dark' | 'light';

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
    public hasRendered = false;

    private colorTheme?: ColorTheme;

    constructor(type: MenuType, createHtml: CreateMenuItems, colorTheme?: ColorTheme) {
        super();
        this.type = type;
        this.self = this;
        this.self.classList.add(this.type);
        this.root = this.attachShadow({ mode: 'open' });
        const optionalStyle = colorTheme == undefined ? '' : colorTheme === 'dark' ? darkStyle : colorTheme === 'light' ? lightStyle : '';
        this.root.innerHTML = `<style>${css}${optionalStyle}</style>${html}`;
        this.createHtml = createHtml;
        this.colorTheme = colorTheme;

        this.host = this.root.host as HTMLElement;
        this.ul = this.root.querySelector('ul')!;
        this.ul.classList.add(this.type);

        this.ul.onclick = e => {
            const indexStr = (e.target as HTMLElement).closest('li')?.dataset.index;
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
            this.subMenu = new SubMenuPanel(this.self, currentLi, this.createHtml, this.colorTheme);

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

    render(items: MenuItem[]) {
        this.ul.innerHTML = '';
        const fragment = this.createHtml(items);
        this.ul.appendChild(fragment);
        this.hasRendered = true;
    }

    show(items?: MenuItem[]) {
        if (items != null) {
            this.items = items;
            this.render(this.items);
        }

        if (!this.hasRendered) {
            this.render(this.items);
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
}

export class SubMenuPanel extends MenuPanel {
    private parent: MenuPanel;

    constructor(parent: MenuPanel, parentLi: HTMLElement, createHtml: CreateMenuItems, optionalStyle?: ColorTheme) {
        super(parent.type, createHtml, optionalStyle);
        this.parent = parent;

        this.self.onmouseenter = () => parentLi.classList.add('hover');
        this.self.onmouseleave = () => parentLi.classList.remove('hover');
    }

    close() {
        this.parent.ul.querySelectorAll('.hover').forEach(x => x.classList.remove('hover'));
        this.self.remove();
    }
}

/**
 * Relativeな親からの相対位置を求める。
 */
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
