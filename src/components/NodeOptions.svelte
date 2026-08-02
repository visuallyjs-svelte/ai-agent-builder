<script lang="ts">
  import { getContext } from 'svelte';
  import type { Vertex, BrowserUIModel } from "@visuallyjs/browser-ui";
  import DeleteNode from "./DeleteNode.svelte";
  import { setTrigger } from "../model-operations";

  let { vertex, model } = $props<{
      vertex: Vertex;
      model: BrowserUIModel;
  }>();

  const popupContext = getContext<any>('popupContext');
  const isTrigger = $derived(vertex.type === 'trigger');

  const handleSelectAction = (item: any) => {
      if (isTrigger) {
          setTrigger(vertex as any, model, item);
      } else {
        model.updateNode(vertex, {
          provider: item.provider,
          name: item.name,
          summary: item.desc,
          type:item.id
        });
      }
  };

  const handleOpenBrowser = () => {
      popupContext.openActionBrowser({
          action: isTrigger ? 'set-trigger' : 'change-action',
          excludedActions: [{ id: isTrigger ? vertex.data.trigger : vertex.type }]
      }, handleSelectAction);
  };
</script>

<div class="vjs-ai-node-options" data-vjs-no-events="true">
    <button class="vjs-ai-node-options-button">
        <img src="/icons/more-horizontal.svg" width="16" height="16" alt="Options" />
    </button>
    <div class="vjs-ai-node-options-menu">
        <DeleteNode {vertex} {model} label="Delete Node" />
        <button class="vjs-ai-node-options-menu-item" onclick={handleOpenBrowser}>
            Change { isTrigger ? 'trigger' : 'action' }
        </button>
    </div>
</div>
