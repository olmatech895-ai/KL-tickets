import re
import os

def remove_console_logs_and_comments(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    new_lines = []
    in_multiline_comment = False
    
    for line in lines:
        stripped = line.strip()
        
        if in_multiline_comment:
            if '*/' in line:
                in_multiline_comment = False
                if '*/' in line:
                    after_comment = line.split('*/', 1)[1]
                    if after_comment.strip():
                        new_lines.append(after_comment)
            continue
        
        if '/*' in line:
            parts = line.split('/*', 1)
            before = parts[0]
            after = parts[1]
            if '*/' in after:
                after_comment = after.split('*/', 1)[1]
                if before.strip() or after_comment.strip():
                    new_lines.append(before + after_comment)
            else:
                if before.strip():
                    new_lines.append(before)
                in_multiline_comment = True
            continue
        
        if stripped.startswith('//'):
            continue
        
        if '//' in line:
            before_comment = line.split('//')[0]
            if before_comment.strip():
                new_lines.append(before_comment.rstrip())
            continue
        
        console_pattern = r'console\.(log|error|warn|info|debug|trace)\s*\([^)]*\);?'
        if re.search(console_pattern, line):
            line = re.sub(console_pattern, '', line)
            if not line.strip():
                continue
        
        if line.strip():
            new_lines.append(line)
    
    new_content = '\n'.join(new_lines)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                file_path = os.path.join(root, file)
                try:
                    remove_console_logs_and_comments(file_path)
                    print(f'Processed: {file_path}')
                except Exception as e:
                    print(f'Error processing {file_path}: {e}')

if __name__ == '__main__':
    process_directory('src')

