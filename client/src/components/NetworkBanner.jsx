import React, { useMemo } from 'react';
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Procedural pseudo-random generator based on seed string
function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function generateGraph(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
    }
    const rand = mulberry32(hash);

    const numNodes = 15 + Math.floor(rand() * 20); // 15 to 34 nodes
    const nodes = [];
    const edges = [];
    const edgeSet = new Set();

    const colors = [
        "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", 
        "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", 
        "#8b5cf6", "#a855f7", "#d946ef", "#f43f5e"
    ];

    for (let i = 0; i < numNodes; i++) {
        const size = 10 + rand() * 25; // 10 to 35px
        nodes.push({
            id: `node-${i}`,
            position: { x: rand() * 1000, y: rand() * 300 },
            data: { label: '' },
            type: 'default', // standard node
            style: {
                width: size,
                height: size,
                borderRadius: '50%',
                background: colors[Math.floor(rand() * colors.length)],
                border: 'none',
                opacity: 0.7,
                minWidth: size, // override react flow default padding
                padding: 0
            }
        });
    }

    // Connect some nodes randomly
    for (let i = 0; i < numNodes * 1.5; i++) {
        const source = Math.floor(rand() * numNodes);
        let target = Math.floor(rand() * numNodes);
        while (target === source) {
            target = Math.floor(rand() * numNodes);
        }
        const edgeId = `e-${source}-${target}`;
        if (!edgeSet.has(edgeId)) {
            edgeSet.add(edgeId);
            edges.push({
                id: edgeId,
                source: `node-${source}`,
                target: `node-${target}`,
                style: { stroke: 'rgba(150, 150, 150, 0.25)', strokeWidth: 1.5 },
                animated: rand() > 0.5 // animate half of the edges
            });
        }
    }

    return { nodes, edges };
}

export default function NetworkBanner({ username = "default", className = "" }) {
    const { nodes, edges } = useMemo(() => generateGraph(username), [username]);

    return (
        <div className={`w-full h-full ${className}`} style={{ pointerEvents: 'none' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                panOnDrag={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                fitView
                fitViewOptions={{ padding: 0.1 }}
                proOptions={{ hideAttribution: true }} // clean UI for banner
            >
                <Background color="rgba(150,150,150,0.05)" variant={BackgroundVariant.Dots} gap={15} size={1.5} />
            </ReactFlow>
        </div>
    );
}
