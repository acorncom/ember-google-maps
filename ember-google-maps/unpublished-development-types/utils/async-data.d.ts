// The value `getAsync()` produces (see utils/async-data.js's PromiseProxy): a
// promise-proxy that is BOTH awaitable to the resolved value AND lets you read
// that value's members directly off it -- those members read `undefined` until
// the underlying promise resolves, hence `Partial<T>`.
//
//   const g = await service.google;   // typeof google (from the Promise half)
//   service.google.maps;              // typeof google.maps | undefined (Partial half)
export type AsyncProxy<T> = Promise<T> & Partial<T>;

// A native getter decorator: wraps the decorated getter's returned promise in
// the proxy above. The decorated getter's own return type documents the
// resolved shape (see services/google-maps-api.d.ts).
export function getAsync(
  prototype: object,
  key: string | symbol,
  desc: PropertyDescriptor,
): { get: (...args: unknown[]) => unknown };
