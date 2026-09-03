export function addEventListener(target: any, originalEventName: any, action: any, payload?: {}): {
    name: any;
    listener: void | google.maps.MapsEventListener;
    remove: () => any;
};
/**
 * Add event listeners on a target object using the cross-browser event
 * listener library provided by the Google Maps API.
 *
 * @param {Object} target
 * @param {Events} events
 * @param {[Object]} payload = {} An optional object of additional parameters
 *     to include with the event payload.
 * @return {google.maps.MapsEventListener[]} An array of bound event listeners
 *     that should be used to remove the listeners when no longer needed.
 */
export function addEventListeners(target: Object, events: Events, payload?: [Object]): google.maps.MapsEventListener[];
export const ignoredOptions: string[];
export class OptionsAndEvents {
    constructor(args: any);
    whosThatProp: Map<any, any>;
    args: any;
    ignoredSet: Set<string>;
    options: any;
    events: any;
    getFromArgs(prop: any): any;
    parse(): void;
    identify(prop: any): typeof IGNORED | typeof EVENT | typeof OPTION | typeof OPTIONS | typeof EVENTS;
    isEvent(prop: any): any;
    isIgnored(prop: any): boolean;
    [OPTION]: Set<any>;
    [EVENT]: Set<any>;
}
declare const IGNORED: unique symbol;
declare const EVENT: unique symbol;
declare const OPTION: unique symbol;
declare const OPTIONS: unique symbol;
declare const EVENTS: unique symbol;
export {};
//# sourceMappingURL=options-and-events.d.ts.map