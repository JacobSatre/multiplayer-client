<script lang="ts">
  import { onMount } from "svelte";
  import { debounce } from "ts-debounce";
  import "../app.css";
  import type { Keys, ServerState, User as UserType } from "../types";
  import User from "@src/components/User.svelte";
  import Cursor from "@src/components/Cursor.svelte";
  import Entity from "@src/components/Entity.svelte";
  import { throttle } from "@martinstark/throttle-ts";
  import Image from "../lib/DSC04211.gif";

  //connection
  let connection: WebSocket | null;
  let loading = true;

  //server state
  let me: ServerState["me"] | null = null;
  let users: ServerState["users"] | null = null;
  let entities: ServerState["entities"] | null = null;
  let environment: ServerState["environment"] | null = null;

  // local state
  let mouseCoordinates = {
    x: 0,
    y: 0,
  };

  let keys = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  //elements
  let viewport: HTMLDivElement;
  let canvas: HTMLDivElement;

  const [handleMouseMove] = throttle((event: MouseEvent) => {
    console.log("mouse move!");
    mouseCoordinates = {
      x: event.clientX + viewport.scrollLeft,
      y: event.clientY + viewport.scrollTop,
    };
  }, 50);

  function handleKeyPress(event: KeyboardEvent, pressed: boolean) {
    if (event.key === "w" || event.key === "W" || event.key === "ArrowUp") {
      if (keys.up !== pressed) {
        keys.up = pressed;
      }
    } else if (
      event.key === "s" ||
      event.key === "S" ||
      event.key === "ArrowDown"
    ) {
      if (keys.down !== pressed) {
        keys.down = pressed;
      }
    } else if (
      event.key === "a" ||
      event.key === "A" ||
      event.key === "ArrowLeft"
    ) {
      if (keys.left !== pressed) {
        keys.left = pressed;
      }
    } else if (
      event.key === "d" ||
      event.key === "D" ||
      event.key === "ArrowRight"
    ) {
      if (keys.right !== pressed) {
        keys.right = pressed;
      }
    }
  }

  function handleMouseClick() {
    //viewport.scrollTo(1920, 1920);
    console.log("shoot!");
    if (connection?.readyState === WebSocket.OPEN) {
      connection.send(
        JSON.stringify({
          type: "shoot",
        })
      );
    }
  }

  function handleScrollViewport() {}

  function getDirection(keys: Keys) {
    let vertical: string | null = null;
    let horizontal: string | null = null;

    if (keys.up && !keys.down) {
      vertical = "up";
    } else if (keys.down && !keys.up) {
      vertical = "down";
    }

    if (keys.left && !keys.right) {
      horizontal = "left";
    } else if (keys.right && !keys.left) {
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
  }

  function connect() {
    connection = new WebSocket(import.meta.env.VITE_SERVER_API);

    connection.onopen = () => {
      loading = false;

      //startClock();
    };

    connection.onmessage = (message) => {
      const packet: ServerState = JSON.parse(message.data);
      me = packet.me;
      users = packet.users;
      entities = packet.entities;
      environment = packet.environment;
    };

    connection.onclose = async () => {
      loading = true;
      connection = null;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("connecting!");
      connect();
    };
  }

  //send inputs
  $: {
    if (connection?.readyState === 1) {
      console.log("keyboard press!");
      connection.send(
        JSON.stringify({
          type: "move",
          direction: getDirection(keys),
        })
      );
    }
  }
  $: {
    if (connection?.readyState === 1) {
      console.log("mouse move!");
      connection?.send(
        JSON.stringify({
          type: "mousemove",
          coordinates: mouseCoordinates,
        })
      );
    }
  }

  function handleViewportScroll(me: UserType, viewport: HTMLDivElement) {
    if (
      me?.coordinates.y >
      viewport.offsetHeight + viewport.scrollTop - viewport.offsetHeight / 3
    ) {
      viewport.scrollBy({
        top:
          me.coordinates.y -
          (viewport.offsetHeight +
            viewport.scrollTop -
            viewport.offsetHeight / 3),
        behavior: "smooth",
      });
    }

    if (me?.coordinates.y < viewport.scrollTop + viewport.offsetHeight / 3) {
      viewport.scrollBy({
        top:
          me.coordinates.y - (viewport.scrollTop + viewport.offsetHeight / 3),
        behavior: "smooth",
      });
    }

    if (
      me?.coordinates.x >
      viewport.offsetWidth + viewport.scrollLeft - viewport.offsetWidth / 3
    ) {
      viewport.scrollBy({
        left:
          me.coordinates.x -
          (viewport.offsetWidth +
            viewport.scrollLeft -
            viewport.offsetWidth / 3),
        behavior: "smooth",
      });
    }

    if (me?.coordinates.x < viewport.scrollLeft + viewport.offsetWidth / 3) {
      viewport.scrollBy({
        left:
          me.coordinates.x - (viewport.scrollLeft + viewport.offsetWidth / 3),
        behavior: "smooth",
      });
    }
  }
  $: {
    if (me && viewport) {
      handleViewportScroll(me, viewport);
    }
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
{:else if me && users && entities && environment}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div id="viewport" bind:this={viewport}>
    <div
      id="canvas"
      on:mousemove={handleMouseMove}
      style={`width:${environment?.width}px; height:${environment?.height}px; background-image:url(${Image})`}
      bind:this={canvas}
    >
      <User data={me} />
      <Cursor data={me} />
      {#each users as user (user.id)}
        <User data={user} />
      {:else}
        <p>no users</p>
      {/each}
      {#each entities as entity (entity.id)}
        <Entity data={entity} />
      {/each}
    </div>
  </div>
{:else}
  <p>waiting for server data</p>
{/if}

<style>
  #viewport {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  #canvas {
    background-size: cover;

    overflow: hidden;
    position: relative;
  }
</style>
