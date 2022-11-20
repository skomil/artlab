export type ILayer = {
    id: string;
    scale: number;
    getContext(): CanvasRenderingContext2D;
    createMask(x: number, y: number, width: number, height: number): ImageData;
    createImageWithoutMask(x: number, y: number, width: number, height: number): ImageData;
    downloadLink(): string;
}
