export declare const range: (from: number, to: number) => Generator<number, void, unknown>;
export declare const triggerEvent: (event: string, element: HTMLElement) => boolean;
export declare const isNullOrWhiteSpace: (input: string | null | undefined) => boolean;
export declare const isNumber: (value: any) => boolean;
export declare const removeAllChildNode: (parent: HTMLElement) => void;
export declare const htmlToElement: (html: string) => Element;
export declare function escapedRegex(string: string, flag: string): RegExp;
export declare class DateEx extends Date {
    toDateString(): string;
    toDatetimeString(): string;
    toTimeString(): string;
    addMonths(months: number): this;
    addDays(days: number): this;
    addHours(hours: number, mins: number, seconds: number): this;
    toLocalISOString(): string;
}
export declare const isDate: (v: string | number) => boolean;
export declare class InputUtil {
    static tryConvertToFullDate(input: HTMLInputElement, useTheLastYear?: boolean): boolean;
    static formatToFullDateString(text: string, useTheLastYear?: boolean): string | null;
    static tryConvertToTime(input: HTMLInputElement): boolean;
    static formatToTimeString(text: string): string | null;
}
