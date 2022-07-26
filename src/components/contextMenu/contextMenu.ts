import { calcPositionFromPoint, MenuItem, PositionOption } from '../helper';
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
    onShow?: (e: MouseEvent) => void;
    onClick?: (e: MouseEvent) => void;
    onClose?: () => void;
};

const defaultOption = {
    event: 'contextmenu',
    width: '20rem',
    onSelect: () => {},

    predicate: undefined,
    onShow: undefined,
    onClick: undefined,
    onClose: undefined,
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

        this.menu = new MenuPanel('contextMenu');
        this.root.appendChild(this.menu);

        this.menu.onClick = item => {
            this.option.onSelect(item);
        };

        this.menu.onClose = () => {
            if (this.option.onClose != null) {
                this.option.onClose();
            }
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

        // this.input.onkeydown = e => {
        //     const keyCode = e.code;

        //     switch (keyCode) {
        //         case 'Enter':
        //             this.menu.select();
        //             break;
        //         case 'ArrowDown':
        //             this.menu.selectNext();
        //             break;
        //         case 'ArrowUp':
        //             this.menu.selectPrev();
        //             break;
        //         default:
        //             break;
        //     }
        // };
    }

    show(e: MouseEvent) {
        closeMenuPanel();

        if (this.option.onShow != null) {
            this.option.onShow(e);
        }

        this.menu.show(this.items);
        currentContextMenu = this.self;

        this.updatePosition(e);
    }

    updatePosition(e: MouseEvent) {
        const { left, top } = calcPositionFromPoint(e, this.menu, this.position);
        this.menu.updatePosition({ left, top });
    }

    close() {
        this.menu.close();
    }
}

function closeMenuPanel() {
    if (currentContextMenu != null) {
        currentContextMenu.close();
    }
}

function initialize() {
    customElements.define('rui-contextmenu', ContextMenu);
    document.addEventListener('mouseup', function (e) {
        if ((e.target as HTMLElement).closest('rui-contextmenu')) {
            return;
        }

        closeMenuPanel();
    });
}

initialize();
