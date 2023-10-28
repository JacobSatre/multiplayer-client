<script lang="ts">
  import type { User } from "@src/types";

  export let data: User;
</script>

<div
  class="player"
  style={`top:${data.coordinates.y}px; left: ${data.coordinates.x}px; background-color:${data.color};`}
/>

<style>
  .player {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    transition-property: top left;
    transition-duration: 100ms;
    transition-delay: 0s;
  }
</style>
