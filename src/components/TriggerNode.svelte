<script lang="ts">
  import { getContext } from 'svelte';
  import { lookupIcon } from "../model-operations";
  import type { Node, BrowserUIModel } from "@visuallyjs/browser-ui";
  import LeafAction from "./LeafAction.svelte";
  import NodeOptions from "./NodeOptions.svelte";

  let { vertex, data, model } = $props<{
      vertex: Node;
      data: any;
      model: BrowserUIModel;
  }>();

  const { selectTrigger } = getContext<any>('builderContext');

  const isLeaf = $derived(vertex.getAllSourceEdges().length === 0);
  const isUnset = $derived(!data.provider || !data.trigger);
</script>

<div class="vjs-ai-node vjs-ai-trigger-node">
  {#if !isUnset}
    <div class="vjs-ai-node-header">
      <img class="vjs-ai-node-icon" src={lookupIcon(data)} alt={data.provider || ''} />
      <div class="vjs-ai-node-name" title={data.name}>{ data.name }</div>
      <NodeOptions {vertex} {model} />
    </div>
    <div class="vjs-ai-node-body">
      <div class="vjs-ai-node-summary">{ data.summary }</div>
    </div>
  {/if}
  {#if isUnset}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div style="padding:15px; margin:0 auto; text-align:center" onclick={() => selectTrigger(vertex, model)}>
      Select Trigger
    </div>
  {/if}
  {#if isLeaf}
    <LeafAction />
  {/if}
  <img src="/icons/trigger-top.svg" class="vjs-ai-trigger-top" alt="" style="background-color: { isUnset ? 'white' : '#f8f9fa' }" />
</div>
