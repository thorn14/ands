/**
 * @module result
 * @description `Result<T, E>` discriminated union for tool outputs.
 *
 * All CLI commands, validators, and adapters return `Result` — no uncaught
 * exceptions for expected failures. Inspect `.ok` before accessing `.data`.
 *
 * @example
 * ```ts
 * const r = validate(intent);
 * if (r.ok) {
 *   console.log(r.data); // T
 * } else {
 *   console.error(r.error); // E
 * }
 * ```
 */

/** Successful result carrying value `T`. */
export type Ok<T> = { readonly ok: true; readonly data: T };

/** Failed result carrying error `E`. */
export type Err<E> = { readonly ok: false; readonly error: E };

/** Discriminated union: either `Ok<T>` or `Err<E>`. */
export type Result<T, E = string> = Ok<T> | Err<E>;

/** Construct a successful `Ok<T>` result. */
export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

/** Construct a failed `Err<E>` result. */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/** Type guard: narrows `Result<T, E>` to `Ok<T>`. */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true;
}

/** Type guard: narrows `Result<T, E>` to `Err<E>`. */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false;
}

/**
 * Transform the `data` of an `Ok` result; pass `Err` through unchanged.
 * @example mapOk(parseResult, data => data.toUpperCase())
 */
export function mapOk<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.data)) : result;
}

/**
 * Transform the `error` of an `Err` result; pass `Ok` through unchanged.
 * @example mapErr(r, e => `Wrapped: ${e}`)
 */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return result.ok ? result : err(fn(result.error));
}

/**
 * Chain results: if `Ok`, pass `data` to `fn` which returns a new `Result`.
 * @example andThen(loadFile(path), content => parseJson(content))
 */
export function andThen<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>,
): Result<U, E> {
  return result.ok ? fn(result.data) : result;
}
