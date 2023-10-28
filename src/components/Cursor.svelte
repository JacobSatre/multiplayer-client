<script lang="ts">
  import type { User } from "@src/types";

  export let data: User;
</script>

<div
  class="cursor"
  style={`top:${data.mouseCoordinates.y}px; left: ${data.mouseCoordinates.x}px; background-color:${data.color};`}
/>

<style>
  .cursor {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    transition-property: top left;
    transition-duration: 100ms;
    transition-delay: 0s;
  }
</style>
