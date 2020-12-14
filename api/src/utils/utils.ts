import cache from 'memory-cache';

/**
 * Wraps a function in a cache function. If the cache is unset or has expired, the original function will be called and
 * the response will be stored in the cache for use in subsequent calls. Repeated calls within the expiration period
 * will return the last cached value.
 *
 * @param {string} key key to store the cached value against
 * @param {number} expiration time to maintain the cache, in milliseconds
 * @param {((...args: any) => any | Promise<any>)} fn function to cache
 * @returns {(...args: any) => Promise<any>} original function wrapped in an async function that provides caching
 */
export const cached = function (
  key: string,
  expiration: number,
  fn: (...args: any) => any | Promise<any>
): (...args: any) => Promise<any> {
  return async (...args) => {
    // Get a cached copy, if available
    const cachedResult = cache.get(key);

    // Set the result using the non-null cached copy, or else fetch a new copy
    const result = cachedResult || (await fn(...args));

    // If the cached copy was null, then set the cache
    if (!cachedResult) {
      cache.put(key, result, expiration);
    }

    return result;
  };
};
