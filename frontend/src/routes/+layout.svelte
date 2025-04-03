<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
	let { children } = $props();
</script>

<main class="relative mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
	<div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
		<div>
			<h1 class="mb-1 text-[32px] font-light">Distance Calculator</h1>
			<p class="text-[14px]">
				Prototype web application for calculating the distance between addresses.
			</p>
		</div>
		{#if $page.url.pathname === '/history'}
			<a
				href="/"
				class="flex h-[42px] items-center justify-between border border-[#313030] bg-[#FFFFFF] px-6 py-3 text-sm font-[400] text-[#313030] hover:bg-[#F7F7F7]"
			>
				<span class="pr-[20px]">Back to Calculator</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z"
					/>
				</svg>
			</a>
		{:else}
			<a
				href="/history"
				class="flex h-[42px] items-center justify-between bg-[#313030] px-6 py-3 text-sm font-[400] text-white hover:bg-gray-800"
			>
				<span class="pr-[20px]">View Historical Queries</span>
				<svg
					class="ml-2 h-5 w-5"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-9-9"
					></path>
				</svg>
			</a>
		{/if}
	</div>
	<div class="bg-[#f8f8f6]">
		{@render children()}
	</div>
</main>
