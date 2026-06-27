function InsightCards({ insights }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="section">
      <h3 className="section-title">Developer Insights</h3>
      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div key={index} className="insight-card">
            <span className="insight-icon">{insight.icon}</span>
            <div className="insight-content">
              <h4 className="insight-title">{insight.title}</h4>
              <p className="insight-description">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InsightCards;