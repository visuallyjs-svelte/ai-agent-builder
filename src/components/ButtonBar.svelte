<script lang="ts">
  import {useSurface } from "@visuallyjs/browser-ui-svelte";

  const surface = useSurface()
  let fileInputRef = $state<HTMLInputElement | null>(null);

  const zoomToFit = () => {
      surface.current?.zoomToFit();
  };

  const undo = () => {
      surface.current?.model.undo();
  };

  const redo = () => {
      surface.current?.model.redo();
  };

  const save = () => {
      if (!surface.current) return;
      const data = surface.current.model.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "workflow.json";
      a.click();
      URL.revokeObjectURL(url);
  };

  const load = () => {
      fileInputRef?.click();
  };

  const handleFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file && surface.current) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const content = e.target?.result as string;
              try {
                  const data = JSON.parse(content);
                  surface.current.model.clear();
                  surface.current.model.load({ data });
              } catch (err) {
                  console.error("Failed to parse file", err);
              }
          };
          reader.readAsText(file);
      }
      // reset input
      target.value = "";
  };

  const newWorkflow = () => {
      if (!surface.current) return;
      surface.current.model.clear();
      surface.current.model.addNode({
        type: "trigger",
        name: "New Trigger",
        summary: "Configure this trigger"
      });
      surface.current.zoomToFit();
  };
</script>

{#if surface.current}
  <div class="vjs-button-bar">
    <button onclick={zoomToFit} title="Zoom To Fit">
      <img src="/icons/zoom-to-fit.svg" width="16" height="16" alt="Zoom To Fit" />
      <span>Zoom To Fit</span>
    </button>
    <div class="vjs-button-bar-separator"></div>
    <button onclick={undo} title="Undo">
      <img src="/icons/undo.svg" width="16" height="16" alt="Undo" />
      <span>Undo</span>
    </button>
    <button onclick={redo} title="Redo">
      <img src="/icons/redo.svg" width="16" height="16" alt="Redo" />
      <span>Redo</span>
    </button>
    <div class="vjs-button-bar-separator"></div>
    <button onclick={save} title="Save">
      <img src="/icons/save.svg" width="16" height="16" alt="Save" />
      <span>Save</span>
    </button>
    <button onclick={load} title="Load">
      <img src="/icons/load.svg" width="16" height="16" alt="Load" />
      <span>Load</span>
    </button>
    <button onclick={newWorkflow} title="New">
      <img src="/icons/plus.svg" width="16" height="16" alt="New" />
      <span>New</span>
    </button>
    <input type="file" bind:this={fileInputRef} style="display: none" onchange={handleFileChange} accept=".json" />
  </div>
{/if}
