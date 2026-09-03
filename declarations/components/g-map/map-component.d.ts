import type Owner from '@ember/owner';
import type { ComponentLike } from '@glint/template';
import type { Context } from '@glint/template/-private/integration';
import type { TemplateContext, FlattenBlockParams } from '@glint/template/-private/integration';
import type { ComponentSignatureArgs, ComponentSignatureBlocks, ComponentSignatureElement } from '@glint/template/-private/signature';
export declare function combine(base: object, extra: object): object;
export declare function MapComponentAPI(source: {
    name?: string;
    map?: unknown;
    mapComponent?: unknown;
}): {
    [x: string]: unknown;
    readonly map: unknown;
    readonly mapComponent: unknown;
};
export interface MapComponentSignature {
    Args: Record<string, unknown>;
    Blocks: {
        default: [publicAPI: unknown];
    };
    Element: null;
}
export type MapComponentEventArgs = {
    [key: `on${string}`]: ((...args: any[]) => void) | undefined;
};
type ComponentContext<This, S> = TemplateContext<This, ComponentSignatureArgs<S>['Named'], FlattenBlockParams<ComponentSignatureBlocks<S>>, ComponentSignatureElement<S>>;
export default class MapComponent<S = MapComponentSignature> {
    mapComponent: unknown;
    boundEvents: Array<{
        remove: () => void;
    }>;
    args: ComponentSignatureArgs<S>['Named'];
    options: Record<string, unknown>;
    events: Record<string, unknown>;
    onTeardown?: () => void;
    get publicAPI(): {
        [name]: unknown;
        readonly map: unknown;
        readonly mapComponent: unknown;
    };
    get map(): google.maps.Map | undefined;
    get mapContext(): unknown;
    constructor(owner: Owner, args: ComponentSignatureArgs<S>['Named'], options: Record<string, unknown>, events: Record<string, unknown>);
    setup(): unknown;
    teardown(mapComponent: {
        setMap?: (map: null) => void;
    }): void;
    register(): void;
    addEventsToMapComponent(mapComponent: object, events?: Record<string, unknown>, payload?: object): void;
}
export default interface MapComponent<S> extends InstanceType<ComponentLike<S>> {
    [Context]: ComponentContext<this, S>;
}
export {};
//# sourceMappingURL=map-component.d.ts.map