<script lang="ts">
    import type { IRenderRect } from '../types/ImagePad';
    import LayerManager from "./layerManager.svelte";
    let layers: LayerManager;
    let currentlyViewingHistory:number;
    let imageHistoryDisplay:number;
    let historyCommandBarDisplay: string = '--';
    let resultImages: HTMLImageElement[] = [];
    let resultSelection = 0;

    export let width=512;
    export let height=512;
    export let scale=1;
    export const addImages = async (images: any): Promise<any> => {
        await getImagesData(images);
    }
    export const copySelectionToImage = (): string => {
        return layers.copySelectionToImage();
    };
    export const copyMaskToImage = (): string => {
        return layers.copyMaskToImage();
    };
    export const getRenderRect = (): IRenderRect => {
        return layers.getRenderRect();
    };
    async function getImagesData(images: any) {
        const deferredImages = images.map(async (img: any) => {
            const image = new Image();
            await new Promise(r => {
                image.onload=r;
                image.src="data:image/png;base64," + img;
            });
            return image;
        });
        await Promise.all(deferredImages).then(v => resultImages = v);
        layers.addImage(resultImages[resultSelection], false);
    }
    function incrementCurrentBatch() {
        if (resultSelection + 1 < resultImages.length) {
            resultSelection++;
            layers.addImage(resultImages[resultSelection], true);
        }
    }
    function decrementCurrentBatch() {
        if (resultSelection > 0) {
            resultSelection--;
            layers.addImage(resultImages[resultSelection], true);
        }
    }

    function updateHistoryDisplay() {
        console.log('update');
        if (layers !== undefined) {
            historyCommandBarDisplay = `viewing ${imageHistoryDisplay + currentlyViewingHistory} of ${imageHistoryDisplay} images in history`;
        } else {
            historyCommandBarDisplay = '--'
        }
    }
    $: imageHistoryDisplay, updateHistoryDisplay();
    $: currentlyViewingHistory, updateHistoryDisplay();
</script>
<div>
    <LayerManager 
        bind:currentlyViewingHistory
        bind:imageHistoryDisplay 
        bind:this={layers} 
        bind:width={width} 
        bind:height={height}
        bind:scale={scale}
    />
</div>
<div>
    <input type="button" value="<-" on:click={decrementCurrentBatch}/>
    {resultSelection + 1} of {resultImages.length} Batch Images
    <input type="button" value="->" on:click={incrementCurrentBatch}/>
    <input type="button" value="<-hist" on:click={layers.tryBackHistory}/> {historyCommandBarDisplay} <input type="button" value="hist->" on:click={layers.tryForwardHistory}/>
    <input type="button" value="Download" on:click={layers.downloadImage}/>
</div>
