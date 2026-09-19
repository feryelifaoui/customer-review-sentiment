import { useState } from 'react';
import './App.css';

const SAMPLE_REVIEWS = [
  { label: 'Positive', text: 'The product exceeded all my expectations! Fast delivery and superb build quality.' },
  { label: 'Neutral', text: 'The item arrived on time. It works as described, nothing special.' },
  { label: 'Negative', text: 'Extremely disappointing. The item broke after two days and customer support was unhelpful.' }
];

function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (textToAnalyze = text) => {
    const targetText = textToAnalyze.trim();
    if (!targetText) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: targetText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur serveur HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Impossible de contacter le serveur backend. Vérifiez que le backend Flask est en cours d\'exécution sur le port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentBadgeColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return '#2e7d32';
      case 'negative':
        return '#c62828';
      case 'neutral':
      default:
        return '#ef6c00';
    }
  };

  const getBarColor = (label) => {
    switch (label.toLowerCase()) {
      case 'positive':
        return '#4caf50';
      case 'negative':
        return '#f44336';
      case 'neutral':
      default:
        return '#ff9800';
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Analyse de Sentiment d'Avis Clients</h1>
        <p className="subtitle">
          Entrez un avis client ou sélectionnez un exemple pour détecter automatiquement son sentiment grâce au modèle d'IA fine-tuné.
        </p>
      </header>

      <main className="card">
        <div className="sample-buttons">
          <span className="sample-label">Exemples rapides :</span>
          {SAMPLE_REVIEWS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              className="btn-sample"
              onClick={() => {
                setText(sample.text);
                handleAnalyze(sample.text);
              }}
            >
              {sample.label}
            </button>
          ))}
        </div>

        <textarea
          rows={4}
          placeholder="Saisissez ou collez votre avis client ici (ex: 'The product quality is amazing!')..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          type="button"
          className="btn-submit"
          disabled={loading || !text.trim()}
          onClick={() => handleAnalyze()}
        >
          {loading ? 'Analyse en cours...' : 'Analyser le sentiment'}
        </button>

        {error && (
          <div className="error-box">
            <strong>Erreur : </strong> {error}
          </div>
        )}

        {result && (
          <div className="result-card">
            <div className="result-header">
              <h3>Résultat de l'analyse</h3>
              <span
                className="sentiment-badge"
                style={{ backgroundColor: getSentimentBadgeColor(result.sentiment) }}
              >
                {result.sentiment}
              </span>
            </div>

            <div className="confidence-row">
              <span>Niveau de confiance :</span>
              <strong>{(result.confidence * 100).toFixed(1)}%</strong>
            </div>

            <div className="probabilities-section">
              <h4>Répartition des probabilités :</h4>
              {result.probabilities &&
                Object.entries(result.probabilities).map(([label, prob]) => (
                  <div key={label} className="prob-row">
                    <span className="prob-label">{label}</span>
                    <div className="prob-bar-bg">
                      <div
                        className="prob-bar-fill"
                        style={{
                          width: `${(prob * 100).toFixed(1)}%`,
                          backgroundColor: getBarColor(label),
                        }}
                      />
                    </div>
                    <span className="prob-value">{(prob * 100).toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
