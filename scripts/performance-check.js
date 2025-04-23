#!/usr/bin/env node

/**
 * Performance monitoring script for RadioX
 * This script checks the performance of the API endpoints
 */

const axios = require('axios');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: process.env.API_URL || 'http://localhost:4000',
  endpoints: [
    { method: 'GET', path: '/health', name: 'Health Check' },
    { method: 'GET', path: '/api/search?q=test', name: 'Search' },
    { method: 'GET', path: '/api/audio/clips', name: 'Audio Clips' },
    { method: 'GET', path: '/api/podcast', name: 'Podcasts' },
    { method: 'GET', path: '/api/trending', name: 'Trending' }
  ],
  iterations: 5,
  outputDir: path.join(__dirname, '../performance-reports'),
  thresholds: {
    average: 500, // ms
    p95: 1000 // ms
  }
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Format date for filename
const formatDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
};

// Calculate statistics
const calculateStats = (times) => {
  const sorted = [...times].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, time) => acc + time, 0);
  const average = sum / sorted.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const p95Index = Math.ceil(sorted.length * 0.95) - 1;
  const p95 = sorted[p95Index];
  
  return {
    average,
    min,
    max,
    p95,
    median: sorted[Math.floor(sorted.length / 2)]
  };
};

// Test an endpoint
const testEndpoint = async (endpoint) => {
  console.log(`Testing ${endpoint.name} (${endpoint.method} ${endpoint.path})...`);
  
  const times = [];
  const errors = [];
  
  for (let i = 0; i < config.iterations; i++) {
    try {
      const start = performance.now();
      
      await axios({
        method: endpoint.method.toLowerCase(),
        url: `${config.baseUrl}${endpoint.path}`,
        timeout: 10000
      });
      
      const end = performance.now();
      const time = end - start;
      times.push(time);
      
      console.log(`  Iteration ${i + 1}: ${time.toFixed(2)} ms`);
    } catch (error) {
      console.error(`  Iteration ${i + 1}: Error - ${error.message}`);
      errors.push(error.message);
    }
  }
  
  if (times.length === 0) {
    return {
      name: endpoint.name,
      path: endpoint.path,
      method: endpoint.method,
      success: false,
      errors
    };
  }
  
  const stats = calculateStats(times);
  
  // Check against thresholds
  const exceedsAverage = stats.average > config.thresholds.average;
  const exceedsP95 = stats.p95 > config.thresholds.p95;
  
  console.log(`  Average: ${stats.average.toFixed(2)} ms ${exceedsAverage ? '(EXCEEDS THRESHOLD)' : ''}`);
  console.log(`  P95: ${stats.p95.toFixed(2)} ms ${exceedsP95 ? '(EXCEEDS THRESHOLD)' : ''}`);
  console.log(`  Min: ${stats.min.toFixed(2)} ms`);
  console.log(`  Max: ${stats.max.toFixed(2)} ms`);
  console.log(`  Median: ${stats.median.toFixed(2)} ms`);
  console.log(`  Errors: ${errors.length}`);
  
  return {
    name: endpoint.name,
    path: endpoint.path,
    method: endpoint.method,
    success: true,
    stats: {
      average: stats.average,
      min: stats.min,
      max: stats.max,
      p95: stats.p95,
      median: stats.median
    },
    exceedsThresholds: {
      average: exceedsAverage,
      p95: exceedsP95
    },
    errors
  };
};

// Main function
const main = async () => {
  console.log('Starting performance tests...');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Iterations per endpoint: ${config.iterations}`);
  console.log('-----------------------------------');
  
  const results = [];
  
  for (const endpoint of config.endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log('-----------------------------------');
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: config.baseUrl,
    iterations: config.iterations,
    thresholds: config.thresholds,
    results
  };
  
  // Save report to file
  const filename = `performance_${formatDate()}.json`;
  const filePath = path.join(config.outputDir, filename);
  
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  
  console.log(`Performance test completed. Report saved to ${filePath}`);
  
  // Check for threshold violations
  const violations = results.filter(r => 
    r.success && (r.exceedsThresholds.average || r.exceedsThresholds.p95)
  );
  
  if (violations.length > 0) {
    console.log('\nWARNING: The following endpoints exceed performance thresholds:');
    violations.forEach(v => {
      console.log(`- ${v.name} (${v.method} ${v.path})`);
      if (v.exceedsThresholds.average) {
        console.log(`  Average: ${v.stats.average.toFixed(2)} ms (threshold: ${config.thresholds.average} ms)`);
      }
      if (v.exceedsThresholds.p95) {
        console.log(`  P95: ${v.stats.p95.toFixed(2)} ms (threshold: ${config.thresholds.p95} ms)`);
      }
    });
    
    process.exit(1);
  }
};

main().catch(error => {
  console.error('Error running performance tests:', error);
  process.exit(1);
});
