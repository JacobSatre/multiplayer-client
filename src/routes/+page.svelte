<script lang="ts">
  import { onMount } from "svelte";
  import { debounce } from "ts-debounce";
  import "../app.css";

  type keys = {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };

  type Coordinates = {
    x: number;
    y: number;
  };

  type User = {
    id: string;
    coordinates: Coordinates;
    mouseCoordinates: Coordinates;
    color: string;
  };

  type Entity = {
    id: string;
    coordinates: Coordinates;
    color: string;
  };

  type ServerState = {
    users: User[];
    entities: Entity[];
  };

  type LocalState = {
    mouseCoordinates: Coordinates;
    keys: keys;
  };

  let connection: WebSocket | null;

  let loading = true;

  let serverState: ServerState | null = null;

  let localState: LocalState = {
    mouseCoordinates: {
      x: 0,
      y: 0,
    },
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
    },
  };

  function handleMousemove(event: MouseEvent) {
    localState.mouseCoordinates.x = event.clientX;
    localState.mouseCoordinates.y = event.clientY;
  }

  function handleKeyPress(event: KeyboardEvent, pressed: boolean) {
    if (event.key === "w" || event.key === "W" || event.key === "ArrowUp") {
      localState.keys.up = pressed;
    } else if (
      event.key === "s" ||
      event.key === "S" ||
      event.key === "ArrowDown"
    ) {
      localState.keys.down = pressed;
    } else if (
      event.key === "a" ||
      event.key === "A" ||
      event.key === "ArrowLeft"
    ) {
      localState.keys.left = pressed;
    } else if (
      event.key === "d" ||
      event.key === "D" ||
      event.key === "ArrowRight"
    ) {
      localState.keys.right = pressed;
    }
  }

  function handleMouseClick() {
    console.log("shoot!");
    if (connection?.readyState === WebSocket.OPEN) {
      connection.send(
        JSON.stringify({
          type: "shoot",
        })
      );
    }
  }

  $: direction = () => {
    let vertical: string | null = null;
    let horizontal: string | null = null;

    if (localState.keys.up && !localState.keys.down) {
      vertical = "up";
    } else if (localState.keys.down && !localState.keys.up) {
      vertical = "down";
    }

    if (localState.keys.left && !localState.keys.right) {
      horizontal = "left";
    } else if (localState.keys.right && !localState.keys.left) {
      horizontal = "right";
    }

    if (vertical && horizontal) {
      return `${vertical}-${horizontal}`;
    }

    if (vertical) {
      return vertical;
    } else if (horizontal) {
      return horizontal;
    } else {
      return "none";
    }
  };

  function startClock() {
    const interval = setInterval(() => {
      if (connection?.readyState === WebSocket.OPEN) {
        connection.send(
          JSON.stringify({
            type: "move",
            direction: direction(),
            mouseCoordinates: localState.mouseCoordinates,
          })
        );
      } else {
        clearInterval(interval);
      }
    }, 60);
  }

  function connect() {
    connection = new WebSocket(import.meta.env.VITE_SERVER_API);

    connection.onopen = () => {
      loading = false;

      startClock();
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

<svelte:window
  on:keydown|preventDefault={(event) => handleKeyPress(event, true)}
  on:keyup|preventDefault={(event) => handleKeyPress(event, false)}
  on:mousedown|preventDefault={(event) => handleMouseClick()}
/>

{#if loading}
  <p>connecting...</p>
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div id="canvas" on:mousemove={handleMousemove}>
    {#if serverState}
      {#each serverState.users as user (user.id)}
        <div
          class="player"
          style={`top:${user.coordinates.y}px; left: ${user.coordinates.x}px; background-color:${user.color};`}
        />

        <!--<div
          class="cursor"
          style={`top:${user.mouseCoordinates.y}px; left: ${user.mouseCoordinates.x}px; background-color:${user.color};`}
        />-->
      {:else}
        <p>no users</p>
      {/each}
      {#each serverState.entities as entity (entity.id)}
        <div
          class="entity"
          style={`top:${entity.coordinates.y}px; left: ${entity.coordinates.x}px; background-color:${entity.color};`}
        />
      {/each}
    {/if}
  </div>
{/if}

<style>
  #canvas {
    background-color: #fa8bff;
    background-image: linear-gradient(
      45deg,
      #fa8bff 0%,
      #2bd2ff 52%,
      #2bff88 90%
    );

    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .player {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    transition-property: top left;
    transition-duration: 100ms;
    transition-delay: 0s;
  }

  .cursor {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    transition-property: top left;
    transition-duration: 100ms;
    transition-delay: 0s;
  }

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
