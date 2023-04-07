<script>
	import { goto } from '$app/navigation';
</script>

<svelte:window on:load={() => goto('/app')} />
