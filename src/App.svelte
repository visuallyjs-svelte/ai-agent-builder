<script lang="ts">
  import { setContext } from 'svelte';
  import { SurfaceComponent, SurfaceProvider, SurfacePopup, MiniviewComponent, GridBackgroundComponent, ImageBackgroundComponent } from "@visuallyjs/browser-ui-svelte";
  import type { VisuallyJsModel, Vertex, Node } from "@visuallyjs/browser-ui";
  import getViewOptions from "./view-options";
  import renderOptions from "./render-options";
  import modelOptions from "./model-options";
  import ActionBrowser from "./components/ActionBrowser.svelte";
  import ButtonBar from "./components/ButtonBar.svelte";
  import { addAgentSkill, addChildAction, replacePlaceholderWithAction, setTrigger } from "./model-operations";
  import AIInspector from "./components/Inspector.svelte";
  import NextStepPicker from "./components/NextStepPicker.svelte";
  import ConfirmModal from "./components/ConfirmModal.svelte";

  //let { url } = $props<{ url?: string }>();
  let url = "/dataset.json"

  let actionBrowserContext = $state<any>(null);
  let showBrowser = $state(false);
  let activePopupNodeId = $state<string | null>(null);

  let confirmOptions = $state({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const confirm = (options: { title: string; message: string; onConfirm: () => void }) => {
    confirmOptions = {
      isOpen: true,
      title: options.title,
      message: options.message,
      onConfirm: () => {
        options.onConfirm();
        confirmOptions.isOpen = false;
      }
    };
  };

  let externalOnSelect = $state<((item: any) => void) | null>(null);

  const openActionBrowser = (context: any, onSelect: (item: any) => void) => {
    actionBrowserContext = context;
    externalOnSelect = onSelect;
    showBrowser = true;
  };

  setContext('popupContext', {
    get activePopupNodeId() { return activePopupNodeId; },
    setActivePopupNodeId: (id: string | null) => { activePopupNodeId = id; },
    confirm,
    openActionBrowser
  });

  function addAction(obj: Vertex, model: VisuallyJsModel) {
    actionBrowserContext = {
      action: "add-action",
      obj,
      model
    };
    showBrowser = true;
  }

  function selectTrigger(obj: Node, model: VisuallyJsModel): void {
    actionBrowserContext = {
      action: "set-trigger",
      obj,
      model
    };
    showBrowser = true;
  }

  function addSkill(obj: Node, model: VisuallyJsModel): void {
    actionBrowserContext = {
      action: "add-skill",
      obj,
      model,
      title: "Select Skill",
      excludedActions: obj.data.skills || []
    };
    showBrowser = true;
  }

  setContext('builderContext', {
    addAction,
    selectTrigger,
    addSkill
  });

  let surfaceRef = $state<any>(null);

  function handleBrowserSelect(item: any, context: any) {
    showBrowser = false;
    if (externalOnSelect) {
      externalOnSelect(item);
      externalOnSelect = null;
      return;
    }
    switch (context.action) {
      case "add-action": {
        if (context.obj.type === "placeholder") {
          replacePlaceholderWithAction(item, context);
        } else {
          addChildAction(item, context);
        }
        break;
      }
      case "set-trigger": {
        setTrigger(context.obj, context.model, item);
        break;
      }
      case "add-skill": {
        addAgentSkill(context.obj, context.model, item);
        break;
      }
    }
  }
</script>

<div class="vjs-ai-agent-root" style="width: 100vw; height: 100vh; display: flex; flex-direction: column; position: relative">
  <SurfaceProvider>
    <SurfaceComponent {url} viewOptions={getViewOptions()} {renderOptions} {modelOptions} bind:this={surfaceRef}>
      <ButtonBar />
      <SurfacePopup selector=".vjs-next-step-picker">
		  {#snippet popup(vertex, model, ui, hide)}
          	<NextStepPicker vertex={vertex} model={model} ui={ui} {hide} />
		  {/snippet}
      </SurfacePopup>
      <MiniviewComponent />
		<ImageBackgroundComponent url="https://static.visuallyjs.com/img/cow.jpg"/>
    </SurfaceComponent>

    {#if showBrowser}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="modal-overlay" onclick={() => showBrowser = false}>
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
          <ActionBrowser context={actionBrowserContext} onclose={() => showBrowser = false} onselect={handleBrowserSelect} />
        </div>
      </div>
    {/if}

    <AIInspector />
    
    <ConfirmModal 
      isOpen={confirmOptions.isOpen} 
      title={confirmOptions.title} 
      message={confirmOptions.message} 
      onconfirm={confirmOptions.onConfirm} 
      oncancel={() => confirmOptions.isOpen = false} 
    />
  </SurfaceProvider>
</div>
