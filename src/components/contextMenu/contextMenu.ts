import { calcPositionFromPoint, createCommonMenuItem, MenuItem, PositionOption } from '../helper';
import { MenuPanel } from '../menuPanel/menuPanel';

const css = `
`;
const html = `
`;

const template = `<style>${css}</style>${html}`;

let currentContextMenu: ContextMenu | null = null;

export type ContextMenuOption = {
    event: string;
    width: string;
    onSelect: (item: MenuItem) => void; // イベントの一律設定用。メニューごとに個別処理になる場合はMenuItemのonClickへ

    predicate?: (e: MouseEvent) => boolean;
};

const defaultOption = {
    event: 'contextmenu',
    width: '20rem',
    onSelect: () => {},

    predicate: undefined,
};

export class ContextMenu extends HTMLElement {
    private self: ContextMenu;
    private root: ShadowRoot;
    private host: HTMLElement;
    private menu: MenuPanel;
    private items: MenuItem[] = [];
    private option: ContextMenuOption;

    private position: PositionOption = {
        vertical: 'auto',
        horizontal: 'auto',
    };

    constructor(element: HTMLElement, items: MenuItem[], userOption?: Partial<ContextMenuOption>) {
        super();
        this.self = this;
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = template;

        this.host = this.root.host as HTMLElement;

        this.option = Object.assign({}, defaultOption, userOption);
        this.host.style.width = this.option.width;

        this.items = items;

        this.menu = new MenuPanel('contextMenu', functions.createHtml);
        this.root.appendChild(this.menu);

        this.menu.onClick = item => {
            if (item.children != null) {
                return; // 最下層以外のクリックは無視する。
            }

            this.option.onSelect(item);
        };

        this.menu.onClose = () => {
            currentContextMenu = null;
        };

        element.addEventListener(this.option.event, e => {
            e.preventDefault();

            if (this.option.predicate != null && !this.option.predicate(e as MouseEvent)) {
                return;
            }

            // todo fix as cast
            this.show(e as MouseEvent);
        });
    }

    private show(e: MouseEvent, itemsChanged = false) {
        functions.closeMenuPanel();

        if (!this.menu.hasRendered || itemsChanged) {
            this.menu.show(this.items);
        } else {
            this.menu.show();
        }

        currentContextMenu = this.self;

        this.updatePosition(e);
    }

    private updatePosition(e: MouseEvent) {
        const { left, top } = calcPositionFromPoint(e, this.menu, this.position);
        this.menu.updatePosition({ left, top });
    }

    close() {
        this.menu.close();
    }
}

const functions = (() => {
    function closeMenuPanel() {
        if (currentContextMenu != null) {
            currentContextMenu.close();
        }
    }

    function createHtml(items: MenuItem[]): DocumentFragment {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < items.length; i++) {
            const li = createCommonMenuItem(items[i], i);
            li.classList.add('contextMenu');
            fragment.append(li);
        }

        return fragment;
    }
    return {
        createHtml,
        closeMenuPanel,
    };
})();

function initialize() {
    customElements.define('rui-contextmenu', ContextMenu);
    document.addEventListener('mouseup', function (e) {
        if ((e.target as HTMLElement).closest('rui-contextmenu')) {
            return;
        }

        functions.closeMenuPanel();
    });
}

initialize();
