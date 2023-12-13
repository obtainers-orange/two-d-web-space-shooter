from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

# Simple file-based high score storage
HIGH_SCORES_FILE = 'highscores.json'

def load_highscores():
    try:
        with open(HIGH_SCORES_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Default high scores
        return [
            {"name": "ACE", "score": 10000, "level": 5, "difficulty": "normal"},
            {"name": "MAX", "score": 8500, "level": 4, "difficulty": "hard"}, 
            {"name": "ZAP", "score": 7200, "level": 3, "difficulty": "normal"},
            {"name": "PRO", "score": 6000, "level": 3, "difficulty": "easy"},
            {"name": "TOP", "score": 4500, "level": 2, "difficulty": "normal"}
        ]

def save_highscores(scores):
    with open(HIGH_SCORES_FILE, 'w') as f:
        json.dump(scores, f, indent=2)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/highscores', methods=['GET'])
def get_highscores():
    scores = load_highscores()
    return jsonify(sorted(scores, key=lambda x: x['score'], reverse=True)[:10])

@app.route('/api/highscores', methods=['POST'])
def submit_highscore():
    data = request.get_json()
    
    if not data or 'name' not in data or 'score' not in data:
        return jsonify({'error': 'Invalid data'}), 400
    
    scores = load_highscores()
    
    new_score = {
        'name': data['name'][:3].upper(),  # Limit to 3 characters
        'score': int(data['score']),
        'level': data.get('level', 1),
        'difficulty': data.get('difficulty', 'normal')
    }
    
    scores.append(new_score)
    scores = sorted(scores, key=lambda x: x['score'], reverse=True)[:20]  # Keep top 20
    save_highscores(scores)
    
    return jsonify({'success': True, 'rank': scores.index(new_score) + 1})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)