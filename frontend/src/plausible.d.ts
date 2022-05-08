declare interface PlausibleOptions {
    callback?: () => any;
    props?: any;
}

declare function plausible(eventName: string, options?: PlausibleOptions);
