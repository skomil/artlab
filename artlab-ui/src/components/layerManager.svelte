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
    let mouseDown = false;
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

    function addToHistory(): void {
        imageHistory.splice(currentlyViewingHistory + imageHistory.length);
        currentlyViewingHistory = 0;
        if(renderLayer != null) {
            imageHistory.push(renderLayer.getContext().getImageData(0, 0, width, height));
        }
        imageHistoryDisplay = imageHistory.length;
    }
    export const copySelectionToImage = (): string => {
        copyCanvas.width = renderBoundsWidth;
        copyCanvas.height = renderBoundsHeight;
        const img = renderLayer.getContext().getImageData(renderBoundsX, renderBoundsY, renderBoundsWidth, renderBoundsHeight);
        copyCanvas.getContext("2d").putImageData(img,0,0);
        copyCanvas.getContext("2d")?.globalCompositeOperation
        return copyCanvas.toDataURL();
    };
    export const addImage = (image:HTMLImageElement, currentHistory: boolean) => {
        renderLayer.getContext().drawImage(image, renderBoundsX, renderBoundsY, renderBoundsWidth, renderBoundsHeight);
        addToHistory();
    };
    export const getRenderRect = (): IRenderRect => {
        return {width: renderBoundsWidth, height: renderBoundsHeight}
    };
    function setMousedown(event: MouseEvent) {
        mouseDown = true;
        if (event.offsetX > renderBoundsX - 12 && event.offsetX < renderBoundsX + 24 &&
            event.offsetY > renderBoundsY - 12 && event.offsetY < renderBoundsY + 24
        ) {
            activeTool="MOVE_BOUNDS";
        } else if (event.offsetX > renderBoundsX + renderBoundsWidth - 12 && event.offsetX < renderBoundsX + renderBoundsWidth + 24 &&
            event.offsetY > renderBoundsY + renderBoundsHeight - 12 && event.offsetY < renderBoundsY + renderBoundsHeight + 24
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
                if (event.offsetX - renderBoundsX > minRenderBounds && (event.offsetX - renderBoundsX) % 64 === 0) {
                    renderBoundsWidth = event.offsetX - renderBoundsX;
                } 
                if (event.offsetY - renderBoundsY > minRenderBounds && (event.offsetY - renderBoundsY) % 64 === 0) {
                    renderBoundsHeight = event.offsetY - renderBoundsY;
                }
            } else if (activeTool === "MOVE_BOUNDS") {
                //if (renderBoundsX + renderBoundsWidth < width) {
                    renderBoundsX = event.offsetX;
                //}
                //if (renderBoundsY + renderBoundsHeight < height) {
                    renderBoundsY = event.offsetY;
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
        backgroundImage = new Image();
        backgroundImage.src = "/checkerboard.png";
        backgroundImage.onload = () => {
            const pattern = backgroundLayer.getContext().createPattern(backgroundImage, "repeat");
            backgroundLayer.getContext().fillStyle = pattern;
            backgroundLayer.getContext().fillRect(0, 0, width, height);
            toolsLayer.getContext().lineWidth = 3;
            toolsLayer.getContext().setLineDash([10,3]);
        
        };
        console.log("refresh");
        
    }
    function drawBoundsRect() {
        toolsLayer.getContext().lineWidth = 3;
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
</script>
<div style="border: 1px solid #cccccc; position: relative; width: {width}px; height:{height}px;" 
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
</div>