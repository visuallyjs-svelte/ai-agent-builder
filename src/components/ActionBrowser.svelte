<script lang="ts">
  import { onMount } from 'svelte';
  import { iconBase } from "../model-operations";
  import Providers from "../providers";
  import type { Action } from "../definitions";
  import { DatasetIndex } from "@visuallyjs/browser-ui";

  let { context, onclose, onselect } = $props<{
    context: any;
    onclose: () => void;
    onselect: (item: any, context: any) => void;
  }>();

  let providers = $state<any[]>([]);
  let searchTerm = $state('');
  
  const isTrigger = $derived(context?.action === 'set-trigger');
  const dataUrl = $derived(isTrigger ? '/triggers.json' : '/actions.json');
  const itemsKey = $derived(isTrigger ? 'triggers' : 'actions');

  const index = new DatasetIndex({
    fields: ['name', 'desc', 'provider']
  });

  const loadData = async () => {
    try {
      const response = await fetch(dataUrl);
      const data = await response.json();
      
      const enrichedData = data.map((p: any) => {
        if (!p.icon) {
          const providerInfo = Providers.find(pr => pr.id === p.provider);
          return { ...p, icon: providerInfo?.icon };
        }
        p.actions?.forEach((a: any) => a.provider = p.provider);
        p.triggers?.forEach((t: any) => t.provider = p.provider);
        return p;
      });
      providers = enrichedData;

      index.clear();
      enrichedData.forEach((p: any) => {
        index.addAll(...p[itemsKey]);
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  onMount(loadData);
  
  $effect(() => {
    if (dataUrl) {
      loadData();
    }
  });

  const matchingIds = $derived.by(() => {
    if (!searchTerm) return null;
    const hits = index.search(searchTerm);
    return new Set(hits.map(h => h.document.id));
  });

  const handleItemClick = (item: any, provider: any) => {
    onselect({ ...item, provider: provider.provider, providerIcon: provider.icon }, context);
  };

  const title = $derived(context?.title || (isTrigger ? 'Select a Trigger' : 'Select an Action'));

  const excludedActionIds = $derived(new Set((context?.excludedActions || []).map((a: Action) => a.id)));

  const filteredProviders = $derived(
    providers.map(provider => {
        const items = provider[itemsKey] || [];
        const filteredItems = items.filter((item: any) => !matchingIds || matchingIds.has(item.id));
        return { ...provider, filteredItems };
    }).filter(p => p.filteredItems.length > 0)
  );
</script>

<div class="action-browser">
  <div class="action-browser-header">
    <div class="action-browser-header-title">
      <h3>{ title }</h3>
      <input type="text" placeholder="search" bind:value={searchTerm} class="action-browser-search" />
    </div>
    <button class="close-button" onclick={onclose}>
      <img src="/icons/close.svg" width="24" height="24" alt="Close" />
    </button>
  </div>
  <div class="action-browser-content">
    {#each filteredProviders as provider (provider.provider)}
      <div class="provider-section">
        <div class="provider-header">
          <div class="provider-header-icon-container">
            <img src={`${iconBase}/${provider.icon}`} alt={provider.provider} class="provider-header-icon" onerror={(e) => (e.currentTarget as HTMLImageElement).style.display='none'} />
          </div>
          <h2 class="provider-name">{ provider.provider }</h2>
        </div>
        <div class="actions-grid">
          {#each provider.filteredItems as item (item.id)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                 class="action-card"
                 class:action-card-disabled={excludedActionIds.has(item.id)}
                 style={excludedActionIds.has(item.id) ? "opacity: 0.5; pointer-events: none; filter: grayscale(100%)" : ""}
                 onclick={() => !excludedActionIds.has(item.id) && handleItemClick(item, provider)}>
              <div class="action-card-left">
                <img src={`${iconBase}/${provider.icon}`} alt={provider.provider} class="action-card-icon" onerror={(e) => (e.currentTarget as HTMLImageElement).style.display='none'} />
              </div>
              <div class="action-card-content">
                <div class="action-card-name">{ item.name }</div>
                <div class="action-card-desc">{ item.desc }</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
