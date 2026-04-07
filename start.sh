#!/bin/bash

# Ontology Management System - Java EE Architecture Startup Script
# 
# Architecture:
#   Frontend (React) -> BFF (Node.js) -> Java Backend (Spring Boot) -> MySQL
#
# Ports:
#   - Frontend Dev Server: 3000
#   - BFF Server: 3001
#   - Java Backend: 8080
#   - MySQL: 3306

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Ontology Management System - Java EE Architecture       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}Error: Java is not installed${NC}"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
echo "  Java version: $JAVA_VERSION"

# Check Maven
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}Error: Maven is not installed${NC}"
    exit 1
fi
echo "  Maven: installed"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "  Node.js version: $NODE_VERSION"

# Check MySQL
if ! mysql -u root -p12345678 -e "SELECT 1;" >/dev/null 2>&1; then
    if ! mysql -u root -e "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${YELLOW}Warning: MySQL does not appear to be running on port 3306${NC}"
        echo "  Please start MySQL before continuing"
        exit 1
    fi
fi
echo "  MySQL: running on port 3306"

echo ""
echo "All prerequisites satisfied!"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "Shutting down services..."
    if [ -n "$JAVA_PID" ]; then
        kill $JAVA_PID 2>/dev/null
        echo "  Java backend stopped"
    fi
    if [ -n "$BFF_PID" ]; then
        kill $BFF_PID 2>/dev/null
        echo "  BFF stopped"
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "  Frontend stopped"
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Java Backend
echo "═══════════════════════════════════════════════════════════════"
echo "Starting Java Backend (Spring Boot)..."
echo "═══════════════════════════════════════════════════════════════"
cd backend

# Check if jar exists, if not build it
if [ ! -f "target/ontology-backend-1.0.0.jar" ]; then
    echo "Building Java backend..."
    mvn clean package -DskipTests
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to build Java backend${NC}"
        exit 1
    fi
fi

# Run Java backend with custom tmpdir
java -Djava.io.tmpdir=/tmp -jar target/ontology-backend-1.0.0.jar &
JAVA_PID=$!
cd ..

echo "  Java backend starting on port 8080 (PID: $JAVA_PID)"
echo "  Waiting for Java backend to be ready..."

# Wait for Java backend to be ready
for i in {1..60}; do
    if curl -s http://localhost:8080/api/ontology >/dev/null 2>&1; then
        echo -e "  ${GREEN}Java backend is ready!${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 60 ]; then
        echo -e "${RED}Error: Java backend failed to start within 60 seconds${NC}"
        cleanup
    fi
done

echo ""

# Start BFF
echo "═══════════════════════════════════════════════════════════════"
echo "Starting BFF (Node.js)..."
echo "═══════════════════════════════════════════════════════════════"
cd bff

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing BFF dependencies..."
    npm install
fi

# Run BFF
npm run dev &
BFF_PID=$!
cd ..

echo "  BFF starting on port 3001 (PID: $BFF_PID)"
echo "  Waiting for BFF to be ready..."

# Wait for BFF to be ready
for i in {1..30}; do
    if curl -s http://localhost:3001/api/ontology >/dev/null 2>&1; then
        echo -e "  ${GREEN}BFF is ready!${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}Warning: BFF may not be fully ready yet${NC}"
    fi
done

echo ""

# Start Frontend
echo "═══════════════════════════════════════════════════════════════"
echo "Starting Frontend (React + Vite)..."
echo "═══════════════════════════════════════════════════════════════"
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Run frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "  Frontend starting on port 3000 (PID: $FRONTEND_PID)"
echo "  Waiting for frontend to be ready..."

# Wait for frontend to be ready
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "  ${GREEN}Frontend is ready!${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}Warning: Frontend may not be fully ready yet${NC}"
    fi
done

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    All Services Started!                     ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Frontend:  http://localhost:3000                            ║"
echo "║  BFF:       http://localhost:3001                            ║"
echo "║  Java API:  http://localhost:8080                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait
