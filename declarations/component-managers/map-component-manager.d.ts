export function registerMapInstance(id: any, instance: any): void;
export function unregisterMapInstance(id: any): void;
export function clearMapInstances(): void;
export function getMapInstance(id: any): any;
export class MapComponentManager {
    constructor(owner: any);
    googleMapsApi: any;
    get google(): any;
    get isFastBoot(): any;
    capabilities: import("@glimmer/interfaces/lib/managers/component").ComponentCapabilities;
    owner: any;
    fastboot: any;
    createComponent(Class: any, args: any): any;
    destroyComponent(component: any): void;
    getContext(component: any): any;
    setupMapComponent(component: any): undefined;
}
//# sourceMappingURL=map-component-manager.d.ts.map