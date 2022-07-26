import { isDate, triggerEvent } from '../../utility/utility';

const css = `
:host{--theme: #db4d6f;--foreground: #ccc;--background: #3c3c3c;--foreground-outOfMonth: #808080;--background-outOfMonth: #222;--border-color: #222}:host(.dark){--theme: #ccc;--foreground: #ccc;--background: #3c3c3c;--foreground-outOfMonth: #808080;--background-outOfMonth: #222;--border-color: #222}:host(.white){--theme: #333;--foreground: #333;--background: #f2f2f2;--foreground-outOfMonth: #222;--background-outOfMonth: #ccc;--border-color: transparent}:host{position:absolute;left:0;top:0;display:none;background-color:var(--background)}:host(.show){display:block}*{padding:0;margin:0;box-sizing:border-box}.header{height:3rem;display:flex;flex-direction:row;justify-content:space-between}.year,.month,.next,.prev{display:inline-block;width:3rem;line-height:3rem;font-size:1.5rem;font-weight:bold;text-align:center;color:var(--foreground)}.year{width:7rem;outline:none;border:none;background-color:var(--background)}.month{width:5rem}.next,.prev{width:3rem;cursor:pointer}.next:active:not([disabled]),.prev:active:not([disabled]){transform:scale(0.95)}.next:hover,.prev:hover{color:var(--theme)}.weekdays,.days{color:var(--foreground);display:grid;grid-template-columns:repeat(7, 3rem);text-align:right}.weekdays div{color:var(--theme);border-top:solid 1px var(--theme);border-bottom:solid 1px var(--theme);height:2.4rem;line-height:2.4rem;text-align:center;-webkit-user-select:none;-moz-user-select:none;user-select:none}.days{height:auto}.days .day{position:relative;height:3rem;line-height:3rem;text-align:center;color:var(--foreground);border:solid 1px var(--border-color);-webkit-user-select:none;-moz-user-select:none;user-select:none}.days .day.outOfMonth{color:var(--foreground-outOfMonth);background-color:var(--background-outOfMonth)}.days .day.selected,.days .day:hover{font-weight:bold;outline:3px solid var(--theme);outline-offset:-3px;cursor:pointer}
`;
const html = `
<section>
    <div class="header"><span class="prev"><</span><span class="month"></span><input type="number" class="year"><span class="next">></span></div>
    <div class="weekdays"></div>
    <div class="days"></div>
    <div class="footer"></div>
</section>
`;
const template = `<style>${css}</style>${html}`;

type DatePickerOption = {
    format: string;
    dayOfWeek: string[];
    months: string[];
    onSelect: (dateStr: string) => void;
    vertical: 'auto' | 'top' | 'bottom';
    horizontal: 'auto' | 'left' | 'right';
};

export class DatePicker extends HTMLElement {
    private section: HTMLElement;
    private onClick: (e: MouseEvent) => void = () => {};
    private input: HTMLInputElement;
    private selectedDate: Date = new Date();
    private currentDate: Date = new Date();

    private option: DatePickerOption = {
        format: 'yyyy-MM-dd',
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        onSelect: () => {},
        vertical: 'auto',
        horizontal: 'auto',
    };

    constructor(input: HTMLInputElement, _option: Partial<DatePickerOption> | null = null) {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = template;

        this.input = input;
        Object.assign(this.option, _option);

        this.section = this.shadowRoot!.querySelector('section')!;
        this.section.querySelector<HTMLElement>('.weekdays')!.innerHTML = this.option.dayOfWeek.map(x => `<div>${x}</div>`).join('') + `</div>`;

        input.onclick = e => this.show(e);

        this.section.onclick = e => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('day')) {
                const date = new Date();
                date.setTime(+target.dataset.time!);

                const y = date.getFullYear().toString();
                const m = ('00' + (date.getMonth() + 1)).slice(-2);
                const d = ('00' + date.getDate()).slice(-2);
                const dateString = this.option.format.replace('yyyy', y).replace('MM', m).replace('dd', d);

                this.input.value = dateString;

                this.hide();
                triggerEvent('change', this.input);
                this.option.onSelect(dateString);
                return;
            }

            if (target.classList.contains('next')) {
                const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
                this.createDom(date);
                return;
            }
            if (target.classList.contains('prev')) {
                const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
                this.createDom(date);
                return;
            }
        };

        this.section.querySelector<HTMLInputElement>('.year')!.onchange = e => {
            const year = Number((e.target as HTMLInputElement).value);
            const date = new Date(this.currentDate);
            date.setFullYear(year);
            this.createDom(date);
        };
    }

    createDom(date: Date) {
        this.currentDate = date;
        const theFirstDay = new Date(date);
        theFirstDay.setDate(1);

        this.section.querySelector<HTMLInputElement>('.year')!.value = this.currentDate.getFullYear().toString();
        this.section.querySelector<HTMLElement>('.month')!.textContent = this.option.months[this.currentDate.getMonth()];

        const targetDate = new Date(theFirstDay);
        targetDate.setDate(1 - theFirstDay.getDay());

        const theLastDay = new Date(theFirstDay);
        theLastDay.setMonth(theFirstDay.getMonth() + 1);
        theLastDay.setDate(0);

        let html = ``;
        while (targetDate <= theLastDay) {
            for (let i = 0; i < 7; i++) {
                const isOutOfMonth = targetDate < theFirstDay || targetDate > theLastDay;

                html += `<div class="day ${isOutOfMonth ? 'outOfMonth' : ''}  ${
                    targetDate.getTime() == this.selectedDate.getTime() ? 'selected' : ''
                }" data-time="${targetDate.getTime()}">${targetDate.getDate()}</div>`;
                targetDate.setDate(targetDate.getDate() + 1);
            }
        }

        this.section.querySelector('.days')!.innerHTML = html;
    }

    show(e: MouseEvent) {
        const value = (e.target as HTMLInputElement).value;
        const date = isDate(value) ? new Date(value) : new Date();
        date.setHours(0, 0, 0, 0);

        this.selectedDate = date;

        this.createDom(date);

        this.updatePosition();

        this.onClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (!target) {
                return;
            }

            if (target.closest('date-picker') || target === this.input) {
                return;
            }

            this.hide();
        };

        document.addEventListener('click', this.onClick);
    }

    hide() {
        (this.shadowRoot!.host as HTMLElement).classList.remove('show');
        document.removeEventListener('click', this.onClick);
    }

    updatePosition() {
        // set show class for getBoundingClientRect
        (this.shadowRoot!.host as HTMLElement).classList.add('show');

        const inputRect = this.input!.getBoundingClientRect();
        const calendarRect = this.section.getBoundingClientRect();

        let top = 0;
        let left = 0;

        if (
            this.option.vertical === 'top' ||
            (this.option.vertical === 'auto' &&
                inputRect.bottom + calendarRect.height > window.innerHeight &&
                window.pageYOffset > calendarRect.height)
        ) {
            top = inputRect.top + window.pageYOffset - calendarRect.height;
        } else {
            top = inputRect.bottom + window.pageYOffset;
        }

        if (this.option.horizontal === 'right' || (this.option.horizontal === 'auto' && inputRect.left + calendarRect.width > window.innerWidth)) {
            left = inputRect.right + window.pageXOffset - calendarRect.width;
        } else {
            left = inputRect.left + window.pageXOffset;
        }

        (this.shadowRoot!.host as HTMLElement).style.top = top + 'px';
        (this.shadowRoot!.host as HTMLElement).style.left = left + 'px';
    }
}

customElements.define('date-picker', DatePicker);
