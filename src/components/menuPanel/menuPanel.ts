import { MenuItem } from '../helper';

let currentMenuPanel: MenuPanel | null = null;

export class MenuPanel extends HTMLElement {
    private self: MenuPanel;
    private root: ShadowRoot;
    private host: HTMLElement;
    private ul: HTMLElement;
    private items: MenuItem[] = [];

    constructor() {
        super();
        this.self = this;
        this.root = this.attachShadow({ mode: 'closed' });
        this.host = this.root.host as HTMLElement;
        this.ul = this.root.querySelector('ul')!;
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
            const itemContainer = this.createItemElement(items[i]);
            this.ul.appendChild(itemContainer);
        }
    }

    createItemElement(item: MenuItem) {
        if (item.type && (item.type == 'line' || item.type == 'divisor')) {
            return document.createElement('hr');
        }

        const li = document.createElement('li');
        const label = document.createElement('span');
        label.textContent = item.text;

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
