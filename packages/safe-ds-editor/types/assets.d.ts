declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.png' {
    const content: string;
    export default content;
}

declare module '$types/assets' {
    export type SvgComponent = typeof import('*.svelte');
}
