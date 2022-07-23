import { MenuItem } from '../helper';

const css = `
:host{--color: var(--foreground-color);--color-hover: #eee;--background: var(--active-background-color);--background-hover: var(--lightDark-theme-color);--arrow-color: var(--foreground-color);--arrow-color-hover: #eee;--shadow-color: #fff5;--twSelectHeight: 3rem;--twSelectFontSize: 1.5rem;--twSelectPlaceholder: dimgray;--twSelectBackground: transparent;--twSelectFocusBackground: var(--active-background-color);--twSelectLeftBorder: dimgray;--twSelectBottomBorder: 2px solid var(--foreground-color);--twSelectFocusBottomBorderColor: var(--theme-color)}*{padding:0;margin:0;box-sizing:border-box}ul{position:absolute;top:100%;display:none;list-style-type:none;text-align:left;background-color:var(--twSelectListBackground);width:100%;max-height:calc(var(--twSelectHeight)*8);overflow-y:auto;z-index:1;box-shadow:0 3px 7px -2px rgba(0,0,0,.4)}:host(.show) ul{display:block}li{display:block;position:relative;margin:0;padding:0;white-space:nowrap}li:hover{color:var(--color-hover);background:var(--background-hover)}li.disabled{opacity:.5;pointer-events:none;cursor:default}li.hidden{display:none}li{display:block;width:100%;padding:.4rem .7rem;color:var(--color);border:1px solid rgba(0,0,0,0);font-size:1rem;text-align:left;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none;border-left:.3rem solid rgba(0,0,0,0)}li.selected{border-left-color:var(--twSelectLeftBorder)}li.dropDown{padding:0 .5rem;font-size:inherit;line-height:inherit}span{margin-left:2.2rem}i{position:absolute;left:.5rem;width:2rem;height:2rem;top:50%;transform:translateY(-50%);background-position:right;background-repeat:no-repeat;background-size:contain}hr{display:block;margin:7px 5px;height:1px;background-color:var(--color)}li.subMenu::after{content:"";position:absolute;right:6px;top:50%;transform:translateY(-50%);border:5px solid rgba(0,0,0,0);border-left-color:var(--arrow-color)}li.subMenu:hover::after{border-left-color:var(--arrow-color-hover)}ul ul{top:4px;left:99%}.active>ul{display:block;-webkit-animation:fadeInUp 400ms;animation:fadeInUp 400ms}li:hover>ul{display:block;-webkit-animation:fadeInUp 400ms;animation:fadeInUp 400ms}@-webkit-keyframes fadeInUp{from{opacity:0;transform:translate3d(0, calc(var(--twSelectHeight) * 0.6), 0)}to{opacity:1;transform:none}}@keyframes fadeInUp{from{opacity:0;transform:translate3d(0, calc(var(--twSelectHeight) * 0.6), 0)}to{opacity:1;transform:none}}@-webkit-keyframes fadeOut{from{opacity:1}to{opacity:0}}@keyframes fadeOut{from{opacity:1}to{opacity:0}}
`;
const html = `
<ul class="wrapper"></ul>
`;
const template = `<style>${css}</style>${html}`;

let currentMenuPanel: MenuPanel | null = null;

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
            const indexStr = (e.target as HTMLElement).dataset.index;
            if (!indexStr) {
                return;
            }

            this.onClick(this.items[Number(indexStr)]);
        };
    }

    show(items: MenuItem[]) {
        this.items = items;
        this.create(items);

        this.host.classList.add('show');
        currentMenuPanel = this.self;
    }

    create(items: MenuItem[]) {
        this.ul.innerHTML = '';

        for (let i = 0; i < items.length; i++) {
            const itemContainer = this.createItemElement(items[i], i);
            this.ul.appendChild(itemContainer);
        }
    }

    createItemElement(item: MenuItem, index: number) {
        if (item.type && (item.type == 'line' || item.type == 'divisor')) {
            return document.createElement('hr');
        }

        const li = document.createElement('li');
        const label = document.createElement('span');
        label.textContent = item.text;
        li.setAttribute('data-index', index.toString());

        li.classList.add('dropDown');

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

    updatePosition({ left, top }: { left: number; top: number }) {
        this.host.style.top = top + 'px';
        this.host.style.left = left + 'px';
    }

    close() {
        this.host.classList.remove('show');
        currentMenuPanel = null;
    }
}
function initialize() {
    customElements.define('menu-panel', MenuPanel);
    // document.addEventListener('mouseup', function (e) {
    //     if ((e.target as HTMLElement).closest('menu-panel')) {
    //         return;
    //     }

    //     closeMenuPanel();
    // });
}
initialize();
