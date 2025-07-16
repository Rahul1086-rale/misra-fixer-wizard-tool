# fixed_response_code_snippet.py
import re
import json

def extract_snippets_from_response(response_text):
    """
    Parses Gemini-style C++ response text and extracts line-numbered code,
    preserving backslashes and formatting. Returns a dictionary.
    """
    # Match all ```cpp ... ``` blocks (non-greedy)
    code_blocks = re.findall(r"```(?:cpp|c\+\+)?\s*\n(.*?)```", response_text, re.DOTALL)
    
    all_lines = {}

    for block in code_blocks:
        lines = block.strip().splitlines()
        for line in lines:
            match = re.match(r"^(\d+[a-zA-Z]*):(.*)$", line)
            if match:
                lineno = match.group(1).strip()
                code = match.group(2).rstrip()  # Do NOT strip backslashes
                all_lines[lineno] = code
            else:
                print(f"⚠️ Skipping: {line}")
    
    return all_lines


def save_snippets_to_json(snippets, filepath="temp_snippets.json"):
    """Save snippets to JSON file"""
    with open(filepath, "w") as f:
        json.dump(snippets, f, indent=2)


def parse_fixed_code_blocks(gemini_response: str):
    """
    Parses Gemini's response to extract fixed C++ code snippets.
    Each snippet must have line numbers like: 123: or 123a:
    Returns a list of lists, where each list is a block of fixed lines.
    """
    fixed_blocks = []
    current_block = []

    # Remove markdown code block fences like ```c++ or ``` etc.
    lines = gemini_response.strip().splitlines()
    inside_code_block = False

    for raw_line in lines:
        line = raw_line.strip()

        if line.startswith("```"):
            inside_code_block = not inside_code_block
            continue  # Skip the ``` lines

        if not inside_code_block:
            continue  # Ignore non-code lines

        # If this line starts with a line number (e.g., 123: or 123a:), accept it
        if re.match(r'^\d+[a-z]*\:', line):
            current_block.append(line)
        elif current_block and line == "":
            fixed_blocks.append(current_block)
            current_block = []

    if current_block:
        fixed_blocks.append(current_block)

    return fixed_blocks