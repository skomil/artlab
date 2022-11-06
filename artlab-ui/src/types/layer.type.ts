export type ILayer = {
    id: string;
    getContext(): CanvasRenderingContext2D;
}
