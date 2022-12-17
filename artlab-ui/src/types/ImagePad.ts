export type IImagePad = {
    //addImage(image:HTMLImageElement, currentHistory: boolean): void;
    addImages(images: any): Promise<any>;
    getRenderRect(): IRenderRect;
    copySelectionToImage(): string;
    copyMaskToImage(): string;
    width: number;
    height: number;
    scale: number;
}
export type IRenderRect = {
    width: number;
    height: number;
}
