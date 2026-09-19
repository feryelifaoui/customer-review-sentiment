import json
import os

import torch
import torch.nn.functional as F
from transformers import AutoModelForSequenceClassification, AutoTokenizer

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MAX_LENGTH = 128
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"Chargement du modèle depuis {MODEL_DIR}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR).to(device)
model.eval()

with open(os.path.join(MODEL_DIR, "label_mapping.json")) as f:
    label_names = {int(k): v for k, v in json.load(f).items()}


def predict_sentiment(text: str) -> dict:
    inputs = tokenizer(
        text, return_tensors="pt", truncation=True, padding=True, max_length=MAX_LENGTH
    ).to(device)

    with torch.no_grad():
        logits = model(**inputs).logits

    probs = F.softmax(logits, dim=-1).squeeze().cpu().numpy()
    pred_id = int(probs.argmax())

    return {
        "sentiment": label_names[pred_id],
        "confidence": float(probs[pred_id]),
        "probabilities": {label_names[i]: float(probs[i]) for i in range(len(label_names))},
    }