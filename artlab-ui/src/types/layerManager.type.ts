export type ILayerManager = {
    addImage(image:HTMLImageElement, currentHistory: boolean): void;
    getRenderRect(): IRenderRect;
    copySelectionToImage(): string;
    copyMaskToImage(): string;
    width: number;
    height: number;
}
export type IRenderRect = {
    width: number;
    height: number;
}
