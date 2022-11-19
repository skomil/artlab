<script lang="ts">
    import { onMount } from 'svelte';
    export let id: string;
    export let index = "1";

    export let width: number = 512;
    export let height: number = 512;
    
    let renderCanvas:HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    onMount(()=>{
        ctx = renderCanvas.getContext("2d");
        onResize();
    })
    export const onResize = (): void => {
        renderCanvas.width = width;
        renderCanvas.height = height;
    };
    export const getContext = (): CanvasRenderingContext2D => {
        return ctx;
    };
    export const createImageWithoutMask = (x:number, y:number, bWidth:number, bHeight:number): ImageData => {
        const imageData:ImageData = ctx.getImageData(x, y, bWidth, bHeight);
        for(let i=0; i < imageData.data.length; i += 4) {
            //TODO take transparent masks into account
            if(imageData.data[i+3] === 0) {
                imageData.data[i] = Math.random() * 255;
                imageData.data[i + 1] = Math.random() * 255;
                imageData.data[i + 2] = Math.random() * 255;
            }
            imageData.data[i+3] = 255;
        }
        return imageData;
    }
    export const createMask = (x:number, y:number, bWidth:number, bHeight:number): ImageData => {
        const imageData:ImageData = ctx.getImageData(x, y, bWidth, bHeight);
        const srcInput:Uint8ClampedArray = imageData.data;
        let mask:Uint8ClampedArray = new Uint8ClampedArray(srcInput.length);
        for(let i=0; i < srcInput.length; i += 4) {
            mask[i] = 255 - srcInput[i+3];
            mask[i+1] = 255 - srcInput[i+3];
            mask[i+2] = 255 - srcInput[i+3];
            mask[i+3] = 255;
        }
        const maskImageData: ImageData = new ImageData(mask, bWidth, bHeight);
        return maskImageData;
    }    
</script>
<canvas id={id} width={width} height={height} bind:this={renderCanvas} 
style="position: absolute; top:0; left: 0; z-index: {index};"/>