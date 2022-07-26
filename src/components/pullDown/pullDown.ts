import { calcPosition, calcPositionFromPoint, MenuItem, PositionOption } from '../helper';
import { MenuPanel } from '../menuPanel/menuPanel';

const css = `
`;
const html = `
`;

const template = `<style>${css}</style>${html}`;

let currentContextMenu: PullDown | null = null;

export type PullDownOption = {
    event: string;
    width: string;
    onSelect: (item: MenuItem) => void; // イベントの一律設定用。メニューごとに個別処理になる場合はMenuItemのonClickへ

    predicate?: (e: MouseEvent) => boolean;
    onShow?: (e: MouseEvent) => void;
    onClick?: (e: MouseEvent) => void;
    onClose?: () => void;
    setPosition?: (e: MouseEvent) => HTMLElement;
};

const defaultOption = {
    event: 'contextmenu',
    width: '20rem',
    onSelect: () => {},

    predicate: undefined,
    onShow: undefined,
    onClick: undefined,
    onClose: undefined,
    setPosition: undefined,
};

export class PullDown extends HTMLElement {
    private self: PullDown;
    private root: ShadowRoot;
    private host: HTMLElement;
    private menu: MenuPanel;
    private items: MenuItem[] = [];
    private option: PullDownOption;

    private position: PositionOption = {
        vertical: 'auto',
        horizontal: 'auto',
    };

    constructor(element: HTMLElement, items: MenuItem[], userOption?: Partial<PullDownOption>) {
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

            if (this.option.setPosition != null) {
                const width = (e.target as HTMLElement)!.offsetWidth;
                this.menu.style.width = width + 'px';
            }

            // todo fix as cast
            this.show(e as MouseEvent);
        });
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
        if (this.option.setPosition != null) {
            const { left, top } = calcPosition(this.option.setPosition(e), this.menu, this.position);
            this.menu.updatePosition({ left, top });
        } else {
            const { left, top } = calcPositionFromPoint(e, this.menu, this.position);
            this.menu.updatePosition({ left, top });
        }
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
    customElements.define('rui-pulldown', PullDown);
    document.addEventListener('mouseup', function (e) {
        if ((e.target as HTMLElement).closest('rui-pulldown')) {
            return;
        }

        closeMenuPanel();
    });
}

initialize();
