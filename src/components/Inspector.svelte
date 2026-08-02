<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import { isNode, type VisuallyJsModel, type Node, isPort, getDownstreamVertices } from "@visuallyjs/browser-ui";
  import {BrowserUISvelteModel, InspectorComponent, useVisuallyJsModel} from "@visuallyjs/browser-ui-svelte";
  import type { Action, ActionList } from "../definitions";
  import { addCondition, deleteCondition } from "../model-operations";

  let currentObj = $state<Node|null>(null)
  let providers = $state<ActionList[]>([]);
  const popupContext = getContext<any>('popupContext');

  let model = $state<BrowserUISvelteModel>()
  useVisuallyJsModel().then((s:BrowserUISvelteModel) => model = s)

  onMount(async () => {
    try {
      const response = await fetch('/actions.json');
      providers = await response.json();
    } catch (error) {
      console.error('Error loading actions:', error);
    }
  });

  function getAction(obj: Node): Action | null {
    if (!obj || !isNode(obj) || !obj.data) return null;
    const { type, provider: providerId } = obj.data;
    if (!type || !providerId) return null;
    const provider = providers.find(p => p.provider.toLowerCase() === providerId.toLowerCase());
    if (!provider) return null;
    return provider.actions.find(a => a.id === type) || null;
  }

  function doDeleteCondition(decision: any, conditionId: string, model: VisuallyJsModel) {
    const port = decision.getPort(conditionId);
    const ds = getDownstreamVertices(port, false);
    if (ds.length > 0) {
      popupContext.confirm({
        title: "Delete Condition?",
        message: "This condition has downstream vertices which will also be deleted. Are you sure?",
        onConfirm: () => deleteCondition(decision, conditionId, model)
      });
    } else {
      deleteCondition(decision, conditionId, model);
    }
  }

  const clearSelection = () => model.clearSelection();
</script>

<InspectorComponent bind:current={currentObj}>
    {#if currentObj != null}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="modal-overlay" onclick={clearSelection}>
        <div class="modal-content inspector-modal" onclick={(e) => e.stopPropagation()}>
          <div class="vjs-ai-inspector">
            
            <div class="vjs-inspector-header">
              <div class="vjs-inspector-title">
                {#if isPort(currentObj)}
                  <h3>Prompt</h3>
                {:else}
                    {#if currentObj.type === 'decision'}
                        <h3>Decision</h3>
                    {:else if currentObj.type === 'agent'}
                        <h3>Agent</h3>
                    {:else}
                        {#if getAction(currentObj)}
                            <h3>{ getAction(currentObj)!.name }</h3>
                            <p>{ getAction(currentObj)!.desc }</p>
                        {:else}
                            <h3>Action not found!</h3>
                        {/if}
                    {/if}
                {/if}
              </div>
              <button class="close-button" onclick={clearSelection} title="Close">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="vjs-inspector-properties">
              {#if isPort(currentObj)}
                <div class="vjs-inspector-field">
                  <label for="vjs-port-label">Name</label>
                  <input type="text" id="vjs-port-label" vjs-att="label" placeholder="Label" vjs-focus />
                </div>
              {:else}
                <div class="vjs-inspector-field">
                  <label for="vjs-node-name">Name</label>
                  <input type="text" id="vjs-node-name" vjs-att="name" placeholder="Name" />
                </div>
                
                {#if currentObj.type === 'agent'}
                  <div class="vjs-inspector-field">
                    <label for="vjs-agent-prompt">Prompt</label>
                    <textarea id="vjs-agent-prompt" vjs-att="prompt" placeholder="Prompt" rows="5"></textarea>
                  </div>
                {:else}
                  <div class="vjs-inspector-field">
                    <label for="vjs-node-summary">Summary</label>
                    <textarea id="vjs-node-summary" vjs-att="summary" placeholder="Summary" rows="3"></textarea>
                  </div>
                {/if}

                <div class="vjs-inspector-divider" style="margin: 15px 0; border-top: 1px solid #eee"></div>

                {#if currentObj.type === 'decision' || currentObj.type === 'agent'}
                  <div class="vjs-inspector-field-row" style="justify-content: space-between; align-items: center; display: flex">
                    <h4>Conditions</h4>
                    <button class="vjs-ai-button" onclick={() => addCondition(currentObj as Node, model)} title="Add Condition">
                      Add Condition
                    </button>
                  </div>
                  {#each (currentObj.data.conditions || []) as condition (condition.id)}
                    <div class="vjs-inspector-field vjs-inspector-field-row">
                      <input type="text" placeholder="Label" vjs-att="label" vjs-port={condition.id} />
                      <button class="vjs-ai-delete-button" data-vjs-no-events="true" onclick={() => doDeleteCondition(currentObj, condition.id, model)}>
                        <img src="/icons/trash.svg" alt="Delete" style="width: 100%; height: 100%" />
                      </button>
                    </div>
                  {/each}
                {:else}
                  {#if getAction(currentObj) && getAction(currentObj)!.properties}
                    {#each getAction(currentObj)!.properties! as prop (prop.id)}
                      <div class="vjs-inspector-field">
                        <label for={prop.id}>{ prop.name }</label>
                        {#if prop.datatype === 'string'}
                            <textarea id={prop.id} vjs-att={prop.id} placeholder={prop.desc} rows="3"></textarea>
                        {:else if prop.datatype === 'number'}
                            <input id={prop.id} type="number" vjs-att={prop.id} placeholder={prop.desc} />
                        {:else if prop.datatype === 'boolean'}
                            <select id={prop.id} vjs-att={prop.id}>
                                <option value=""></option>
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                        {:else if prop.datatype === 'array'}
                            <textarea id={prop.id} vjs-att={prop.id} placeholder={`${prop.desc} (comma separated)`} rows="2"></textarea>
                        {:else}
                            <input id={prop.id} type="text" vjs-att={prop.id} placeholder={prop.desc} />
                        {/if}
                        <div class="vjs-field-desc">{ prop.desc }</div>
                      </div>
                    {/each}
                  {/if}
                {/if}
              {/if}
            </div>

            <div class="vjs-inspector-footer">
              <button class="vjs-ai-button" onclick={clearSelection}>Done</button>
            </div>
          </div>
        </div>
      </div>
    {/if}
</InspectorComponent>
