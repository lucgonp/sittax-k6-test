@echo off
echo Running k6 Stress Test...
k6 run tests/stress-test.js --out json=reports/stress-test-result.json
echo Stress test completed. Check reports/stress-test-result.json for results.