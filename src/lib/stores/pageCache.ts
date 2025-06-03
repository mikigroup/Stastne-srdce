import { writable } from "svelte/store";

// Typ pro cache
interface PageCache {
    [key: string]: {
        data: any;
        timestamp: number;
    };
}

// Vytvoření store pro cache
const createPageCache = () => {
    const { subscribe, update } = writable<PageCache>({});
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minut

    return {
        subscribe,
        // Získání dat z cache
        get: (key: string) => {
            let result: any = null;
            const unsubscribe = subscribe(cache => {
                const item = cache[key];
                if (item && (Date.now() - item.timestamp) < CACHE_DURATION) {
                    result = item.data;
                }
            });
            unsubscribe();
            return result;
        },
        // Uložení dat do cache
        set: (key: string, data: any) => {
            update(cache => ({
                ...cache,
                [key]: {
                    data,
                    timestamp: Date.now()
                }
            }));
        },
        // Vyčištění cache
        clear: () => {
            update(() => ({}));
        }
    };
};

// Export singleton instance
export const pageCache = createPageCache(); 