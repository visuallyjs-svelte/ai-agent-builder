import {Node, VisuallyJsModel} from "@visuallyjs/browser-ui";

export type VertexOperation = (obj:Node, model:VisuallyJsModel) => any

export interface ActionConfigurationProperty {
    id:string
    name:string
    desc:string
    datatype:'string'|'number'|'email'|'array'|'boolean'
}

export interface Action {
    id:string
    name:string
    desc:string
    provider:string
    providerIcon?:string
    properties:Array<ActionConfigurationProperty>
}

export interface Decision {
    id:string
    name:string
    desc:string
    conditions:Array<DecisionCondition>
}

export interface DecisionCondition {
    id:string
    label:string
}

export interface ActionList {
    provider:string
    icon?:string
    actions:Array<Action>
}

export interface ToolProvider {
    id:string
    icon:string
}
