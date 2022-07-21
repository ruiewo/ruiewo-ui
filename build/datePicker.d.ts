declare type DatePickerOption = {
    format: string;
    dayOfWeek: string[];
    months: string[];
    onSelect: (dateStr: string) => void;
    vertical: 'auto' | 'top' | 'bottom';
    horizontal: 'auto' | 'left' | 'right';
};
declare class DatePicker extends HTMLElement {
    private section;
    private onClick;
    private input;
    private selectedDate;
    private currentDate;
    private option;
    constructor(input: HTMLInputElement, _option?: Partial<DatePickerOption> | null);
    createDom(date: Date): void;
    show(e: MouseEvent): void;
    hide(): void;
    updatePosition(): void;
}
export { DatePicker };
