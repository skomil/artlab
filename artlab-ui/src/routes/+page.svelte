
<script lang="ts">
    import { onMount } from 'svelte';
	import type { IImagePad } from '../types/ImagePad';
	import ImagePad from '../components/imagePad.svelte';
    let prompt: string = '';
    let batchSize: number = 1;
    let layers: IImagePad;
    let canvasWidth: number = 1024;
    let canvasHeight: number = 512;
    let scale: number = 1;
    
    let sdconfig = {
        url: 'http://192.168.1.31:7861/'
    };
    
   
    let overlay:HTMLBodyElement;
    onMount(()=>{
        overlay.hidden = true;
        
    })
    async function copyImage() {
        overlay.hidden = false;
        const res = await fetch(sdconfig.url + "sdapi/v1/img2img", {
			method: 'POST',
			body: JSON.stringify({
                prompt,
                resize_mode: 5,
                init_images: [layers.copySelectionToImage()],
                mask: layers.copyMaskToImage(),
                batch_size: batchSize,
                cfg_scale: 7,
                sampler_index: "LMS",
                steps: 50,
                denoising_strength: 1,
                mask_blur: 0,
                width: 512,
                height: 512,
            }),
            headers: {
                "content-type": "application/json"
            }
		});
        const txt2img = await res.json();
        //TODO 422 error
        overlay.hidden = true;
        console.log(txt2img);
        layers.addImages(txt2img.images);
        console.log("outpaint");
    }
    async function loadImage() {
        
        overlay.hidden = false;
        const res = await fetch(sdconfig.url + "sdapi/v1/txt2img", {
			method: 'POST',
			body: JSON.stringify({
                prompt,
                batch_size: batchSize,
                width: 512,
                height: 512,
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
        const txt2img = await res.json();
        //TODO 422 error
        overlay.hidden = true;
        console.log(txt2img);
        layers.addImages(txt2img.images);
        console.log("draw");   
    }
    
</script>
<div class="overlay" bind:this={overlay}></div>
prompt: <input type="text" bind:value={prompt} />
Batch Size: <input type="number" bind:value={batchSize} />
Scale: <input type="number" bind:value={scale} />
Canvas Width: <input type="number" bind:value={canvasWidth} />
Canvas Height: <input type="number" bind:value={canvasHeight} />
<input type="button" on:click={loadImage} value="Create Image"/>
<input type="button" on:click={copyImage} value="Copy Image" />
<ImagePad bind:this={layers} bind:height={canvasHeight} bind:width={canvasWidth} bind:scale={scale} />
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
