import { calcPositionFromPoint, MenuItem, PositionOption } from '../helper';
import { MenuPanel } from '../menuPanel/menuPanel';

const css = `
`;
const html = `
`;

const template = `<style>${css}</style>${html}`;

let currentContextMenu: ContextMenu | null = null;

export type ContextMenuOption = {
    width: string;
    onSelect: (value: string) => void;
};

const defaultOption = {
    width: '20rem',
    onSelect: () => {},
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

        this.menu = new MenuPanel('ContextMenu');
        this.root.appendChild(this.menu);

        this.menu.onClose = () => {
            currentContextMenu = null;
        };

        element.addEventListener('contextmenu', e => {
            e.preventDefault();
            this.show(e);
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

        this.menu.show(this.items);
        currentContextMenu = this.self;

        console.log('show rui-context');

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
