<script lang="ts">
  import DeleteNode from "./DeleteNode.svelte";
  import { lookupIcon } from "../model-operations";
  import type { Node, BrowserUIModel } from "@visuallyjs/browser-ui";

  let { vertex, data, model } = $props<{
      vertex: Node;
      data: any;
      model: BrowserUIModel;
  }>();
</script>

<div class="decision-node vjs-ai-node">
  <div class="vjs-ai-node-header">
    <img class="vjs-ai-node-icon" src={lookupIcon(data)} alt={data.provider || ''} />
    <div class="vjs-ai-node-name" title={data.name}>{ data.name }</div>
    <DeleteNode {vertex} {model} />
  </div>
  {#each (data.conditions || []) as condition (condition.id)}
    <div data-vjs-port={condition.id} data-vjs-source={true}></div>
  {/each}
</div>
