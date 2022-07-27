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
    setPosition?: (e: MouseEvent) => HTMLElement;
};

const defaultOption = {
    event: 'contextmenu',
    width: '20rem',
    onSelect: () => {},

    predicate: undefined,
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

        this.menu = new MenuPanel('dropDown');
        this.root.appendChild(this.menu);

        this.menu.onClick = item => {
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

            if (typeof this.option.setPosition != 'function') {
                return;
            }

            // todo fix as cast
            this.show(e as MouseEvent);
        });
    }

    private show(e: MouseEvent) {
        closeMenuPanel();

        this.menu.show(this.items);
        currentContextMenu = this.self;

        this.updatePosition(e);
    }

    updatePosition(e: MouseEvent) {
        const target = this.option.setPosition!(e as MouseEvent);

        const width = target.offsetWidth;
        this.menu.style.width = width + 'px';
        const height = target.offsetHeight;
        this.menu.style.setProperty('--height', height + 'px');

        const { left, top } = calcPosition(target, this.menu, this.position);
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
    customElements.define('rui-pulldown', PullDown);
    document.addEventListener('mouseup', function (e) {
        if ((e.target as HTMLElement).closest('rui-pulldown')) {
            return;
        }

        closeMenuPanel();
    });
}

initialize();
