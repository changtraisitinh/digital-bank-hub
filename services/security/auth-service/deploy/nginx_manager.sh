#!/bin/bash

# Nginx Manager Script for macOS (Apple Silicon, Homebrew)
# Checks, reloads, stops, and starts Nginx, with error handling and logging

NGINX_CONF="/opt/homebrew/etc/nginx/nginx.conf"
PID_DIR="/opt/homebrew/var/run"
PID_FILE="$PID_DIR/nginx.pid"
ERROR_LOG="/opt/homebrew/var/log/nginx/error.log"
NGINX_BIN="/opt/homebrew/bin/nginx"

# Function to check if Nginx is running
check_nginx() {
    echo "Checking Nginx status..."
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "Nginx is running (PID: $pid)"
            return 0
        else
            echo "Nginx PID file exists but process is not running."
            return 1
        fi
    else
        echo "Nginx is not running (no PID file found)."
        return 1
    fi
}

# Function to test Nginx configuration
test_config() {
    echo "Testing Nginx configuration..."
    if ! sudo "$NGINX_BIN" -t -c "$NGINX_CONF"; then
        echo "Configuration test failed. Check $ERROR_LOG for details."
        exit 1
    fi
    echo "Configuration test passed."
}

# Function to ensure PID directory exists and has correct permissions
setup_pid_dir() {
    if [ ! -d "$PID_DIR" ]; then
        echo "Creating PID directory: $PID_DIR"
        sudo mkdir -p "$PID_DIR"
    fi
    echo "Setting permissions for $PID_DIR"
    sudo chown "$(whoami):staff" "$PID_DIR"
    sudo chmod 755 "$PID_DIR"
}

# Function to stop Nginx
stop_nginx() {
    echo "Stopping Nginx..."
    if [ -f "$PID_FILE" ]; then
        if sudo "$NGINX_BIN" -s stop; then
            echo "Nginx stopped successfully."
        else
            echo "Failed to stop Nginx. Check $ERROR_LOG."
            exit 1
        fi
    else
        echo "No PID file found. Nginx may not be running."
    fi
}

# Function to start Nginx
start_nginx() {
    echo "Starting Nginx..."
    setup_pid_dir
    if sudo "$NGINX_BIN" -c "$NGINX_CONF"; then
        echo "Nginx started successfully."
    else
        echo "Failed to start Nginx. Check $ERROR_LOG."
        exit 1
    fi
}

# Function to reload Nginx
reload_nginx() {
    echo "Reloading Nginx..."
    test_config
    if [ -f "$PID_FILE" ]; then
        if sudo "$NGINX_BIN" -s reload; then
            echo "Nginx reloaded successfully."
        else
            echo "Failed to reload Nginx. Check $ERROR_LOG."
            exit 1
        fi
    else
        echo "No PID file found. Starting Nginx instead..."
        start_nginx
    fi
}

# Main script logic
case "$1" in
    check)
        check_nginx
        ;;
    stop)
        stop_nginx
        ;;
    start)
        test_config
        start_nginx
        ;;
    reload)
        reload_nginx
        ;;
    *)
        echo "Usage: $0 {check|stop|start|reload}"
        echo "  check  - Check if Nginx is running"
        echo "  stop   - Stop Nginx"
        echo "  start  - Start Nginx"
        echo "  reload - Reload Nginx configuration"
        exit 1
        ;;
esac