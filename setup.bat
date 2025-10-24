@echo off
echo Setting up PR Management API Environment...
cd /d "d:\Demo\Vendor Portal APP - new build"

echo Installing server dependencies...
cd server
if exist package.json (
    npm install
) else (
    echo package.json not found in server directory
)

echo.
echo Setup complete!
echo.
echo To start the server:
echo 1. Run start-server.bat
echo.
echo To test the API:
echo 1. Start the server first
echo 2. Run run-tests.bat in a new terminal
echo.
echo API Documentation: server/README.md
echo Test Script: server/test-api.js
pause
