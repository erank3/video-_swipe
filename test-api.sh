#!/bin/bash

# Test API endpoints
echo "Testing Video Library API..."
echo

# Test series endpoint
echo "1. Testing GET /api/series"
curl -s http://localhost:3600/api/series | jq '.[0] | {id, title, progress}'
echo

# Test stats endpoint  
echo "2. Testing GET /api/stats"
curl -s http://localhost:3600/api/stats | jq '{level, totalXP, totalEpisodesWatched}'
echo

# Test achievements endpoint
echo "3. Testing GET /api/achievements"
curl -s http://localhost:3600/api/achievements | jq '.[0:2] | .[] | {title, xpReward, isUnlocked}'
echo

echo "API tests complete!"
