import { type Edge, EVENT_TAP, type VisuallyJsModel, type Node } from "@visuallyjs/browser-ui"
import type { SvelteSurfaceViewOptions } from "@visuallyjs/browser-ui-svelte"
import { isCondition } from "./model-operations"

import WorkflowNode from "./components/WorkflowNode.svelte"
import TriggerNode from "./components/TriggerNode.svelte"
import DecisionNode from "./components/DecisionNode.svelte"
import AgentNode from "./components/AgentNode.svelte"
import PlaceholderNode from "./components/PlaceholderNode.svelte"
import EdgeOverlay from "./components/EdgeOverlay.svelte"

export default function getViewOptions(): SvelteSurfaceViewOptions {
    return {
        nodes: {
            trigger: {
                component: TriggerNode
            },
            decision: {
                component: DecisionNode,
                parent: "default"
            },
            agent: {
                component: AgentNode,
                parent: "default"
            },
            placeholder: {
                component: PlaceholderNode
            },
            default: {
                component: WorkflowNode,
                events: {
                    [EVENT_TAP]: (p: any) => {
                        p.model.setSelection(p.obj)
                    }
                }
            }
        },
        edges: {
            default: {
                overlays: [{
                    component: EdgeOverlay,
                    options: {
                        location: 0.5
                    }
                }]
            },
            placeholder: {
                cssClass: "vjs-ai-placeholder-edge"
            }
        }
    }
}
