// dijkstra.js - Dijkstra's shortest path algorithm implementation

/**
 * Priority Queue implementation using Min Heap
 * Used for efficient vertex selection in Dijkstra's algorithm
 */
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    /**
     * Add element to priority queue
     * @param {string} vertex - Vertex name
     * @param {number} priority - Priority value (distance)
     */
    enqueue(vertex, priority) {
        this.heap.push({ vertex, priority });
        this.bubbleUp(this.heap.length - 1);
    }

    /**
     * Remove and return element with minimum priority
     * @returns {Object} Object with vertex and priority
     */
    dequeue() {
        if (this.isEmpty()) return null;
        
        const min = this.heap[0];
        const last = this.heap.pop();
        
        if (!this.isEmpty()) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        
        return min;
    }

    /**
     * Move element up the heap
     * @param {number} index - Index of element
     */
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            
            if (this.heap[index].priority >= this.heap[parentIndex].priority) {
                break;
            }
            
            [this.heap[index], this.heap[parentIndex]] = 
                [this.heap[parentIndex], this.heap[index]];
            
            index = parentIndex;
        }
    }

    /**
     * Move element down the heap
     * @param {number} index - Index of element
     */
    bubbleDown(index) {
        while (true) {
            let minIndex = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            
            if (leftChild < this.heap.length && 
                this.heap[leftChild].priority < this.heap[minIndex].priority) {
                minIndex = leftChild;
            }
            
            if (rightChild < this.heap.length && 
                this.heap[rightChild].priority < this.heap[minIndex].priority) {
                minIndex = rightChild;
            }
            
            if (minIndex === index) break;
            
            [this.heap[index], this.heap[minIndex]] = 
                [this.heap[minIndex], this.heap[index]];
            
            index = minIndex;
        }
    }

    /**
     * Check if queue is empty
     * @returns {boolean} True if empty
     */
    isEmpty() {
        return this.heap.length === 0;
    }

    /**
     * Get size of queue
     * @returns {number} Number of elements
     */
    size() {
        return this.heap.length;
    }
}

/**
 * Dijkstra's Algorithm - Find shortest path between two vertices
 * @param {Graph} graph - Graph object
 * @param {string} start - Starting vertex
 * @param {string} end - Ending vertex
 * @returns {Object} Object containing distance, path, and visited nodes
 */
function dijkstra(graph, start, end) {
    // Initialize data structures
    const distances = new Map();
    const previous = new Map();
    const visited = new Set();
    const pq = new PriorityQueue();

    // Initialize all distances to infinity
    for (let vertex of graph.getAllVertices()) {
        distances.set(vertex, Infinity);
        previous.set(vertex, null);
    }

    // Distance to start vertex is 0
    distances.set(start, 0);
    pq.enqueue(start, 0);

    // Track visited nodes for visualization
    const visitedOrder = [];

    // Main algorithm loop
    while (!pq.isEmpty()) {
        const { vertex: current } = pq.dequeue();

        // Skip if already visited
        if (visited.has(current)) continue;

        // Mark as visited
        visited.add(current);
        visitedOrder.push(current);

        // If we reached the destination, we can stop
        if (current === end) break;

        // Check all neighbors
        const neighbors = graph.getNeighbors(current);
        
        for (let neighbor of neighbors) {
            const { to, weight } = neighbor;

            // Skip if already visited
            if (visited.has(to)) continue;

            // Calculate new distance
            const newDistance = distances.get(current) + weight;

            // If new distance is shorter, update
            if (newDistance < distances.get(to)) {
                distances.set(to, newDistance);
                previous.set(to, current);
                pq.enqueue(to, newDistance);
            }
        }
    }

    // Reconstruct path
    const path = [];
    let current = end;

    while (current !== null) {
        path.unshift(current);
        current = previous.get(current);
    }

    // Check if path exists
    if (path[0] !== start) {
        return {
            distance: Infinity,
            path: [],
            visited: visitedOrder,
            found: false
        };
    }

    return {
        distance: distances.get(end),
        path: path,
        visited: visitedOrder,
        found: true
    };
}

/**
 * Get all shortest paths from a source vertex
 * Useful for analyzing the entire network
 * @param {Graph} graph - Graph object
 * @param {string} start - Starting vertex
 * @returns {Object} Object with distances and paths to all vertices
 */
function dijkstraAllPaths(graph, start) {
    const distances = new Map();
    const previous = new Map();
    const visited = new Set();
    const pq = new PriorityQueue();

    // Initialize
    for (let vertex of graph.getAllVertices()) {
        distances.set(vertex, Infinity);
        previous.set(vertex, null);
    }

    distances.set(start, 0);
    pq.enqueue(start, 0);

    // Main loop
    while (!pq.isEmpty()) {
        const { vertex: current } = pq.dequeue();

        if (visited.has(current)) continue;
        visited.add(current);

        const neighbors = graph.getNeighbors(current);
        
        for (let neighbor of neighbors) {
            const { to, weight } = neighbor;
            
            if (visited.has(to)) continue;

            const newDistance = distances.get(current) + weight;

            if (newDistance < distances.get(to)) {
                distances.set(to, newDistance);
                previous.set(to, current);
                pq.enqueue(to, newDistance);
            }
        }
    }

    // Build paths object
    const paths = new Map();
    
    for (let vertex of graph.getAllVertices()) {
        if (vertex === start) {
            paths.set(vertex, [start]);
            continue;
        }

        const path = [];
        let current = vertex;

        while (current !== null) {
            path.unshift(current);
            current = previous.get(current);
        }

        if (path[0] === start) {
            paths.set(vertex, path);
        } else {
            paths.set(vertex, []);
        }
    }

    return {
        distances,
        paths
    };
}

/**
 * Calculate estimated time based on distance
 * Assumes average speed of 40 km/h in city traffic
 * @param {number} distance - Distance in km
 * @returns {number} Time in minutes
 */
function calculateEstimatedTime(distance) {
    const averageSpeed = 40; // km/h
    const timeInHours = distance / averageSpeed;
    return Math.round(timeInHours * 60); // Convert to minutes
}
