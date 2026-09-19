from flask import Flask, request, jsonify
from flask_cors import CORS

from model import predict_sentiment

app = Flask(__name__)
CORS(app)  # autorise le frontend React (autre port) à appeler cette API


@app.route("/", methods=["GET"])
def root():
    return jsonify({"status": "ok", "message": "Sentiment Analysis API is running"})


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)

    if not data or "text" not in data:
        return jsonify({"error": "Le champ 'text' est requis dans le corps JSON."}), 400

    text = data["text"].strip()
    if not text:
        return jsonify({"error": "Le champ 'text' ne peut pas être vide."}), 400

    result = predict_sentiment(text)
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)