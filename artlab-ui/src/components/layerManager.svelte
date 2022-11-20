<script lang="ts">
    /**
     * Layer Manager Component
    */
	import { onMount } from 'svelte';
    import Layer from "./layer.svelte";
	import type { ILayer } from "../types/layer.type";
	import type { IRenderRect } from '../types/layerManager.type';
    export let width=512;
    export let height=512;
    export let scale=1;
    let mouseDown = false;
    let scaledWidth:number = 1;
    let scaledHeight:number = 1;
    let toolsLayer: ILayer ;
    let renderLayer: ILayer ;
    let backgroundLayer: ILayer ;
    const minRenderBounds = 50;
    let renderBoundsX = 100;
    let renderBoundsY = 100;
    let renderBoundsWidth = 128;
    let renderBoundsHeight = 128;
    let activeTool = "NONE";
    let backgroundImage: HTMLImageElement;
    let copyCanvas: HTMLCanvasElement;
    let imageHistory: ImageData[];
    let currentlyViewingHistory = 0;
    let imageHistoryDisplay = 0;
    imageHistory = [];
    onMount(()=>{
        drawBackground();
        drawBoundsRect();
        addToHistory();
    });
    $: width, refreshView();
    $: height, refreshView();
    $: scale, refreshView();

    function addToHistory(): void {
        imageHistory.splice(currentlyViewingHistory + imageHistory.length);
        currentlyViewingHistory = 0;
        if(renderLayer != null) {
            imageHistory.push(renderLayer.getContext().getImageData(0, 0, width, height));
        }
        imageHistoryDisplay = imageHistory.length;
    }
    function replaceHistory(): void {

        if(renderLayer != null) {
            imageHistory[imageHistory.length -1] = renderLayer.getContext().getImageData(0, 0, width, height);
        }
    }
    export const copySelectionToImage = (): string => {
        copyCanvas.width = renderBoundsWidth;
        copyCanvas.height = renderBoundsHeight;
        const img = renderLayer.createImageWithoutMask(
            renderBoundsX,
            renderBoundsY,
            renderBoundsWidth,
            renderBoundsHeight);
        copyCanvas.getContext("2d").putImageData(img,0,0);
        return copyCanvas.toDataURL();
    };
    export const copyMaskToImage = (): string => {
        copyCanvas.width = renderBoundsWidth;
        copyCanvas.height = renderBoundsHeight;
        const img = renderLayer.createMask(
            renderBoundsX,
            renderBoundsY, 
            renderBoundsWidth,
            renderBoundsHeight);
        copyCanvas.getContext("2d").putImageData(img,0,0);
        //renderLayer.getContext().putImageData(img, renderBoundsX * scale, renderBoundsY* scale);
        return copyCanvas.toDataURL();
    };
    export const addImage = (image:HTMLImageElement, currentHistory: boolean) => {
        
        if (currentHistory) {
            if(currentlyViewingHistory === 0) {
                renderLayer.getContext().drawImage(image, renderBoundsX, renderBoundsY, renderBoundsWidth, renderBoundsHeight);
                replaceHistory();
            }
        } else {
            renderLayer.getContext().drawImage(image, renderBoundsX, renderBoundsY, renderBoundsWidth, renderBoundsHeight);
            addToHistory();
        }
        
    };
    export const getRenderRect = (): IRenderRect => {
        return {width: renderBoundsWidth, height: renderBoundsHeight}
    };
    function setMousedown(event: MouseEvent) {
        mouseDown = true;
        if (event.offsetX * (1 / scale) > renderBoundsX - 12 && event.offsetX * (1 / scale) < renderBoundsX + 24 &&
            event.offsetY * (1 / scale) > renderBoundsY - 12 && event.offsetY * (1 / scale) < renderBoundsY + 24
        ) {
            activeTool="MOVE_BOUNDS";
        } else if (event.offsetX * (1 / scale) > renderBoundsX + renderBoundsWidth - 12 && event.offsetX * (1 / scale) < renderBoundsX + renderBoundsWidth + 24 &&
            event.offsetY * (1 / scale) > renderBoundsY + renderBoundsHeight - 12 && event.offsetY * (1 / scale) < renderBoundsY + renderBoundsHeight + 24
        ) {
            activeTool="RESIZE_BOUNDS";
        }

    }
    
    function setMouseUp() {
        mouseDown = false;
        activeTool="NONE";
    }
    function onMouseMove(event: MouseEvent) {
        if(mouseDown) {
            if (activeTool === "RESIZE_BOUNDS") {
                //if (event.offsetX - renderBoundsX > minRenderBounds && (event.offsetX - renderBoundsX) % 64 === 0) {
                    renderBoundsWidth = (event.offsetX * (1 / scale)) - renderBoundsX;
                //} 
                //if (event.offsetY - renderBoundsY > minRenderBounds && (event.offsetY - renderBoundsY) % 64 === 0) {
                    renderBoundsHeight = (event.offsetX  * (1 / scale)) - renderBoundsX;
                //}
            } else if (activeTool === "MOVE_BOUNDS") {
                //if (renderBoundsX + renderBoundsWidth < width) {
                    renderBoundsX = event.offsetX * (1 / scale);
                //}
                //if (renderBoundsY + renderBoundsHeight < height) {
                    renderBoundsY = event.offsetY * (1 / scale);
                //}
            }
            
            
            drawBoundsRect();

        }   
    }
    function refreshView() {
        if(backgroundLayer != null && toolsLayer != null) {
            drawBackground();
            drawBoundsRect();
        }
    }
    function drawBackground() {
        //backgroundLayer.onResize();
        //toolsLayer.onResize();
        //renderLayer.onResize();
        scaledHeight = scale*height;
        scaledWidth = scale*width;
        backgroundImage = new Image();
        backgroundImage.src = "/checkerboard.png?key="+ Math.random() * 100;
        backgroundImage.onload = () => {
            const pattern = backgroundLayer.getContext().createPattern(backgroundImage, "repeat");
            backgroundLayer.getContext().fillStyle = pattern;
            backgroundLayer.getContext().fillRect(0, 0, width, height);
            toolsLayer.getContext().lineWidth = 3;
            toolsLayer.getContext().setLineDash([10,3]);
        
        };
        
        if (imageHistory.length > 1) {
            renderLayer.getContext().putImageData(imageHistory[imageHistory.length -1], 0, 0);
        }
        console.log("refresh");
        
    }
    function drawBoundsRect() {
        toolsLayer.getContext().lineWidth = 3;
        //toolsLayer.getContext().scale(scale, scale);
        toolsLayer.getContext().setLineDash([10,3]);
        toolsLayer.getContext().clearRect(0,0,width, height);
        toolsLayer.getContext().strokeRect(
            renderBoundsX, 
            renderBoundsY,
            renderBoundsWidth,
            renderBoundsHeight);

        toolsLayer.getContext().fillStyle = "#DD3322";
        toolsLayer.getContext().fillRect(renderBoundsX - 12, renderBoundsY -12, 24, 24);

        toolsLayer.getContext().fillStyle = "#33FF22";
        toolsLayer.getContext().fillRect(renderBoundsX + renderBoundsWidth - 12, renderBoundsY + renderBoundsHeight - 12, 24, 24);
        
    }
    function tryBackHistory() {
        if (imageHistory.length + currentlyViewingHistory > 1) {
            currentlyViewingHistory --;
            renderLayer.getContext().putImageData(imageHistory[imageHistory.length + currentlyViewingHistory - 1], 0, 0);
        }
    }
    function tryForwardHistory() {
        if (imageHistory.length + currentlyViewingHistory < imageHistory.length) {
            currentlyViewingHistory ++;
            renderLayer.getContext().putImageData(imageHistory[imageHistory.length + currentlyViewingHistory - 1], 0, 0);
        }
    }
    function downloadImage() {
        let downloadUrl = renderLayer.downloadLink();
        window.open(downloadUrl);
    }
    
</script>
<div style="border: 1px solid #cccccc; position: relative; width: {width}px; height:{height}px; zoom: {scale};" 
    on:mousedown={setMousedown}
    on:mouseup={setMouseUp}
    on:mousemove={onMouseMove}
    on:blur={setMouseUp}
>
    <Layer id="toolsLayer" bind:width={width} bind:height={height} bind:this={toolsLayer} index=2/>
    <Layer id="renderLayer" bind:width={width} bind:height={height} bind:this={renderLayer} index=1/>
    <Layer id="backgroundLayer" bind:width={width} bind:height={height} bind:this={backgroundLayer} index=0/>
    <canvas id="copyCanvas" bind:this={copyCanvas} />
    
</div>
<div>
    imageWidth: {renderBoundsWidth} imageHeight: {renderBoundsHeight}
    <input type="button" value="<-hist" on:click={tryBackHistory}/> viewing {imageHistoryDisplay + currentlyViewingHistory} of {imageHistoryDisplay} images in history <input type="button" value="hist->" on:click={tryForwardHistory}/>
    <input type="button" value="Download" on:click={downloadImage}/>
</div>