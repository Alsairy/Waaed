#!/usr/bin/env python3
import os
import re
import sys

def fix_yaml_line_length(file_path, max_length=80):
    """Fix YAML line length violations by breaking long lines appropriately."""
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    fixed_lines = []
    for line_num, line in enumerate(lines, 1):
        # Remove trailing whitespace
        line = line.rstrip() + '\n'
        
        # Skip if line is within limit
        if len(line.rstrip()) <= max_length:
            fixed_lines.append(line)
            continue
        
        # Handle different types of long lines
        stripped = line.lstrip()
        indent = line[:len(line) - len(stripped)]
        
        # Handle long comments
        if stripped.startswith('#'):
            # Break long comments at word boundaries
            comment_content = stripped[1:].strip()
            if len(line.rstrip()) > max_length:
                words = comment_content.split()
                current_line = indent + '#'
                for word in words:
                    if len(current_line + ' ' + word) <= max_length:
                        current_line += ' ' + word
                    else:
                        fixed_lines.append(current_line + '\n')
                        current_line = indent + '# ' + word
                if current_line.strip() != indent.strip() + '#':
                    fixed_lines.append(current_line + '\n')
            else:
                fixed_lines.append(line)
            continue
        
        # Handle long string values
        if ':' in stripped and len(line.rstrip()) > max_length:
            # Try to break at logical points
            if 'description:' in stripped:
                # Break long descriptions
                key_part = stripped.split(':', 1)[0] + ':'
                value_part = stripped.split(':', 1)[1].strip()
                if value_part.startswith("'") or value_part.startswith('"'):
                    # Multi-line string
                    quote_char = value_part[0]
                    fixed_lines.append(indent + key_part + ' >\n')
                    # Break the content into multiple lines
                    content = value_part.strip(quote_char)
                    words = content.split()
                    current_line = indent + '  '
                    for word in words:
                        if len(current_line + word + ' ') <= max_length:
                            current_line += word + ' '
                        else:
                            fixed_lines.append(current_line.rstrip() + '\n')
                            current_line = indent + '  ' + word + ' '
                    if current_line.strip():
                        fixed_lines.append(current_line.rstrip() + '\n')
                else:
                    fixed_lines.append(line)
            else:
                fixed_lines.append(line)
        else:
            fixed_lines.append(line)
    
    # Write back to file
    with open(file_path, 'w') as f:
        f.writelines(fixed_lines)

def main():
    workflow_dir = '.github/workflows'
    if not os.path.exists(workflow_dir):
        print(f"Directory {workflow_dir} not found")
        return
    
    for filename in os.listdir(workflow_dir):
        if filename.endswith('.yml') or filename.endswith('.yaml'):
            file_path = os.path.join(workflow_dir, filename)
            print(f"Processing {file_path}...")
            try:
                fix_yaml_line_length(file_path)
                print(f"Fixed {file_path}")
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

if __name__ == '__main__':
    main()
