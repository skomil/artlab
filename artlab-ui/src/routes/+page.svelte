
<script lang="ts">
    import LayerManager from '../components/layerManager.svelte';
    import { onMount } from 'svelte';
	import type { ILayerManager, IRenderRect } from '../types/layerManager.type';
    let prompt: string = '';
    let batchSize: number = 1;
    let layers: ILayerManager;
    let canvasWidth: number = 512;
    let canvasHeight: number = 512;
    
    let sdconfig = {
        url: 'http://192.168.1.31:7861/'
    };
    let resultImages: HTMLImageElement[] = [];
    let resultSelection: number = 0;
   
    let overlay:HTMLBodyElement;
    onMount(()=>{
        overlay.hidden = true;
        
    })
    async function copyImage() {
        let multiplier = 1;
        const rectSize:IRenderRect = layers.getRenderRect();
        if(rectSize.height < 384 || rectSize.height < 384) {
            multiplier = 2;
        }
        if(rectSize.height < 192 || rectSize.height < 192) {
            multiplier = 4;
        }
        overlay.hidden = false;
        console.log('%c ', 'font-size:400px; background:url('+ layers.copySelectionToImage +') no-repeat;');
        const res = await fetch(sdconfig.url + "sdapi/v1/img2img", {
			method: 'POST',
			body: JSON.stringify({
                prompt,
                resize_mode: 5,
                init_images: [layers.copySelectionToImage()],
                batch_size: batchSize,
                cfg_scale: 7,
                sampler_index: "LMS",
                steps: 50,
                denoising_strength: 1,
                mask_blur: 0,
                width: rectSize.width * multiplier,
                height: rectSize.height * multiplier,
            }),
            headers: {
                "content-type": "application/json"
            }
		});
        resultSelection = 0;
        const txt2img = await res.json();
        //TODO 422 error
        overlay.hidden = true;
        console.log(txt2img);
        await populateImageData(txt2img);
        layers.addImage(resultImages[resultSelection], false);
        console.log("outpaint");
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
    async function loadImage() {
        let multiplier = 1;
        const rectSize:IRenderRect = layers.getRenderRect();
        if(rectSize.height < 384 || rectSize.height < 384) {
            multiplier = 2;
        }
        if(rectSize.height < 192 || rectSize.height < 192) {
            multiplier = 4;
        }
        overlay.hidden = false;
        const res = await fetch(sdconfig.url + "sdapi/v1/txt2img", {
			method: 'POST',
			body: JSON.stringify({
                prompt,
                batch_size: batchSize,
                width: rectSize.width * multiplier,
                height: rectSize.height * multiplier,
                cfg_scale: 7,
                sampler_index: "LMS",
                steps: 50,
                denoising_strength: 1,
                mask_blur: 0,
                init_images: [layers.copySelectionToImage()],
            }),
            headers: {
                "content-type": "application/json"
            }
		});
        resultSelection = 0;
        const txt2img = await res.json();
        //TODO 422 error
        overlay.hidden = true;
        console.log(txt2img);
        await populateImageData(txt2img);
        layers.addImage(resultImages[resultSelection]);
        console.log("draw");   
    }

    async function populateImageData(txt2img: any) {
        let deferredImages = txt2img.images.map(async img => {
            const image = new Image();
            await new Promise(r => {
                image.onload=r;
                image.src="data:image/png;base64," + img;
            });
            return image;
        });
        await Promise.all(deferredImages).then(v => resultImages = v);
    }
   
    
</script>
<div class="overlay" bind:this={overlay}></div>
prompt: <input type="text" bind:value={prompt} />
Batch Size: <input type="number" bind:value={batchSize} />
Canvas Width: <input type="number" bind:value={canvasWidth} />
Canvas Height: <input type="number" bind:value={canvasHeight} />
<span>
    <input type="button" value="<-" on:click={decrementCurrentBatch}/>
    {resultSelection + 1} of {resultImages.length} Batch Images
    <input type="button" value="->" on:click={incrementCurrentBatch}/>
</span>
<input type="button" on:click={loadImage} value="Create Image"/>
<input type="button" on:click={copyImage} value="Copy Image" />
<LayerManager bind:this={layers} bind:width={canvasWidth} bind:height={canvasHeight} />

<style>    
    .overlay {
        position: absolute;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
        background-color: #333333;
        z-index: 300;
        opacity: .5;
        
    }
</style>
