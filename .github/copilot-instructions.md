# k6 Performance Testing Project Instructions

This project is set up for performance testing with k6 desktop application, specifically configured for Sittax authentication API testing.

## Project Structure
- `tests/` - k6 test scripts including Sittax-specific tests
- `config/` - Configuration files with Sittax endpoints
- `data/` - Test data files including real Sittax user credentials
- `reports/` - Test result reports
- `scripts/` - Utility scripts for running tests

## Key Features
- Sittax authentication performance testing
- Load testing scenarios with real user data
- Stress testing examples
- API testing templates
- Performance monitoring and reporting

## Sittax Specific
- Authentication endpoint: https://autenticacaohomologacao.sittax.com.br/api/auth/login
- 32 real test users loaded from CSV
- Proper payload format: {usuario: "email", senha: "password"}
- All headers configured to match browser requests

## Usage
Use k6 desktop app or CLI to run tests from the tests/ directory.
Recommended to start with sittax-login-simple.js for quick validation.