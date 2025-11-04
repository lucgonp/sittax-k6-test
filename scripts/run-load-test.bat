@echo off
echo Running k6 Load Test...
k6 run tests/load-test.js --out json=reports/load-test-result.json
echo Load test completed. Check reports/load-test-result.json for results.