<script>
  let packOpened = false;

  function swipe(event) {
    // Assuming the swipe should happen in the top 50px of the pack
    if (event.clientY < 50) {
      openPack();
    }
  }

  function openPack() {
    if (!packOpened) {
      packOpened = true;
      const pack = document.querySelector('.pack');
      pack.classList.add('opened');
    }
  }
</script>

<style>
  .pack {
    position: relative;
    width: 200px;
    height: 300px;
    background-color: #ccc;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 1s ease;
  }

  .pack.opened {
    transform: scaleY(0);
  }

  .pack-content {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #333;
    transform: translateY(100%);
    transition: transform 1s ease;
  }

  .pack.opened .pack-content {
    transform: translateY(0);
  }

  .pack-top {
    position: absolute;
    width: 100%;
    height: 50px;
    background-color: #f00;
  }
</style>



<div class="pack" on:mousemove={swipe}>
  <div class="pack-top"></div>
  <div class="pack-content"></div>
</div>

