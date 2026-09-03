import type Owner from '@ember/owner';
import type {
  Arguments,
  ComponentCapabilities,
  ComponentManager,
} from '@glimmer/interfaces';

export declare class MapComponentManager implements ComponentManager<unknown> {
  capabilities: ComponentCapabilities;

  constructor(owner: Owner);

  createComponent(factory: object, args: Arguments): unknown;
  destroyComponent(instance: unknown): void;
  getContext(instance: unknown): unknown;
}
