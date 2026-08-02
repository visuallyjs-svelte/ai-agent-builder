import {getDownstreamVertices, VisuallyJsModel, Vertex, Node, ObjectData, uuid, isPort, APPEND_TO_CURRENT} from "@visuallyjs/browser-ui";
import Providers from "./providers"
import {Action} from "./definitions";

export const iconBase = "https://visuallyjs.github.io/img/ai-providers"

/**
 * Returns whether or not the given vertex is a condition port on a decision node.
 * @param obj
 */
export function isCondition(obj:Vertex):boolean {
    return isPort(obj) && (obj.parent.type === "decision" || obj.parent.type === "agent")
}

export function lookupIcon(data:any) {
    const provider = Providers.find(p => p.id === data.provider)
    return provider ? `${iconBase}/${provider.icon}`:  "/default-icon.svg"
}

/**
 * Add a child action to some vertex. Inside a transaction, a new node is created, and an edge is created to join that node to the vertex passed in here.
 */
export function addChildAction(action:Action, {obj, model}:{obj:Vertex, model:VisuallyJsModel}) {
    addChild(obj, action.id, {
        provider:action.provider,
        name:action.name,
        summary:action.desc
    }, model)
}

/**
 * replace a placeholder with an action - inside a transaction, the placeholder is removed (which removes the edge to the placeholder), a new action node is added, and then an edge is added to connect that action node to the placeholder's original parent.
 */
export function replacePlaceholderWithAction(action:Action, {obj, model}:{obj:Vertex, model:VisuallyJsModel}) {
    replacePlaceholder(obj, action.id, {
        provider:action.provider,
        name:action.name,
        summary:action.desc
    }, model)
}

/**
 * Add a new node and connect via an edge to the given source vertex, inside a transaction.
 */
export function addChild(source:Vertex, type:string, payload:ObjectData, model:VisuallyJsModel) {
    model.transaction(() => {
        model.addFactoryNode(type, payload, (n:Node) => {
            model.addEdge({source, target:n})
            attachPlaceholders(n, model)
        })
    })
}

function attachPlaceholders(node:Node, model:VisuallyJsModel) {
    if (node.type === "decision" || node.type === "agent") {
        model.transaction(() => {
            const d1 = model.addNode({type:"placeholder"})
            const d2 = model.addNode({type:"placeholder"})
            model.addEdge({source: node.getPort("1"), target: d1, data:{type:"placeholder"}})
            model.addEdge({source: node.getPort("2"), target: d2, data:{type:"placeholder"}})
        }, APPEND_TO_CURRENT)
    }
}

/**
 * for the given decision node, ensure that it has at least one child placeholder node (ie. create one and attach it if not)
 * @param node
 * @param model
 */
function ensureMinimumPlaceholders(node:Node, model:VisuallyJsModel) {
    const placeholders = node.getAllSourceEdges().filter(e => e.target.type === "placeholder")
    if (placeholders.length === 0) {
        const port = model.addPort(node, {
            id: uuid()
        })
        const newPlaceholder = model.addNode({type: "placeholder"})
        model.addEdge({source: port, target: newPlaceholder})
    }
}

/**
 * replace the given placeholder with a new node, defined by `type` and `payload`, then connect the new node with the original parent. If the original parent vertex is a decision vertex, also ensure that it has at least one placeholder child.
 * @param placeholder
 * @param type
 * @param payload
 * @param model
 */
export function replacePlaceholder(placeholder:Vertex, type:string, payload:ObjectData, model:VisuallyJsModel) {
    const incomingEdgeSource = placeholder.getTargetEdges()[0].source
    model.transaction(() => {
        model.removeNode(placeholder)
        model.addFactoryNode(type, payload, (n:Node) => {
            model.addEdge({source:incomingEdgeSource, target:n})
            if (isPort(incomingEdgeSource) && (incomingEdgeSource.parent.type === "decision" || incomingEdgeSource.parent.type === "agent")) {
                ensureMinimumPlaceholders(incomingEdgeSource.parent, model)
            }
            attachPlaceholders(n, model)
        })
    })
}

/**
 * remove the given vertex and everything downstream from it
 * @param obj
 * @param model
 */
function cascadeRemove(obj: Vertex, model: VisuallyJsModel) {
    const ds = getDownstreamVertices(obj, false)
    ds.forEach(v => cascadeRemove(v, model))
    model.remove(obj)
}

// Delete the given vertex and everything downstream
export function deleteVertex(obj: Vertex, model: VisuallyJsModel) {
    model.transaction(() => {
        cascadeRemove(obj, model)
    })
}

export function deleteCondition(obj:Node, conditionId:string, model:VisuallyJsModel) {
    const port = obj.getPort(conditionId)
    deleteVertex(port, model)
}

export function addCondition(obj:Node,  model:VisuallyJsModel) {
    model.transaction(() => {
        const p = model.addPort(obj, {id:uuid(), label:"Condition"})
        const d1 = model.addNode({type:"placeholder"})
        model.addEdge({source: p, target: d1, data:{type:"placeholder"}})
    })
}

export function setTrigger(obj:Node, model:VisuallyJsModel, trigger:any) {
    model.updateNode(obj, {
        provider: trigger.provider,
        trigger: trigger.id,
        name: trigger.name,
        summary: trigger.desc
    })
}

export function addAgentSkill(obj: Node, model: VisuallyJsModel, skill: any) {
    const skills = obj.data.skills || []
    model.updateNode(obj, {
        skills: [...skills, skill]
    })
}
