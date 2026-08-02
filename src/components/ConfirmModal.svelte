<script lang="ts">
  let { isOpen, title, message, onconfirm, oncancel } = $props<{
      isOpen: boolean;
      title: string;
      message: string;
      onconfirm: () => void;
      oncancel: () => void;
  }>();
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={oncancel}>
    <div class="modal-content confirm-modal" onclick={(e) => e.stopPropagation()} style="max-width: 400px">
      <div class="action-browser-header">
        <h3>{ title }</h3>
        <button class="close-button" onclick={oncancel}>
          <img src="/icons/close.svg" width="20" height="20" alt="Close" />
        </button>
      </div>
      <div class="action-browser-content" style="padding: 24px">
        <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.5">
          { message }
        </p>
      </div>
      <div class="vjs-inspector-footer" style="gap: 12px">
        <button class="vjs-ai-button vjs-ai-cancel-button" onclick={oncancel}>
          Cancel
        </button>
        <button class="vjs-ai-button vjs-ai-danger-button" onclick={onconfirm}>
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}
