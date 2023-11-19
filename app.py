from flask import Flask, render_template, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/highscores', methods=['GET'])
def get_highscores():
    # TODO: Implement highscore retrieval from database
    return jsonify([
        {"name": "ACE", "score": 10000},
        {"name": "MAX", "score": 8500},
        {"name": "ZAP", "score": 7200}
    ])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)