// mapRenderer.js - Canvas-based map visualization

class MapRenderer {
    constructor(canvasId, graph) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.graph = graph;
        
        // Scale factors for rendering
        this.scaleX = 1;
        this.scaleY = 1;
        this.offsetX = 20;
        this.offsetY = 20;
        
        // Colors
        this.colors = {
            background: '#f8f9fa',
            node: '#cbd5e1',
            nodeStroke: '#64748b',
            edge: '#e2e8f0',
            path: '#667eea',
            pickup: '#10b981',
            dropoff: '#ef4444',
            text: '#1e293b',
            visited: '#fbbf24'
        };
        
        // Rendering state
        this.currentPath = [];
        this.pickupNode = null;
        this.dropoffNode = null;
        this.visitedNodes = [];
        
        this.initCanvas();
    }

    /**
     * Initialize canvas and calculate scaling
     */
    initCanvas() {
        // Clear canvas
        this.clear();
        
        // Calculate bounds
        const vertices = Array.from(this.graph.vertices.values());
        if (vertices.length === 0) return;
        
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        vertices.forEach(v => {
            minX = Math.min(minX, v.x);
            maxX = Math.max(maxX, v.x);
            minY = Math.min(minY, v.y);
            maxY = Math.max(maxY, v.y);
        });
        
        // Calculate scale to fit canvas
        const width = this.canvas.width - 2 * this.offsetX;
        const height = this.canvas.height - 2 * this.offsetY;
        
        this.scaleX = width / (maxX - minX || 1);
        this.scaleY = height / (maxY - minY || 1);
        
        // Store bounds for transformation
        this.minX = minX;
        this.minY = minY;
    }

    /**
     * Transform graph coordinates to canvas coordinates
     */
    transform(x, y) {
        return {
            x: (x - this.minX) * this.scaleX + this.offsetX,
            y: (y - this.minY) * this.scaleY + this.offsetY
        };
    }

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draw the entire graph
     */
    drawGraph() {
        this.clear();
        this.drawEdges();
        this.drawNodes();
    }

    /**
     * Draw all edges
     */
    drawEdges() {
        const ctx = this.ctx;
        const drawnEdges = new Set();
        
        for (let [from, edges] of this.graph.edges) {
            const fromVertex = this.graph.getVertex(from);
            const fromPos = this.transform(fromVertex.x, fromVertex.y);
            
            edges.forEach(edge => {
                const edgeKey = [from, edge.to].sort().join('-');
                
                if (drawnEdges.has(edgeKey)) return;
                drawnEdges.add(edgeKey);
                
                const toVertex = this.graph.getVertex(edge.to);
                const toPos = this.transform(toVertex.x, toVertex.y);
                
                // Draw edge
                ctx.strokeStyle = this.colors.edge;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(fromPos.x, fromPos.y);
                ctx.lineTo(toPos.x, toPos.y);
                ctx.stroke();
                
                // Draw distance label
                const midX = (fromPos.x + toPos.x) / 2;
                const midY = (fromPos.y + toPos.y) / 2;
                
                ctx.fillStyle = this.colors.background;
                ctx.fillRect(midX - 15, midY - 8, 30, 16);
                
                ctx.fillStyle = this.colors.nodeStroke;
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${edge.weight}km`, midX, midY);
            });
        }
    }

    /**
     * Draw all nodes
     */
    drawNodes() {
        const ctx = this.ctx;
        
        for (let [name, vertex] of this.graph.vertices) {
            const pos = this.transform(vertex.x, vertex.y);
            
            // Determine node color
            let fillColor = this.colors.node;
            let strokeColor = this.colors.nodeStroke;
            
            if (name === this.pickupNode) {
                fillColor = this.colors.pickup;
                strokeColor = this.colors.pickup;
            } else if (name === this.dropoffNode) {
                fillColor = this.colors.dropoff;
                strokeColor = this.colors.dropoff;
            } else if (this.visitedNodes.includes(name)) {
                fillColor = this.colors.visited;
            }
            
            // Draw node circle
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Draw label
            ctx.fillStyle = this.colors.text;
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(name, pos.x, pos.y + 18);
        }
    }

    /**
     * Draw the shortest path
     */
    drawPath(path) {
        if (!path || path.length < 2) return;
        
        const ctx = this.ctx;
        
        // Draw path edges with animation effect
        ctx.strokeStyle = this.colors.path;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw shadow for depth
        ctx.shadowColor = 'rgba(102, 126, 234, 0.4)';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        
        for (let i = 0; i < path.length - 1; i++) {
            const fromVertex = this.graph.getVertex(path[i]);
            const toVertex = this.graph.getVertex(path[i + 1]);
            
            const fromPos = this.transform(fromVertex.x, fromVertex.y);
            const toPos = this.transform(toVertex.x, toVertex.y);
            
            if (i === 0) {
                ctx.moveTo(fromPos.x, fromPos.y);
            }
            ctx.lineTo(toPos.x, toPos.y);
        }
        
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Draw directional arrows along the path
        this.drawPathArrows(path);
    }

    /**
     * Draw directional arrows along the path
     */
    drawPathArrows(path) {
        const ctx = this.ctx;
        
        ctx.fillStyle = this.colors.path;
        
        for (let i = 0; i < path.length - 1; i++) {
            const fromVertex = this.graph.getVertex(path[i]);
            const toVertex = this.graph.getVertex(path[i + 1]);
            
            const fromPos = this.transform(fromVertex.x, fromVertex.y);
            const toPos = this.transform(toVertex.x, toVertex.y);
            
            // Calculate midpoint
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;
            
            // Calculate angle
            const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
            
            // Draw arrow
            ctx.save();
            ctx.translate(midX, midY);
            ctx.rotate(angle);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-8, -5);
            ctx.lineTo(-8, 5);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
    }

    /**
     * Render complete visualization with path
     */
    render(path, pickup, dropoff, visitedNodes = []) {
        this.currentPath = path;
        this.pickupNode = pickup;
        this.dropoffNode = dropoff;
        this.visitedNodes = visitedNodes;
        
        this.drawGraph();
        
        if (path && path.length > 0) {
            this.drawPath(path);
        }
        
        // Redraw pickup and dropoff nodes on top
        this.drawNodes();
    }

    /**
     * Highlight a specific node
     */
    highlightNode(nodeName, color = '#fbbf24') {
        const vertex = this.graph.getVertex(nodeName);
        if (!vertex) return;
        
        const pos = this.transform(vertex.x, vertex.y);
        const ctx = this.ctx;
        
        // Draw pulsing circle
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * Get canvas as image data URL
     */
    toDataURL() {
        return this.canvas.toDataURL('image/png');
    }
}
