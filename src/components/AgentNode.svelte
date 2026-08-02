<script lang="ts">
  import { getContext } from 'svelte';
  import DeleteNode from "./DeleteNode.svelte";
  import { lookupIcon } from "../model-operations";
  import type { BrowserUIModel, Node, ObjectData } from "@visuallyjs/browser-ui";
  import type { Action } from "../definitions";

  let { vertex, data, model } = $props<{
      vertex: Node;
      data: ObjectData;
      model: BrowserUIModel;
  }>();

  const popupContext = getContext<any>('popupContext');
  const { addSkill } = getContext<any>('builderContext');
  
  const skills = $derived(data.skills || []);

  const removeSkill = (skillId: string, skillName: string) => {
      popupContext.confirm({
          title: "Remove Skill?",
          message: `Are you sure you want to remove the skill "${skillName}"?`,
          onConfirm: () => {
              model.updateNode(vertex, {
                  skills: skills.filter((s: Action) => s.id !== skillId)
              });
          }
      });
  };
</script>

<div class="vjs-ai-node">
  <div class="vjs-ai-node-header">
    <div class="vjs-ai-node-name" title={data.name}>{ data.name || "Agent" }</div>
    <button data-vjs-no-events="true" class="vjs-ai-button vjs-ai-agent-add-skill-button" style="padding: 4px 8px; font-size: 12px" onclick={() => addSkill(vertex, model)}>
      + Skill
    </button>
    <DeleteNode {vertex} {model} />
  </div>
  <div class="vjs-ai-node-body">
    <div class="agent-skills-list">
      {#each skills as skill (skill.id)}
        <div class="agent-skill-item">
          <img src={lookupIcon(skill)} alt={skill.provider} class="agent-skill-icon" />
          <span class="agent-skill-name">{ skill.name }</span>
          <button data-vjs-no-events="true" class="agent-skill-delete" onclick={() => removeSkill(skill.id, skill.name)} title="Remove Skill"></button>
        </div>
      {/each}
    </div>
  </div>
  {#each (data.conditions || []) as condition (condition.id)}
    <div data-vjs-port={condition.id} data-vjs-source={true}></div>
  {/each}
</div>
