<script lang="ts">
  import type { Entity } from "@src/types";

  export let data: Entity;
</script>

<div
  class="entity"
  style={`top:${data.coordinates.y}px; left: ${data.coordinates.x}px; background-color:${data.color};`}
/>

<style>
  .entity {
    position: absolute;
    width: 15px;
    height: 15px;
    border-radius: 5px;
    transition-property: top left;
    transition-duration: 100ms;
    transition-delay: 0s;
  }
</style>
