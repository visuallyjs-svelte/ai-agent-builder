<script lang="ts">
  import { lookupIcon } from "../model-operations";
  import NodeOptions from "./NodeOptions.svelte";
  import type { Node, BrowserUIModel } from "@visuallyjs/browser-ui";
  import LeafAction from "./LeafAction.svelte";

  let { vertex, data, model } = $props<{
      vertex: Node;
      data: any;
      model: BrowserUIModel;
  }>();

  const isLeaf = $derived(vertex.getAllSourceEdges().length === 0);
</script>

<div class="vjs-ai-node">
  <div class="vjs-ai-node-header">
    <img class="vjs-ai-node-icon" src={lookupIcon(data)} alt={data.provider || ''} />
    <div class="vjs-ai-node-name" title={data.name}>{ data.name }</div>
    <NodeOptions {vertex} {model} />
  </div>
  <div class="vjs-ai-node-body">
    <div class="vjs-ai-node-summary">{ data.summary }</div>
  </div>
  {#if isLeaf}
    <LeafAction />
  {/if}
</div>
