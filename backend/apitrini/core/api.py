from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Apitrini est en ligne:"})


@app.route('/api/analyze', methods=['POST'])
def analyze():
    return jsonify({
        "success": True,
        "varroa_count": 42,
        "processing_time": "1.2s"
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
