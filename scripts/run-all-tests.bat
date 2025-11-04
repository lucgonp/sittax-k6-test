@echo off
echo Running all k6 tests...

echo.
echo [1/4] Running Load Test...
k6 run tests/load-test.js --out json=reports/load-test-result.json

echo.
echo [2/4] Running Stress Test...
k6 run tests/stress-test.js --out json=reports/stress-test-result.json

echo.
echo [3/4] Running API Test...
k6 run tests/api-test.js --out json=reports/api-test-result.json

echo.
echo [4/4] Running Spike Test...
k6 run tests/spike-test.js --out json=reports/spike-test-result.json

echo.
echo All tests completed! Check the reports folder for detailed results.