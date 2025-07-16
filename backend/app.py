# app.py - Flask Backend API Server
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import tempfile
import json
from werkzeug.utils import secure_filename

# Import our Python modules
from misra_chat_client import init_vertex_ai, load_cpp_file, start_chat, send_file_intro, send_misra_violations
from excel_utils import extract_violations_for_file
from numbering import add_line_numbers
from denumbering import remove_line_numbers
from replace import merge_fixed_snippets_into_file
from fixed_response_code_snippet import extract_snippets_from_response, save_snippets_to_json

app = Flask(__name__)
CORS(app)

# Global storage for sessions
sessions = {}
chat_sessions = {}

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'cpp', 'c', 'xlsx', 'xls'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize Vertex AI on startup
init_vertex_ai()

@app.route('/api/upload/cpp-file', methods=['POST'])
def upload_cpp_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        project_id = request.form.get('projectId')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, f"{project_id}_{filename}")
        file.save(file_path)
        
        # Initialize session
        sessions[project_id] = {
            'cpp_file': file_path,
            'original_filename': filename
        }
        
        return jsonify({
            'filePath': file_path,
            'fileName': filename
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload/misra-report', methods=['POST'])
def upload_misra_report():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        project_id = request.form.get('projectId')
        target_file = request.form.get('targetFile')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save Excel file
        filename = secure_filename(file.filename)
        excel_path = os.path.join(UPLOAD_FOLDER, f"{project_id}_report_{filename}")
        file.save(excel_path)
        
        # Extract violations
        violations = extract_violations_for_file(excel_path, target_file)
        
        # Store in session
        if project_id in sessions:
            sessions[project_id]['excel_file'] = excel_path
            sessions[project_id]['violations'] = violations
        
        return jsonify(violations)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/process/add-line-numbers', methods=['POST'])
def process_add_line_numbers():
    try:
        data = request.get_json()
        project_id = data.get('projectId')
        
        if project_id not in sessions:
            return jsonify({'error': 'Project not found'}), 404
        
        session = sessions[project_id]
        input_file = session['cpp_file']
        
        # Create numbered file
        numbered_filename = f"numbered_{session['original_filename']}"
        numbered_path = os.path.join(UPLOAD_FOLDER, f"{project_id}_{numbered_filename}")
        
        add_line_numbers(input_file, numbered_path)
        
        # Update session
        sessions[project_id]['numbered_file'] = numbered_path
        
        return jsonify({
            'numberedFilePath': numbered_path
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gemini/first-prompt', methods=['POST'])
def gemini_first_prompt():
    try:
        data = request.get_json()
        project_id = data.get('projectId')
        
        if project_id not in sessions:
            return jsonify({'error': 'Project not found'}), 404
        
        session = sessions[project_id]
        numbered_file = session['numbered_file']
        
        # Load numbered file content
        numbered_content = load_cpp_file(numbered_file)
        
        # Start chat session
        chat = start_chat(model_name="gemini-2.5-flash")
        
        # Send first prompt
        response = send_file_intro(chat, numbered_content)
        
        # Store chat session
        chat_sessions[project_id] = chat
        
        return jsonify({
            'response': response
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gemini/fix-violations', methods=['POST'])
def gemini_fix_violations():
    try:
        data = request.get_json()
        project_id = data.get('projectId')
        violations = data.get('violations', [])
        
        if project_id not in chat_sessions:
            return jsonify({'error': 'Chat session not found'}), 404
        
        chat = chat_sessions[project_id]
        
        # Format violations for Gemini
        violations_text = []
        for v in violations:
            violations_text.append(
                f"File: {v['file']}\n"
                f"Path: {v['path']}\n"
                f"Line: {v['line']}\n"
                f"Rule: {v['misra']}\n"
                f"Message: {v['warning']}\n"
            )
        
        violations_str = "\n".join(violations_text)
        
        # Send to Gemini
        response = send_misra_violations(chat, violations_str)
        
        # Extract code snippets
        code_snippets = extract_snippets_from_response(response)
        
        # Save snippets to session
        if project_id in sessions:
            sessions[project_id]['fixed_snippets'] = code_snippets
            snippet_file = os.path.join(UPLOAD_FOLDER, f"{project_id}_snippets.json")
            save_snippets_to_json(code_snippets, snippet_file)
            sessions[project_id]['snippet_file'] = snippet_file
        
        return jsonify({
            'response': response,
            'codeSnippets': list(code_snippets.values())
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/process/apply-fixes', methods=['POST'])
def process_apply_fixes():
    try:
        data = request.get_json()
        project_id = data.get('projectId')
        
        if project_id not in sessions:
            return jsonify({'error': 'Project not found'}), 404
        
        session = sessions[project_id]
        numbered_file = session['numbered_file']
        fixed_snippets = session.get('fixed_snippets', {})
        
        # Apply fixes
        fixed_filename = f"fixed_{session['original_filename']}"
        fixed_numbered_path = os.path.join(UPLOAD_FOLDER, f"{project_id}_fixed_numbered_{session['original_filename']}")
        
        merge_fixed_snippets_into_file(numbered_file, fixed_snippets, fixed_numbered_path)
        
        # Remove line numbers for final file
        final_fixed_path = os.path.join(UPLOAD_FOLDER, f"{project_id}_{fixed_filename}")
        remove_line_numbers(fixed_numbered_path, final_fixed_path)
        
        # Update session
        sessions[project_id]['fixed_file'] = final_fixed_path
        
        return jsonify({
            'fixedFilePath': final_fixed_path
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/fixed-file', methods=['GET'])
def download_fixed_file():
    try:
        project_id = request.args.get('projectId')
        
        if project_id not in sessions:
            return jsonify({'error': 'Project not found'}), 404
        
        session = sessions[project_id]
        fixed_file = session.get('fixed_file')
        
        if not fixed_file or not os.path.exists(fixed_file):
            return jsonify({'error': 'Fixed file not found'}), 404
        
        return send_file(
            fixed_file,
            as_attachment=True,
            download_name=f"fixed_{session['original_filename']}"
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message')
        project_id = data.get('projectId')
        
        if project_id not in chat_sessions:
            return jsonify({'error': 'Chat session not found'}), 404
        
        chat_session = chat_sessions[project_id]
        
        # Send message to Gemini
        response = chat_session.send_message(message)
        
        return jsonify({
            'response': response.text
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/session-state', methods=['GET'])
def get_session_state():
    # Return empty state for now
    return jsonify({})

@app.route('/api/session-state', methods=['POST'])
def save_session_state():
    # For now, just return success
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)