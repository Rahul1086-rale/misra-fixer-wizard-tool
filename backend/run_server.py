# run_server.py - Script to run the Flask server
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def run_server():
    """Run the Flask server"""
    print("Starting MISRA Fix Copilot Backend Server...")
    print("Server will be available at: http://localhost:5000")
    print("API endpoints:")
    print("  - POST /api/upload/cpp-file")
    print("  - POST /api/upload/misra-report") 
    print("  - POST /api/process/add-line-numbers")
    print("  - POST /api/gemini/first-prompt")
    print("  - POST /api/gemini/fix-violations")
    print("  - POST /api/process/apply-fixes")
    print("  - GET /api/download/fixed-file")
    print("  - POST /api/chat")
    print("\nPress Ctrl+C to stop the server")
    
    # Run the Flask app
    from app import app
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == "__main__":
    # Check if we should install requirements
    if len(sys.argv) > 1 and sys.argv[1] == "--install":
        install_requirements()
    
    # Create uploads directory if it doesn't exist
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    
    # Run the server
    run_server()