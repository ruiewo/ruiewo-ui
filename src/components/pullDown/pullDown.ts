import { isNullOrWhiteSpace } from '../../utility/utility';
import { calcPosition, createCommonMenuItem, MenuItem, PositionOption } from '../helper';
import { MenuPanel } from '../menuPanel/menuPanel';

const css = `
`;
const html = `
`;

const template = `<style>${css}</style>${html}`;

let currentContextMenu: PullDown | null = null;

export type PullDownOption = {
    event: string;
    valueKey: string;
    textKey: string;
    useBlank: boolean;
    onSelect: (item: MenuItem) => void; // イベントの一律設定用。メニューごとに個別処理になる場合はMenuItemのonClickへ

    predicate?: (e: MouseEvent) => boolean;
    setPosition?: (e: MouseEvent) => HTMLElement;
};

const defaultOption = {
    event: 'contextmenu',
    valueKey: 'value',
    textKey: 'text',
    useBlank: false,
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
    private positionTarget: HTMLElement | null = null;

    private position: PositionOption = {
        vertical: 'auto',
        horizontal: 'auto',
    };

    constructor(element: HTMLElement, items: any[], userOption?: Partial<PullDownOption>) {
        super();
        this.self = this;
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = template;

        this.host = this.root.host as HTMLElement;

        this.option = Object.assign({}, defaultOption, userOption);
        this.items = this.convert(items);

        this.menu = new MenuPanel('dropDown', createHtml);
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

        this.positionTarget = this.option.setPosition!(e);
        if (this.positionTarget == null) {
            return;
        }

        this.menu.show(this.items);
        currentContextMenu = this.self;

        this.updatePosition();
    }

    updatePosition() {
        const width = this.positionTarget!.offsetWidth;
        this.menu.style.width = width + 'px';
        const height = this.positionTarget!.offsetHeight;
        this.menu.style.setProperty('--height', height + 'px');

        const { left, top } = calcPosition(this.positionTarget!, this.menu, this.position);
        this.menu.updatePosition({ left, top });
    }

    close() {
        this.menu.close();
        this.positionTarget = null;
    }

    changeItems(items: any[]) {
        this.items = this.convert(items);
        if (this.positionTarget == null) {
            return;
        }

        this.menu.show(this.items);
        currentContextMenu = this.self;

        this.updatePosition();
    }

    convert(items: any[]): MenuItem[] {
        const menuItems = items.map(x => {
            if (x.type === 'divisor') {
                return { text: '', value: '', type: 'divisor' };
            }

            const text = isNullOrWhiteSpace(this.option.textKey) ? (x as string) : (x[this.option.textKey!] as string);
            const value = isNullOrWhiteSpace(this.option.valueKey) ? (x as string) : (x[this.option.valueKey!] as string);
            if (x.children != null) {
                const children = this.convert(x.children);

                return { text, value, children };
            } else {
                return { text, value };
            }
        });

        if (this.option.useBlank) {
            menuItems.unshift({ text: '', value: '' });
        }

        return menuItems as MenuItem[];
    }
}

function closeMenuPanel() {
    if (currentContextMenu != null) {
        currentContextMenu.close();
    }
}

function createHtml(items: MenuItem[]): DocumentFragment {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < items.length; i++) {
        const li = createCommonMenuItem(items[i], i);
        li.classList.add('dropDown');
        fragment.append(li);
    }

    return fragment;
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
