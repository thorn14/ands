/**
 * @module brand
 * @description Branded (opaque) type primitives for compile-time ID safety.
 *
 * Agents: Use `Brand<T, K>` to create opaque ID types that cannot be
 * accidentally misaligned. `UserId` and `OrderId` are distinct types at
 * compile time even though both are strings at runtime.
 *
 * @example
 * ```ts
 * const userId = brand<UserId>('user-123');
 * const orderId = brand<OrderId>('order-456');
 * // Type error: Argument of type 'UserId' is not assignable to 'OrderId'
 * processOrder(userId); // ← caught at compile time
 * ```
 */

declare const __brand: unique symbol;

/**
 * Make `T` an opaque branded type identified by tag `K`.
 * The brand is erased at runtime (zero cost).
 */
export type Brand<T, K extends string> = T & { readonly [__brand]: K };

/** Extract the underlying primitive from a branded type. */
export type Unbrand<B> = B extends Brand<infer T, string> ? T : never;

// ---------------------------------------------------------------------------
// Built-in branded ID examples — extend as needed per domain
// ---------------------------------------------------------------------------

/** Opaque string identifying a user. Cannot be used where OrderId is expected. */
export type UserId = Brand<string, 'UserId'>;

/** Opaque string identifying an order. Cannot be used where UserId is expected. */
export type OrderId = Brand<string, 'OrderId'>;

/** Opaque string identifying a design token (e.g. "color.brand.primary"). */
export type TokenId = Brand<string, 'TokenId'>;

/** Opaque string identifying an interaction pattern (e.g. "editable-form"). */
export type PatternId = Brand<string, 'PatternId'>;

/** Opaque string identifying a form field within an intent. */
export type FieldId = Brand<string, 'FieldId'>;

/** Opaque string identifying an intent instance. */
export type IntentId = Brand<string, 'IntentId'>;

/**
 * Type-safe brand constructor.
 * Runtime: identity function (no allocation).
 *
 * @example
 * const id = brand<UserId>('user-abc');
 */
export function brand<B extends Brand<string, string>>(value: string): B {
  return value as B;
}
