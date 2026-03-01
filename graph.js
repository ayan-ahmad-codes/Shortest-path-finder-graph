// Graph.js - Graph data structure implementation for city road network

class Graph {
    constructor() {
        this.vertices = new Map(); // Map of vertex name to vertex object
        this.edges = new Map();    // Map of vertex name to array of edges
    }

    /**
     * Add a vertex (location) to the graph
     * @param {string} name - Name of the location
     * @param {number} x - X coordinate for visualization
     * @param {number} y - Y coordinate for visualization
     */
    addVertex(name, x, y) {
        if (!this.vertices.has(name)) {
            this.vertices.set(name, { name, x, y });
            this.edges.set(name, []);
        }
    }

    /**
     * Add an edge (road) between two vertices
     * @param {string} from - Starting vertex
     * @param {string} to - Ending vertex
     * @param {number} distance - Distance in km
     * @param {boolean} bidirectional - Whether the road is two-way
     */
    addEdge(from, to, distance, bidirectional = true) {
        if (!this.vertices.has(from) || !this.vertices.has(to)) {
            console.error(`Vertex ${from} or ${to} does not exist`);
            return;
        }

        // Add edge from -> to
        this.edges.get(from).push({
            to,
            weight: distance
        });

        // If bidirectional, add edge to -> from
        if (bidirectional) {
            this.edges.get(to).push({
                to: from,
                weight: distance
            });
        }
    }

    /**
     * Get all neighbors of a vertex
     * @param {string} vertex - Vertex name
     * @returns {Array} Array of edges
     */
    getNeighbors(vertex) {
        return this.edges.get(vertex) || [];
    }

    /**
     * Get vertex data
     * @param {string} name - Vertex name
     * @returns {Object} Vertex object
     */
    getVertex(name) {
        return this.vertices.get(name);
    }

    /**
     * Get all vertices
     * @returns {Array} Array of vertex names
     */
    getAllVertices() {
        return Array.from(this.vertices.keys());
    }

    /**
     * Get the number of vertices
     * @returns {number} Number of vertices
     */
    size() {
        return this.vertices.size;
    }

    /**
     * Check if vertex exists
     * @param {string} name - Vertex name
     * @returns {boolean} True if vertex exists
     */
    hasVertex(name) {
        return this.vertices.has(name);
    }

    /**
     * Get all edges
     * @returns {Map} Map of all edges
     */
    getAllEdges() {
        return this.edges;
    }

    /**
     * Print graph structure (for debugging)
     */
    printGraph() {
        console.log("Graph Structure:");
        for (let [vertex, edges] of this.edges) {
            const edgeStr = edges.map(e => `${e.to}(${e.weight}km)`).join(', ');
            console.log(`${vertex} -> [${edgeStr}]`);
        }
    }
}

// Create and populate the city graph with sample locations
function createCityGraph() {
    const graph = new Graph();

    // Add vertices (locations) with coordinates for visualization
    // Format: addVertex(name, x, y)
    graph.addVertex("Airport", 50, 100);
    graph.addVertex("Downtown", 200, 150);
    graph.addVertex("Mall", 350, 100);
    graph.addVertex("Hospital", 150, 250);
    graph.addVertex("University", 300, 250);
    graph.addVertex("Train Station", 450, 200);
    graph.addVertex("Beach", 500, 350);
    graph.addVertex("Stadium", 100, 400);
    graph.addVertex("Park", 250, 400);
    graph.addVertex("Museum", 400, 450);
    graph.addVertex("Shopping District", 200, 500);
    graph.addVertex("Tech Park", 450, 500);

    // Add edges (roads) with distances in km
    // Format: addEdge(from, to, distance, bidirectional)
    
    // Airport connections
    graph.addEdge("Airport", "Downtown", 8.5);
    graph.addEdge("Airport", "Hospital", 12.0);
    
    // Downtown connections
    graph.addEdge("Downtown", "Mall", 6.3);
    graph.addEdge("Downtown", "Hospital", 5.5);
    graph.addEdge("Downtown", "Stadium", 9.8);
    
    // Mall connections
    graph.addEdge("Mall", "University", 7.2);
    graph.addEdge("Mall", "Train Station", 8.0);
    
    // Hospital connections
    graph.addEdge("Hospital", "University", 6.8);
    graph.addEdge("Hospital", "Stadium", 10.5);
    graph.addEdge("Hospital", "Park", 8.5);
    
    // University connections
    graph.addEdge("University", "Park", 7.0);
    graph.addEdge("University", "Train Station", 9.5);
    graph.addEdge("University", "Beach", 11.0);
    
    // Train Station connections
    graph.addEdge("Train Station", "Beach", 7.5);
    graph.addEdge("Train Station", "Museum", 10.0);
    
    // Beach connections
    graph.addEdge("Beach", "Museum", 6.5);
    graph.addEdge("Beach", "Tech Park", 8.0);
    
    // Stadium connections
    graph.addEdge("Stadium", "Park", 7.8);
    graph.addEdge("Stadium", "Shopping District", 9.2);
    
    // Park connections
    graph.addEdge("Park", "Museum", 8.0);
    graph.addEdge("Park", "Shopping District", 6.5);
    
    // Museum connections
    graph.addEdge("Museum", "Shopping District", 10.5);
    graph.addEdge("Museum", "Tech Park", 5.5);
    
    // Shopping District connections
    graph.addEdge("Shopping District", "Tech Park", 12.0);

    return graph;
}
