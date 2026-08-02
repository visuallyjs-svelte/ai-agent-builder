<script lang="ts">
  import { getContext } from 'svelte';
  import { type BrowserUIModel, type Vertex, getDownstreamVertices } from "@visuallyjs/browser-ui";
  import { deleteVertex } from "../model-operations";

  let { vertex, ui, model, label } = $props<{
    vertex: Vertex;
    ui: any;
    model: BrowserUIModel;
    label?: string;
  }>();

  const popupContext = getContext<any>('popupContext');

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    const ds = getDownstreamVertices(vertex, false);
    if (ds.length > 0) {
      popupContext.confirm({
        title: "Delete Node?",
        message: "This node has downstream vertices which will also be deleted. Are you sure?",
        onConfirm: () => deleteVertex(vertex, model, ui)
      });
    } else {
      deleteVertex(vertex, model, ui);
    }
  }
</script>

<button class="vjs-ai-delete-button" data-vjs-no-events="true" onclick={handleDelete}>
  {#if label}
    <span>{ label }</span>
  {:else}
    <img src="/icons/trash.svg" alt="Delete" style="width: 100%; height: 100%" />
  {/if}
</button>
