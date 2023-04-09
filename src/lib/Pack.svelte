<script>
  import { onMount, onDestroy } from 'svelte';
  let packOpened = false;
  let packTopEdge = 0;
  let packElement;
  let packTopElement;
  let peeling = false;
  let resetInterval;
  let dashedLineElement;

  onMount(() => {
    packTopEdge = packElement.getBoundingClientRect().top;
  });

  onDestroy(() => {
    clearInterval(resetInterval);
  });

  function swipe(event, inContinuationBox = false) {
  const cursorPosY = event.clientY - packTopElement.getBoundingClientRect().bottom + 20;
  const cursorPosX = event.clientX - packElement.getBoundingClientRect().left;

  if (cursorPosY >= 0 && cursorPosY <= 75 && cursorPosX <= 10 || peeling && inContinuationBox) {
    peeling = true;
    clearInterval(resetInterval);
    dashedLineElement.style.opacity = 1 - (cursorPosX / packElement.clientWidth) - 0.9;
    const rotation = (cursorPosX / packElement.clientWidth) * (cursorPosX / packElement.clientWidth) * 5;
    const scaleY = 1 - (cursorPosX / packElement.clientWidth) * 0.1;
    const transformOrigin = '100% 100%';
    packTopElement.style.transform = `rotate(${rotation}deg) scaleY(${scaleY})`;
    packTopElement.style.transformOrigin = transformOrigin;
  } else {
    resetPeel();
  }
}




  function resetPeel() {
    if (!peeling) return;
    peeling = false;
    clearInterval(resetInterval);
    resetInterval = setInterval(() => {
      let currentRotation = parseFloat(packTopElement.style.transform.slice(7, -4));
      if (currentRotation > 0.5) {
        currentRotation -= 1;
        const curl = 1 - (currentRotation / 30) * 0.3;
        packTopElement.style.transform = `rotate(${currentRotation}deg)`;
        packTopElement.style.setProperty('--curl', curl);
      } else {
        clearInterval(resetInterval);
        packTopElement.style.transform = `rotate(0deg)`;
        packTopElement.style.setProperty('--curl', 1);
      }
    }, 20);
  }

  function openPack() {
    packOpened = true;
  }
</script>

<style>
  .pack {
    position: relative;
    width: 405px;
    height: 700px;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 1s ease;
    background-image: url('/botPack.png'); /* Replace with your image URL */
    background-size: cover;
  }

  .pack.opened {
    transform: scaleY(0);
  }

  .pack-top {
    position: absolute;
    width: 405px;
    height: 67px;
    top: -67px;
    overflow: hidden;
    background-image: url('/topPack.png'); /* Replace with your image URL */
    background-size: cover;
  }

  .pack-top::before {
  content: '';
  position: absolute;
  clip-path: path('M 0 0 L 100% 0 L 100% calc(var(--curl, 100%) * 1%) L 0 100%');
}


  .starter-box, .continuation-box {
    position: absolute;
    height: 75px;
  }

  .starter-box {
    width: 10px;
    left: 0;
    top: -30px;
  }

  .continuation-box {
    width: 100%;
    left: 0;
    top: -30px;
  }
  .dashed-line {
  position: absolute;
  width: 100%;
  height: 2px;
  top: -1px; /* Adjust this value to position the dashed line between the pack top and the pack body */
  background: repeating-linear-gradient(45deg, white, white 4px, transparent 4px, transparent 8px);
  background-size: 10px 100%; /* Adjust the size of the dashed line */
  animation: snipping 1s infinite;
  opacity: 1;
  transition: opacity 0.3s ease;
  transform: rotate(180deg);
}

@keyframes snipping {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -10px 0;
  }
}

</style>

<div class="pack" bind:this="{packElement}" on:mouseleave={resetPeel} class:opened={packOpened}>
  <div bind:this="{packTopElement}" class="pack-top"></div>
  <div class="starter-box" on:mousemove={(event) => swipe(event, false)} on:mouseleave={resetPeel}></div>
  <div class="dashed-line" bind:this="{dashedLineElement}"></div>
  <div class="continuation-box" on:mousemove={(event) => swipe(event, true)} on:mouseleave={resetPeel}></div>
</div>

