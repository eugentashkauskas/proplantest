module ap.viewmodels {
    export interface IVirtualInfiniteRepeat {
        // Required for infinite scroll. Return the object at a specific index. If the object is not loaded, need to load it.
        getItemAtIndex(index: number): any;

        // Required for infinitescroll
        // For infinite scroll behavior, we always return a slightly higher
        // number than the previously loaded items.
        getLength(): number;
    }
}