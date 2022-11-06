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
    })
    export const getContext = (): CanvasRenderingContext2D => {
        return ctx;
    };    
</script>
<canvas id={id} width={width} height={height} bind:this={renderCanvas} 
style="position: absolute; top:0; left: 0; z-index: {index};"/>