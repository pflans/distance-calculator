<script lang="ts">
	import { onMount } from 'svelte';
	import { API_URL } from '$lib/config';

	interface HistoryItem {
		queryId: number;
		sourceAddress: string;
		destinationAddress: string;
		distances: {
			miles: string;
			kilometers: string;
		};
		timestamp: string;
	}

	let history: HistoryItem[] = [];

	onMount(async () => {
		try {
			const response = await fetch(`${API_URL}/history`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			if (data.status === 'success') {
				history = data.data;
			} else {
				throw new Error('Failed to fetch history');
			}
		} catch (err) {
			console.error('Error:', err);
		} 
	});

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString();
	}
</script>

<div class="space-y-6 bg-white p-[16px]">
	<div class="mb-[20px]">
		<h2 class="m-0 text-[24px]">Historical Queries</h2>
		<p class="m-0">History of the user's queries.</p>
	</div>

		<div class="min-w-full">
			<div class="bg-[#e0e0de] text-[#1B1A1A]">
				<div class="grid grid-cols-6 gap-4 px-6 py-3 text-sm font-[600]">
					<div class="col-span-2">Source Address</div>
					<div class="col-span-2">Destination Address</div>
					<div>Distance in Miles</div>
					<div>Distance in Kilometers</div>
				</div>
			</div>
			<div class="divide-y divide-gray-200">
				{#each history as item}
					<div class="grid grid-cols-6 gap-4 px-6 py-4 text-sm bg-[#F8F8F6]">
						<div class="col-span-2">{item.sourceAddress}</div>
						<div class="col-span-2">{item.destinationAddress}</div>
						<div>{item.distances.miles} mi</div>
						<div>{item.distances.kilometers} km</div>
					</div>
				{/each}
			</div>
	</div>
</div>
