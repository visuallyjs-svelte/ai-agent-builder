import {PlainArrowOverlay, HierarchyLayout, type AnchorSpec, AnchorLocations} from "@visuallyjs/browser-ui";

const renderOptions = {
    edges:{
        anchors:[AnchorLocations.ContinuousBottom, AnchorLocations.Top] as [AnchorSpec, AnchorSpec],
        detachable:false,
        targetMarker:{
            type:PlainArrowOverlay.type,
            options:{ width:12, length:12 }
        }
    },
    consumeRightClick:false,
    zoomToFit:true,
    elementsDraggable:false,
    layout:{
        type:HierarchyLayout.type,
        options:{ padding:{x:80, y:100 } }
    },
    dragOptions:{
        cssFilter:".vjs-ai-node-add-button, .vjs-ai-node-add-button *"
    },
    relayoutOnVertexRemove:true,
    relayoutOnEdgeConnect:true,
    relayoutOnResize:true  // when a node changes size, run the layout again. we dont switch this on by default but with the hierarchy layout it can be a good idea.
};

export default renderOptions;
