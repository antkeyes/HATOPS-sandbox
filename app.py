from flask import Flask, render_template, send_from_directory, request, jsonify
import os
import datetime
import json

app = Flask(__name__)
BASE_DIR = '/Users/anthonykeyes/hatpi'  # Set the base directory
EXCLUDE_FOLDERS = {'static', 'templates', '.git', '__pycache__'}  # Folders to exclude
COMMENTS_FILE = 'comments.json'  # File to store comments

@app.route('/')
def home():
    folders = []
    for folder in os.listdir(BASE_DIR):
        folder_path = os.path.join(BASE_DIR, folder)
        if os.path.isdir(folder_path) and folder not in EXCLUDE_FOLDERS:
            creation_date = get_creation_date(folder_path)
            folders.append((folder, creation_date))
    comments = load_comments()
    return render_template('index.html', folders=folders, comments=comments)

@app.route('/<folder_name>/')
def folder(folder_name):
    folder_path = os.path.join(BASE_DIR, folder_name)
    files = os.listdir(folder_path)
    images = [(file, get_creation_date(os.path.join(folder_path, file))) for file in files if file.endswith('.jpg')]
    html_files = [(file, get_creation_date(os.path.join(folder_path, file))) for file in files if file.endswith('.html')]
    print("Folder path:", folder_path)
    print("All files:", files)
    print("Images found:", images)
    return render_template('folder.html', images=images, html_files=html_files, folder_name=folder_name)

@app.route('/<folder_name>/<filename>')
def file(folder_name, filename):
    return send_from_directory(os.path.join(BASE_DIR, folder_name), filename)

@app.route('/submit_comment', methods=['POST'])
def submit_comment():
    data = request.json
    file_name = data.get('fileName')
    comment = data.get('comment')
    if file_name and comment:
        comments = load_comments()
        if file_name not in comments:
            comments[file_name] = []
        comments[file_name].append({
            'comment': comment,
            'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        save_comments(comments)
        return jsonify({'success': True})
    return jsonify({'success': False})

def get_creation_date(file_path):
    return datetime.datetime.fromtimestamp(os.path.getctime(file_path)).strftime('%Y-%m-%d %H:%M:%S')

def load_comments():
    if os.path.exists(COMMENTS_FILE):
        with open(COMMENTS_FILE, 'r') as file:
            return json.load(file)
    return {}

def save_comments(comments):
    with open(COMMENTS_FILE, 'w') as file:
        json.dump(comments, file, indent=4)

if __name__ == '__main__':
    app.run(debug=True, port=8080)
