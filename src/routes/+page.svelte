<script lang="ts">
  import { onMount } from "svelte";
  import { debounce } from "ts-debounce";
  import "../app.css";

  type Coordinates = {
    x: number;
    y: number;
  };

  type User = {
    id: string;
    coordinates: Coordinates;
    color: string;
  };

  let connection: WebSocket | null;

  let loading = true;

  let serverState: User[] | null = null;

  let localState: Pick<User, "coordinates"> = {
    coordinates: {
      x: 0,
      y: 0,
    },
  };

  function handleMousemove(event: MouseEvent) {
    localState.coordinates.x = event.clientX;
    localState.coordinates.y = event.clientY;
  }

  function connect() {
    connection = new WebSocket("ws://localhost:3000/ws?test");

    connection.onopen = () => {
      loading = false;

      const interval = setInterval(() => {
        if (connection?.readyState === WebSocket.OPEN) {
          connection.send(JSON.stringify(localState));
        } else {
          clearInterval(interval);
        }
      }, 60);
    };

    connection.onmessage = (message) => {
      serverState = JSON.parse(message.data);
    };

    connection.onclose = async () => {
      loading = true;
      connection = null;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("connecting!");
      connect();
    };
  }

  onMount(async () => {
    connect();
  });
</script>

{#if loading}
  <p>connecting...</p>
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div id="canvas" on:mousemove={handleMousemove}>
    {#if serverState}
      {#each serverState as user (user.id)}
        <div
          class="player"
          style={`top:${user.coordinates.y}px; left: ${user.coordinates.x}px; background-color:${user.color};`}
        />
      {:else}
        <p>no users</p>
      {/each}
    {/if}
  </div>
{/if}

<style>
  #canvas {
    background-color: green;
    height: 100vh;
    position: relative;
  }

  .player {
    position: absolute;
    background-color: blue;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    transition-property: top left;
    transition-duration: 200ms;
    transition-delay: 0s;
  }
</style>
