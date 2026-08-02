<script lang="ts">
  import type { Edge, VisuallyJsModel } from "@visuallyjs/browser-ui"
  import { isCondition } from "../model-operations"

  let { edge, model } = $props<{
      edge: Edge;
      model: VisuallyJsModel;
  }>();

  const label = $derived(edge.source.data.label);
  const isDecision = $derived(isCondition(edge.source));
</script>

{#if isDecision && label}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class='condition-label'>
      <span onclick={() => model.setSelection(edge.source)}>{ label }</span>
  </div>
{/if}
