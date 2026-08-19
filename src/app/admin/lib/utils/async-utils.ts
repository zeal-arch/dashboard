/**
 * AbortController utility for cancelable async operations
 * Prevents memory leaks and unnecessary API calls
 */

export class AbortableRequest {
    private controller: AbortController;

    constructor() {
        this.controller = new AbortController();
    }

    get signal(): AbortSignal {
        return this.controller.signal;
    }

    abort(): void {
        this.controller.abort();
    }

    /**
     * Fetch with automatic abort on timeout
     */
    async fetch(
        url: string,
        options: RequestInit = {},
        timeoutMs = 30000
    ): Promise<Response> {
        const timeoutId = setTimeout(() => this.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: this.controller.signal,
            });

            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request was cancelled or timed out');
            }

            throw error;
        }
    }
}

/**
 * Request deduplication - prevents duplicate simultaneous requests
 */
class RequestDeduplicator {
    private pendingRequests = new Map<string, Promise<unknown>>();

    async dedupe<T>(
        key: string,
        fetcher: () => Promise<T>
    ): Promise<T> {
        // If request is already pending, return existing promise
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key) as Promise<T>;
        }

        // Create new request
        const promise = fetcher()
            .finally(() => {
                // Clean up after request completes
                this.pendingRequests.delete(key);
            });

        this.pendingRequests.set(key, promise);
        return promise;
    }

    clear(): void {
        this.pendingRequests.clear();
    }
}

export const requestDeduplicator = new RequestDeduplicator();

/**
 * Debounce utility for rate-limiting function calls
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    waitMs: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
        }, waitMs);
    };
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    delayMs = [1000, 2000, 4000]
): Promise<T> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            // Don't retry if aborted
            if (error instanceof Error && error.name === 'AbortError') {
                throw error;
            }

            const isLastAttempt = attempt === maxAttempts - 1;

            if (isLastAttempt) {
                throw error;
            }

            // Wait before retrying
            const delay = delayMs[attempt] || delayMs[delayMs.length - 1];
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new Error('Retry failed');
}

/**
 * Request queue for limiting concurrent operations
 */
export class RequestQueue {
    private queue: Array<() => Promise<unknown>> = [];
    private running = 0;
    private maxConcurrent: number;

    constructor(maxConcurrent = 3) {
        this.maxConcurrent = maxConcurrent;
    }

    async add<T>(task: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });

            this.process();
        });
    }

    private async process(): Promise<void> {
        if (this.running >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        this.running++;
        const task = this.queue.shift();

        if (task) {
            try {
                await task();
            } finally {
                this.running--;
                this.process(); // Process next task
            }
        }
    }

    clear(): void {
        this.queue = [];
    }

    get pending(): number {
        return this.queue.length;
    }

    get active(): number {
        return this.running;
    }
}
