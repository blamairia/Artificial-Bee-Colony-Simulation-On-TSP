# Artificial Bee Colony Algorithm for the Traveling Salesman Problem (TSP)

This project demonstrates the **Artificial Bee Colony (ABC)** algorithm to solve the **Traveling Salesman Problem (TSP)**. It uses [Algorithm Visualizer](https://algorithm-visualizer.org/) to provide an interactive visualization of the algorithm in action.

## Overview

The Artificial Bee Colony algorithm simulates the foraging behavior of honey bees to find optimal solutions for complex optimization problems. Here, it is applied to the TSP, where the goal is to find the shortest possible route that visits each city exactly once and returns to the starting city.

---

## Direct Link to Visualization

Click the link below to directly open the visualization on Algorithm Visualizer:

**[Artificial Bee Colony Algorithm Visualization](https://algorithm-visualizer.org/scratch-paper/1b11ef207c1d7d1448da7ce04ffc47cc)**

---

## How to Use

1. **Open the Link**: Click on the direct link above.
2. **Run the Visualization**: Click the "Run" button in the Algorithm Visualizer interface.
3. **Observe the Process**:
   - Watch the bees (paths) mutate over iterations.
   - Observe the metrics like global best distance, average distance, and the number of unique paths.
   - See how paths before and after mutation are highlighted, showing changes clearly.

---



## Parameters

You can modify the parameters in the code directly on Algorithm Visualizer to experiment with the behavior of the algorithm. Here are the parameters and their roles:

```javascript
const nodes = [
  [0, 15, 23], // Node ID, X-coordinate, Y-coordinate
  [1, 34, 55],
  [2, 78, 23],
  [3, 45, 12],
  [4, 89, 90],
];
const totalIterations = 10;    // Number of iterations to run the algorithm
const NUM_FORAGERS = 2;        // Number of Forager bees
const NUM_ONLOOKERS = 4;       // Number of Onlooker bees
const NUM_SCOUTS = 4;          // Number of Scout bees
const NUM_BEES = NUM_FORAGERS + NUM_ONLOOKERS + NUM_SCOUTS;
const SCALE_FACTOR = 12;       // Scale factor for positioning nodes visually
```



## Explanation of Parameters

- **Nodes**: Defines the cities for the TSP with their coordinates. Each node is represented as `[ID, X, Y]`.
- **totalIterations**: Controls the number of iterations the algorithm will run.
- **NUM_FORAGERS, NUM_ONLOOKERS, NUM_SCOUTS**: Specify the number of bees for each role:
  - **Foragers**: Refine their own paths.
  - **Onlookers**: Select paths probabilistically based on fitness.
  - **Scouts**: Generate new random paths to explore.
- **SCALE_FACTOR**: Adjusts the spacing of nodes in the visualization for clarity.

---

## Algorithm Explanation

### Bee Roles

- **Forager Bees**:
  - Focus on refining their own solutions (paths).
  - Mutate their paths slightly (swap two cities).
  - Adopt the new path if it improves the solution.

- **Onlooker Bees**:
  - Probabilistically select paths from foragers based on their fitness (shorter distances are better).
  - Refine the selected paths.
  - Adopt the improved path if beneficial.

- **Scout Bees**:
  - Explore completely new paths randomly.
  - Prevent the algorithm from stagnating by introducing diversity.

---

### Algorithm Workflow

1. **Initialization**:
   - Nodes and edges are set up to define the TSP problem.
   - Bees are initialized with random paths.

2. **Waggle Dance Iterations**:
   - **Forager Phase**: Each forager bee mutates its path and evaluates the new solution.
   - **Onlooker Phase**: Onlookers probabilistically select paths to refine and improve.
   - **Scout Phase**: Scouts generate new random paths.

3. **Path Visualization**:
   - Paths before and after mutation are displayed.
   - Changes in paths are highlighted for clarity.
   - Metrics like global best distance and average distance are updated.

4. **Final Results**:
   - The shortest path found is highlighted on the graph.
   - Metrics like total unique paths explored and the best path distance are displayed.

---

## Metrics Displayed

- **Global Best Distance**: The shortest path distance found across all iterations.
- **Average Distance**: The average path distance across all bees in each iteration.
- **Unique Paths**: The number of unique paths explored by the hive.

---

## Customization

### Steps to Customize Parameters

1. Open the visualization link.
2. Edit the parameter values at the top of the code. For example:
   - Add or remove nodes in the `nodes` array.
   - Increase or decrease `NUM_FORAGERS`, `NUM_ONLOOKERS`, or `NUM_SCOUTS`.
   - Adjust `totalIterations` to change the duration of the algorithm.
3. Run the visualization again to see how the changes affect the results.

---

## Highlights of the Visualization

### Interactive Visualization:
- Watch paths mutate over iterations.
- Highlight differences between paths before and after mutation.

### Real-Time Metrics:
- Observe the improvement in global best distance.
- Monitor how average distance and unique paths change over iterations.

### Educational Insights:
- Understand how the roles of foragers, onlookers, and scouts contribute to finding the optimal path.

---

## License

This project is open-source. Feel free to modify and share it to explore the Artificial Bee Colony algorithm and its applications to optimization problems.

