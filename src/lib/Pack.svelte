<script>
  import { onMount } from 'svelte';
  let packOpened = false;
  let packTopEdge = 0;
  let packElement;
  let packTopElement;
  let peeling = false;

  onMount(() => {
    packTopEdge = packElement.getBoundingClientRect().top;
  });

  function swipe(event) {
    if (event.clientY - packTopEdge < 50 || peeling) {
      peeling = true;
      const cursorPosX = event.clientX - packElement.getBoundingClientRect().left;
      const rotation = (cursorPosX / packElement.clientWidth) * (cursorPosX / packElement.clientWidth) * 30;
      const curl = 1 - (cursorPosX / packElement.clientWidth) * 0.3;
      const transformOrigin = '100% 100%';
      packTopElement.style.transform = `rotate(${rotation}deg)`;
      packTopElement.style.transformOrigin = transformOrigin;
      packTopElement.style.setProperty('--curl', curl);
    } else {
      resetPeel();
    }
  }

  function resetPeel() {
    peeling = false;
    packTopElement.style.transform = '';
    packTopElement.style.transformOrigin = '';
  }

  function openPack() {
    packOpened = true;
  }
</script>

<style>
  .pack {
    position: relative;
    width: 300px;
    height: 500px;
    background-color: #ccc;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 1s ease;
  }

  .pack.opened {
    transform: scaleY(0);
  }

  .pack-top {
    position: absolute;
    width: 100%;
    height: 30px;
    background-color: #f00;
    overflow: hidden;
  }

  .pack-top::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 200%;
    background-color: #f00;
    clip-path: polygon(0 0, 100% 0, 100% var(--curl, 100%), 0 100%);
  }
</style>

<div class="pack" bind:this="{packElement}" on:mousemove={swipe} on:mouseleave={resetPeel} class:opened={packOpened}>
  <div bind:this="{packTopElement}" class="pack-top"></div>
</div>
