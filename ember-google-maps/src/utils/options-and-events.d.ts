export declare class OptionsAndEvents {
  options: Record<string, unknown>;
  events: Record<string, unknown>;
  constructor(args: Record<string, unknown>);
}

export declare function addEventListeners(
  target: object,
  events?: Record<string, unknown>,
  payload?: object,
): Array<{ name: string; listener: unknown; remove: () => void }>;
