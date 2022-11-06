export type ILayerManager = {
    addImage(image:HTMLImageElement): void;
    getRenderRect(): IRenderRect;
    copySelectionToImage(): string;
    addToHistory(): void;
    width: number;
    height: number;
}
export type IRenderRect = {
    width: number;
    height: number;
}
