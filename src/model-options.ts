import { ModelOptions, VisuallyJsModel, ObjectData, Port, Group, Node, EVENT_GRAPH_CLEARED } from "@visuallyjs/browser-ui"

const factories:Record<string, (o:ObjectData) => ObjectData> = {
    "decision":(data:ObjectData) => Object.assign({
        conditions:[{ id:"1", label:"Condition One" }, { id:"2", label:"Condition Two" }]
    }, data),
    "agent":(data:ObjectData) => Object.assign({
        conditions:[{ id:"1", label:"Condition One" }, { id:"2", label:"Condition Two" }],
        skills:[]
    }, data)
}

/**
 * Provide a nodeFactory, which is responsible for initializing datasets, and a port extractor function, which is responsible for locating ports on some node. The `decision` node type has ports, modelling each of the available decisions. The other node types do not.
 */
const modelOptions:ModelOptions = {
    nodeFactory:(_model:VisuallyJsModel, type:string, data:ObjectData, continueCallback:(d:ObjectData) => void, _abortCallback:() => void) => {
        const newData = factories[type] ? factories[type](data) : data
        continueCallback(newData)
        return true
    },
    portExtractor:(o:ObjectData) => {
        return o.conditions || []
    },
    portUpdater:(data:ObjectData, _nodeOrGroup:Node|Group, ports:Array<Port>):ObjectData => {
        return Object.assign(data, {
            conditions:ports.map(p => p.data)
        })
    },
    events:{
        [EVENT_GRAPH_CLEARED]:(model:VisuallyJsModel) => console.log(model)
    }
}

export default modelOptions
