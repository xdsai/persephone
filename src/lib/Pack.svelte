<script>
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import { spring } from 'svelte/motion';

  
  let packOpened = false;
  let packTopEdge = 0;
  let packElement;
  let packTopElement;
  let peeling = false;
  let resetInterval;
  let dashedLineElement;
  let glareElement;
  const peelProgress = writable(0);



  onMount(() => {
    packTopEdge = packElement.getBoundingClientRect().top;
    const backgroundVideo = document.getElementById('background-video');
    backgroundVideo.playbackRate = 1; // Adjust the value to your desired playback speed
  });

  onDestroy(() => {
    clearInterval(resetInterval);
  });

  let active = false;
  let interacting = false;
  let springRotate = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.3 });
  let springScale = spring(1, { stiffness: 0.1, damping: 0.3 });

  const activePack = writable(null);

  function interact(e) {
    if (!active) {
      active = true;
      activePack.set(packElement);
    }
    interacting = true;
    const rect = packElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    springRotate.set({ x: (y / rect.height) * 20 - 10, y: (x / rect.width) * - 20 + 10 });
    springScale.set(1.05);
    glareElement.style.opacity = 1;
    glareElement.style.transform = `translate(${x - 250}px, ${y - 250}px)`; // Update the translation values
  }

  function interactEnd() {
    interacting = false;
    active = false;
    activePack.set(null);
    springRotate.set({ x: 0, y: 0 });
    springScale.set(1);
  }

  function swipe(event, inContinuationBox = false) {
  const cursorPosY = event.clientY - packTopElement.getBoundingClientRect().bottom + 45;
  const cursorPosX = event.clientX - packElement.getBoundingClientRect().left;

  if (cursorPosY >= 0 && cursorPosY <= 90 && cursorPosX <= 10 || peeling && inContinuationBox) {
    peeling = true;
    clearInterval(resetInterval);
    dashedLineElement.style.opacity = 1 - (cursorPosX / packElement.clientWidth) - 0.95;
    const rotation = (cursorPosX / packElement.clientWidth) * (cursorPosX / packElement.clientWidth) * 3;
    const scaleY = 1 - (cursorPosX / packElement.clientWidth) * 0.1;
    const transformOrigin = '100% 100%';
    packTopElement.style.transform = `rotate(${rotation}deg) scaleY(${scaleY})`;
    packTopElement.style.transformOrigin = transformOrigin;
    peelProgress.set(cursorPosX / packElement.clientWidth); + 30 // Add this line to update the peelProgress store
  } else {
    resetPeel();
  }
}






  function resetPeel() {
    if (!peeling) return;
    peeling = false;
    peelProgress.set(0);
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
    transition: transform 0.1s ease;
    background-image: url('/botPack.webp'); /* Replace with your image URL */
    background-size: cover;
    will-change: transform;
    background-color: transparent;
  }
  

  .pack::before {
    content: '';
    position: absolute;
    top: 0px;
    left: 7px;
    right: 7px;
    bottom: 0px;
    border-radius: 10px;
    z-index: -1;
    box-shadow: 10px 10px 30px rgba(0, 0, 0, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.15);  }


  .pack.opened {
    transform: scaleY(0);
  }

  .pack-top {
    position: absolute;
    width: 405px;
    height: 67px;
    top: -66px;
    overflow: hidden;
    background-image: url('/topPack.webp'); /* Replace with your image URL */
    background-size: cover;
  }

  .pack:hover::before {
    opacity: 1;
  }


  .starter-box, .continuation-box, .end-box {
    position: absolute;
    height: 90px;
  }

  .starter-box {
    width: 10px;
    left: 0;
    top: -45px;
  }

  .continuation-box {
    width: 100%;
    left: 0;
    top: -45px;
  }
  .end-box {
    width: 50px;
    right: 0;
    top: -45px;
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
#background-video {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: -100;
  object-fit: cover;
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

<video id="background-video" autoplay loop muted playsinline>
  <source src="/cPortal.webm" type="video/webm" />
  Your browser does not support the video tag.
</video>


<div class="pack" bind:this="{packElement}" on:mouseleave={resetPeel} on:mousemove={interact} on:mouseout={interactEnd} class:opened={packOpened} style="transform-origin: center;transform: rotateX({$springRotate.x}deg) rotateY({$springRotate.y}deg) scale({$springScale});">
  <div bind:this="{packTopElement}" class="pack-top">
  </div>
  <div class="starter-box" on:mousemove={(event) => swipe(event, false)} on:mouseleave={resetPeel}>
  </div>
  <div class="sparkle" style="--peel-progress: { $peelProgress }"></div>  
  <div class="dashed-line" bind:this="{dashedLineElement}">
  </div>
  <div class="continuation-box" on:mousemove={(event) => swipe(event, true)} on:mouseleave={resetPeel}>
  </div>
  <div class="end-box">
  </div>
</div>

