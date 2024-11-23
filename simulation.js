// Parameters (You can adjust these)
const nodes = [
  [0, 15, 23],
  [1, 34, 55],
  [2, 78, 23],
  [3, 45, 12],
  [4, 89, 90],
];
const totalIterations = 10;
const NUM_FORAGERS = 2;
const NUM_ONLOOKERS = 4;
const NUM_SCOUTS = 4;
const NUM_BEES = NUM_FORAGERS + NUM_ONLOOKERS + NUM_SCOUTS;
const SCALE_FACTOR = 12; // Scale factor to increase node spacing

// Required libraries from Algorithm Visualizer
const {
  Array1DTracer,
  Array2DTracer,
  ChartTracer,
  LogTracer,
  GraphTracer,
  Layout,
  VerticalLayout,
  Tracer,
} = require('algorithm-visualizer');

// Initialize tracers
const hiveTracer = new Array2DTracer('Hive (Bee Paths)');
const beeMetricsTracer = new Array2DTracer('Bee Metrics (Type, Path, Distance, Status)');
const beePathBeforeTracer = new Array1DTracer('Bee Path (Before)');
const beePathAfterTracer = new Array1DTracer('Bee Path (After)');
const distanceTracer = new ChartTracer('Distances');
const graphTracer = new GraphTracer('Hive Graph');
const logTracer = new LogTracer('Logs');
const metricsTracer = new Array2DTracer('Metrics Table');

Layout.setRoot(
  new VerticalLayout([
    hiveTracer,
    beeMetricsTracer,
    beePathBeforeTracer,
    beePathAfterTracer,
    distanceTracer,
    graphTracer,
    logTracer,
    metricsTracer,
  ])
);

// Store node positions and edge weights
const nodePositions = nodes.map((node, index) => ({
  id: index,
  x: node[1] * SCALE_FACTOR,
  y: node[2] * SCALE_FACTOR,
}));
const edgeWeights = {};

// Helper functions
function calculateDistance(node1, node2) {
  return Math.sqrt(
    Math.pow(node2[1] - node1[1], 2) + Math.pow(node2[2] - node1[2], 2)
  );
}

function calculateTotalPathDistance(path, distanceTable) {
  const distances = [];
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const segmentDistance = distanceTable[path[i]][path[i + 1]];
    distances.push(segmentDistance.toFixed(2));
    totalDistance += segmentDistance;
  }
  const returnDistance = distanceTable[path[path.length - 1]][path[0]];
  distances.push(returnDistance.toFixed(2));
  totalDistance += returnDistance;
  return { totalDistance: parseFloat(totalDistance.toFixed(2)), distances };
}

function mutatePath(path) {
  const newPath = [...path];
  const idx1 = Math.floor(Math.random() * path.length);
  const idx2 = Math.floor(Math.random() * path.length);
  [newPath[idx1], newPath[idx2]] = [newPath[idx2], newPath[idx1]];
  return { newPath, swappedIndices: [idx1, idx2] };
}

function findDifferences(path1, path2) {
  const diffIndices = [];
  for (let i = 0; i < path1.length; i++) {
    if (path1[i] !== path2[i]) {
      diffIndices.push(i);
    }
  }
  return diffIndices;
}

function countUniquePaths(hive) {
  const uniquePaths = new Set(hive.map((path) => path.join('-')));
  return uniquePaths.size;
}

// Initialize distance table
const distanceTable = nodes.map((node1) =>
  nodes.map((node2) =>
    Math.sqrt(Math.pow(node2[1] - node1[1], 2) + Math.pow(node2[2] - node1[2], 2))
  )
);

// Initialize roles
const roles = [];
for (let i = 0; i < NUM_FORAGERS; i++) roles.push('Forager');
for (let i = 0; i < NUM_ONLOOKERS; i++) roles.push('Onlooker');
for (let i = 0; i < NUM_SCOUTS; i++) roles.push('Scout');

// Step 1: Initialize hive
graphTracer.weighted(true);
nodePositions.forEach(({ id, x, y }) => {
  graphTracer.addNode(id, null, x, y);
});

nodes.forEach((node1, i) => {
  nodes.forEach((node2, j) => {
    if (i !== j) {
      const weight = calculateDistance(node1, node2).toFixed(2);
      edgeWeights[`${i}-${j}`] = weight; // Save edge weight
      graphTracer.addEdge(i, j, weight);
    }
  });
});

Tracer.delay();

// Initialize hive and distances
const hive = [];
const distances = [];
for (let i = 0; i < NUM_BEES; i++) {
  const path = Array.from({ length: nodes.length }, (_, index) => index).sort(
    () => Math.random() - 0.5
  );
  const { totalDistance } = calculateTotalPathDistance(path, distanceTable);
  hive.push(path);
  distances.push(totalDistance); // Record initial distances
}

// Calculate initial metrics
const initialAverageDistance = (
  distances.reduce((sum, dist) => sum + dist, 0) / distances.length
).toFixed(2);
const initialUniquePaths = countUniquePaths(hive);

// Initialize metrics table with columns for each iteration
const metricsTable = [
  ['Metric', 'Before', ...Array.from({ length: totalIterations }, (_, i) => `Iteration ${i + 1}`), 'After'],
  ['Global Best Distance', 'N/A'],
  ['Average Distance', initialAverageDistance],
  ['Unique Paths', initialUniquePaths.toString()],
];

function rouletteWheelSelection(probabilities) {
  const total = probabilities.reduce((sum, p) => sum + p, 0);
  const normalized = probabilities.map((p) => p / total);
  const rand = Math.random();
  let cumulative = 0;

  for (let i = 0; i < normalized.length; i++) {
    cumulative += normalized[i];
    if (rand < cumulative) return i;
  }

  return probabilities.length - 1; // Fallback
}

// Visualize initial hive
hiveTracer.set(
  hive.map((path, i) => `Bee ${i + 1} (${roles[i]}): ${path.join(' -> ')}`)
);
distanceTracer.set(distances);
metricsTracer.set(metricsTable);
Tracer.delay();

// Step 2: Waggle Dance
let globalBestPath = null;
let globalBestDistance = Infinity;

for (let iteration = 0; iteration < totalIterations; iteration++) {
  logTracer.print(`\nIteration ${iteration + 1}: Waggle Dance`);
  const beeMetrics = [];
  let iterationStats = {
    totalImproved: 0,
    statusCounts: {},
  };

  for (let beeIndex = 0; beeIndex < hive.length; beeIndex++) {
    const {
      totalDistance: beforeDistance,
      distances: beforeSegments,
    } = calculateTotalPathDistance(hive[beeIndex], distanceTable);

    // Visualize: Bee path before mutation
    beePathBeforeTracer.set(hive[beeIndex]);
    Tracer.delay();

    // Visualization: Bee traversing the graph
    for (let i = 0; i < hive[beeIndex].length - 1; i++) {
      graphTracer.visit(hive[beeIndex][i], hive[beeIndex][i + 1]);
      Tracer.delay();
      graphTracer.leave(hive[beeIndex][i], hive[beeIndex][i + 1]);
    }

    let newPath;
    let status;
    let swappedIndices = [];

    // Role-specific behavior
    if (roles[beeIndex] === 'Forager') {
      // Foragers exploit known good paths
      const mutationResult = mutatePath(hive[beeIndex]); // Small mutations around the current path
      newPath = mutationResult.newPath;
      swappedIndices = mutationResult.swappedIndices;
      status = 'Foraging';
    } else if (roles[beeIndex] === 'Onlooker') {
      // Onlookers follow probabilistically chosen paths
      const selectedBeeIndex = rouletteWheelSelection(
        distances.map((d) => 1 / d)
      ); // Favor shorter distances
      const mutationResult = mutatePath(hive[selectedBeeIndex]); // Refine the selected bee's path
      newPath = mutationResult.newPath;
      swappedIndices = mutationResult.swappedIndices;
      status = `Following Bee ${selectedBeeIndex + 1}`;
    } else if (roles[beeIndex] === 'Scout') {
      // Scouts explore entirely new random paths
      newPath = Array.from({ length: nodes.length }, (_, index) => index).sort(
        () => Math.random() - 0.5
      );
      swappedIndices = []; // For scouts, consider all indices as changed
      status = 'Exploring';
    }

    const {
      totalDistance: afterDistance,
      distances: afterSegments,
    } = calculateTotalPathDistance(newPath, distanceTable);

    // Visualize: Bee path after mutation
    beePathAfterTracer.set(newPath);
    Tracer.delay();

    // Highlight differences between paths
    const diffIndices = findDifferences(hive[beeIndex], newPath);
    diffIndices.forEach((index) => {
      beePathBeforeTracer.select(index);
      beePathAfterTracer.select(index);
    });
    Tracer.delay();
    diffIndices.forEach((index) => {
      beePathBeforeTracer.deselect(index);
      beePathAfterTracer.deselect(index);
    });

    if (afterDistance < beforeDistance) {
      hive[beeIndex] = newPath;
      distances[beeIndex] = afterDistance;
      status += ' (Improved)';
      iterationStats.totalImproved += 1;
    } else {
      status += ' (Rejected)';
    }

    iterationStats.statusCounts[status] =
      (iterationStats.statusCounts[status] || 0) + 1;

    if (afterDistance < globalBestDistance) {
      globalBestPath = newPath;
      globalBestDistance = afterDistance;
      logTracer.print(
        `Global Best Path Updated by Bee ${beeIndex + 1}: ${globalBestPath.join(
          ' -> '
        )} with distance ${globalBestDistance}`
      );
    }

    beeMetrics.push([
      `Bee ${beeIndex + 1} (${roles[beeIndex]})`,
      hive[beeIndex].join(' -> '),
      distances[beeIndex].toFixed(2),
      status,
    ]);
  }

  hiveTracer.set(
    hive.map((path, i) => `Bee ${i + 1} (${roles[i]}): ${path.join(' -> ')}`)
  );
  beeMetricsTracer.set(beeMetrics);
  distanceTracer.set(distances);

  // Update metrics table for this iteration
  const currentAverageDistance = (
    distances.reduce((sum, dist) => sum + dist, 0) / distances.length
  ).toFixed(2);
  const uniquePathsCount = countUniquePaths(hive);
  metricsTable[1].push(globalBestDistance.toFixed(2)); // Global Best Distance
  metricsTable[2].push(currentAverageDistance); // Average Distance
  metricsTable[3].push(uniquePathsCount.toString()); // Unique Paths
  metricsTracer.set(metricsTable);

  // Log iteration statistics
  logTracer.print(`Iteration ${iteration + 1} Summary:`);
  logTracer.print(`Total bees improved their path: ${iterationStats.totalImproved}`);
  for (const [status, count] of Object.entries(iterationStats.statusCounts)) {
    logTracer.print(`${status}: ${count} bees`);
  }

  Tracer.delay();
}

// Calculate final metrics
const finalAverageDistance = (
  distances.reduce((sum, dist) => sum + dist, 0) / distances.length
).toFixed(2);
const finalUniquePaths = countUniquePaths(hive);
metricsTable[1].push(globalBestDistance.toFixed(2)); // Final Global Best Distance
metricsTable[2].push(finalAverageDistance); // Final Average Distance
metricsTable[3].push(finalUniquePaths.toString()); // Final Unique Paths
metricsTracer.set(metricsTable);

// Highlight the final global best path
globalBestPath.forEach((node, i) => {
  if (i < globalBestPath.length - 1) {
    graphTracer.updateEdge(node, globalBestPath[i + 1], null, 2); // Highlight the global best path
  }
});
graphTracer.updateEdge(globalBestPath[globalBestPath.length - 1], globalBestPath[0], null, 2);
Tracer.delay();
