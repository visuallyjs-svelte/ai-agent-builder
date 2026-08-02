<script lang="ts">
  import { getContext } from 'svelte';
  import type { BrowserUIModel, Vertex, BrowserUI } from "@visuallyjs/browser-ui";
  import { addChild, replacePlaceholder } from "../model-operations";

  let { vertex, model, ui, hide } = $props<{
      vertex: Vertex | null,
      model: BrowserUIModel | null | undefined,
      ui: BrowserUI | null,
      hide: () => void
  }>();

  const { addAction } = getContext<any>('builderContext');

  function addConditionNode(e: MouseEvent, type: string, name: string, payload: () => any) {
      e.stopPropagation();
      const pl = Object.assign(payload() || {}, { name });
      if (vertex && model) {
          if (vertex.type === "placeholder") {
              replacePlaceholder(vertex, type, pl, model);
          } else {
              addChild(vertex, type, pl, model);
          }
      }
      hide();
  }

  function doAddAction(e: MouseEvent) {
      e.stopPropagation();
      if (vertex && model) {
          addAction(vertex, model);
      }
      hide();
  }
</script>

{#if vertex}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="vjs-next-step">
    <div onclick={doAddAction}>
      <img src="/icons/action.svg" width="16" height="16" alt="Action" style="margin-right: 10px" />
      Perform an action
    </div>
    <div onclick={(e: MouseEvent) => addConditionNode(e, 'decision', 'Decision', () => ({}))}>
      <img src="/icons/condition.svg" width="16" height="16" alt="Condition" style="margin-right: 10px" />
      Decision
    </div>
    <div onclick={(e: MouseEvent) => addConditionNode(e, 'agent', 'Agent', () => ({ skills: [] }))}>
      <img src="/icons/ai.svg" width="16" height="16" alt="AI" style="margin-right: 10px" />
      Enter AI agent
    </div>
  </div>
{/if}
