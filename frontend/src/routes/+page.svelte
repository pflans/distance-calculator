<script lang="ts">
	import { API_URL } from '$lib/config';
	let sourceAddress = '';
	let destinationAddress = '';
	let unit = 'miles';
	let distance: string | null = null;
	let loading = false;
	let error: string | null = null;
	let sourceSuggestions: any[] = [];
	let destinationSuggestions: any[] = [];
	let showSourceSuggestions = false;
	let showDestinationSuggestions = false;
	let searchTimeout: ReturnType<typeof setTimeout>;
	let showErrorPopup = false;

	$: isValid = sourceAddress.trim() !== '' && destinationAddress.trim() !== '';

	function closeErrorPopup() {
		showErrorPopup = false;
		error = null;
	}

	function validateAddress(address: string): { isValid: boolean; error?: string } {
		if (!address.trim()) {
			return { isValid: false, error: 'Address cannot be empty' };
		}
		
		// Check for reasonable length
		if (address.length > 500) {
			return { isValid: false, error: 'Address is too long' };
		}

		// Check for potentially dangerous characters
		const dangerousPattern = /[<>{}[\]\\]/;
		if (dangerousPattern.test(address)) {
			return { isValid: false, error: 'Address contains invalid characters' };
		}

		return { isValid: true };
	}

	async function searchAddress(query: string, isSource: boolean) {
		if (!query.trim()) {
			if (isSource) {
				sourceSuggestions = [];
				showSourceSuggestions = false;
			} else {
				destinationSuggestions = [];
				showDestinationSuggestions = false;
			}
			return;
		}

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
				{
					headers: {
						'Accept-Language': 'en'
					}
				}
			);
			const data = await response.json();
			
			if (isSource) {
				sourceSuggestions = data;
				showSourceSuggestions = true;
			} else {
				destinationSuggestions = data;
				showDestinationSuggestions = true;
			}
		} catch (err) {
			console.error('Error fetching suggestions:', err);
		}
	}

	function handleAddressInput(value: string, isSource: boolean) {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			searchAddress(value, isSource);
		}, 300);
	}

	function selectAddress(address: any, isSource: boolean) {
		if (isSource) {
			sourceAddress = address.display_name;
			showSourceSuggestions = false;
		} else {
			destinationAddress = address.display_name;
			showDestinationSuggestions = false;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.address-input-container')) {
			showSourceSuggestions = false;
			showDestinationSuggestions = false;
		}
	}

	async function calculateDistance() {
		// Clear any existing errors
		error = null;
		showErrorPopup = false;

		// Validate both addresses before making the request
		const sourceValidation = validateAddress(sourceAddress);
		const destValidation = validateAddress(destinationAddress);

		if (!sourceValidation.isValid) {
			error = `Source address: ${sourceValidation.error}`;
			showErrorPopup = true;
			return;
		}

		if (!destValidation.isValid) {
			error = `Destination address: ${destValidation.error}`;
			showErrorPopup = true;
			return;
		}

		loading = true;
		distance = null;

		try {
			// Sanitize inputs before sending
			const sanitizedSource = encodeURIComponent(sourceAddress.trim());
			const sanitizedDest = encodeURIComponent(destinationAddress.trim());

			const response = await fetch(`${API_URL}/calculate-distance`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					sourceAddress: sanitizedSource,
					destinationAddress: sanitizedDest
				})
			});

			const data = await response.json();
			
			if (data.status === 'success') {
				if (unit === 'both') {
					distance = `${Number(data.data.distances.miles).toFixed(2)} mi / ${Number(data.data.distances.kilometers).toFixed(2)} km`;
				} else if (unit === 'miles') {
					distance = `${Number(data.data.distances.miles).toFixed(2)} mi`;
				} else {
					distance = `${Number(data.data.distances.kilometers).toFixed(2)} km`;
				}
			} else {
				error = data.message || 'Something went wrong and the calculation failed.';
				showErrorPopup = true;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong and the calculation failed.';
			showErrorPopup = true;
			console.error('Error:', err);
		} finally {
			loading = false;
		}
	}
</script>

<style>
	@keyframes slide-up {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.animate-slide-up {
		animation: slide-up 0.3s ease-out forwards;
	}
</style>

<svelte:window on:click={handleClickOutside} />

{#if showErrorPopup && error}
	<div class="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
		<div class="w-full rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5">
			<div class="flex items-start space-x-4">
				<div class="flex-shrink-0">
					<svg class="size-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
					</svg>
				</div>
				<div class="flex-1">
					<h3 class="text-sm font-medium text-gray-900">Calculation failed</h3>
					<p class="mt-1 text-sm text-gray-500">{error}</p>
				</div>
				<button
					class="ml-4 inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
					on:click={closeErrorPopup}
				>
					<span class="sr-only">Close</span>
					<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
						<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if}

<div class="space-y-6 bg-white p-[16px]">
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-6">
		<div class="flex flex-col lg:col-span-2 address-input-container relative">
			<label for="source" class="mb-1 text-[14px]">Source Address</label>
			<input
				type="text"
				id="source"
				placeholder="Input address"
				bind:value={sourceAddress}
				on:input={(e) => handleAddressInput(e.currentTarget.value, true)}
				class="h-[40px] border-b border-gray-400 bg-gray-100 p-2 px-3 text-[14px] text-[#1B1A1A] focus:border-black focus:outline-none"
			/>
			{#if showSourceSuggestions && sourceSuggestions.length > 0}
				<div class="absolute z-10 top-15 mt-1 w-full rounded-md bg-white shadow-lg">
					<ul class="max-h-60 overflow-auto py-1 text-base">
						{#each sourceSuggestions as suggestion}
							<li
								class="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
								on:click={() => selectAddress(suggestion, true)}
							>
								{suggestion.display_name}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>

		<div class="flex flex-col lg:col-span-2 address-input-container relative">
			<label for="destination" class="mb-1 text-[14px]">Destination Address</label>
			<input
				type="text"
				id="destination"
				placeholder="Input address"
				bind:value={destinationAddress}
				on:input={(e) => handleAddressInput(e.currentTarget.value, false)}
				class="h-[40px] border-b border-gray-400 bg-gray-100 p-2 px-3 text-[14px] text-[#1B1A1A] focus:border-black focus:outline-none"
			/>
			{#if showDestinationSuggestions && destinationSuggestions.length > 0}
				<div class="absolute z-10 top-15 mt-1 w-full rounded-md bg-white shadow-lg">
					<ul class="max-h-60 overflow-auto py-1 text-base">
						{#each destinationSuggestions as suggestion}
							<li
								class="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
								on:click={() => selectAddress(suggestion, false)}
							>
								{suggestion.display_name}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>

		<div class="flex flex-col">
			<span class="mb-1 text-[14px]">Unit</span>
			<div class="flex gap-4 pt-2 sm:flex-col sm:gap-2">
				<label class="flex cursor-pointer items-center space-x-2">
					<input
						type="radio"
						name="unit"
						value="miles"
						bind:group={unit}
						checked
						class="text-black-600 focus:ring-black-600 accent-black"
					/>
					<span class="text-[14px]">Miles</span>
				</label>
				<label class="flex cursor-pointer items-center space-x-2">
					<input
						type="radio"
						name="unit"
						value="kilometers"
						bind:group={unit}
						class="text-black-600 focus:ring-black-600 accent-black"
					/>
					<span class="text-[14px]">Kilometers</span>
				</label>
				<label class="flex cursor-pointer items-center space-x-2">
					<input
						type="radio"
						name="unit"
						value="both"
						bind:group={unit}
						class="text-black-600 focus:ring-black-600 accent-black"
					/>
					<span class="text-[14px]">Both</span>
				</label>
			</div>
		</div>

		<div class="flex flex-col">
			<span class="mb-1 text-[14px]">Distance</span>
			{#if loading}
				<span class="text-sm text-gray-600">Calculating...</span>
			{:else if distance}
				<span class="text-sm font-medium">{distance}</span>
			{/if}
		</div>
	</div>

	<button
		disabled={!isValid || loading}
		class="cursor-pointer disabled:cursor-not-allowed inline-flex w-full items-center justify-center space-x-2 bg-[#D10001] px-[13px] py-[12px] text-sm font-[400] text-[#FFFFFF] disabled:bg-[#BBBBB9] disabled:text-[#7D7D7C] sm:w-auto"
		on:click={calculateDistance}
	>
		<span class="pr-[20px]">Calculate Distance</span>
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
	</button>
</div>
