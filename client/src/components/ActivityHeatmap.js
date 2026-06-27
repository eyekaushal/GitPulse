function ActivityHeatmap({ heatmap }) {
  if (!heatmap || heatmap.length === 0) return null;

  const maxCount = Math.max(...heatmap.map((c) => c.count), 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function getColor(count) {
    if (count === 0) return '#161b22';
    const intensity = count / maxCount;
    if (intensity < 0.25) return '#0e4429';
    if (intensity < 0.5) return '#006d32';
    if (intensity < 0.75) return '#26a641';
    return '#39d353';
  }

  // Group heatmap data by day index
  const grid = {};
  for (const cell of heatmap) {
    if (!grid[cell.dayIndex]) grid[cell.dayIndex] = [];
    grid[cell.dayIndex].push(cell);
  }

  return (
    <div className="section">
      <h3 className="section-title">Activity Heatmap</h3>
      <p className="section-subtitle">Push events by day and hour (UTC)</p>
      <div className="heatmap-wrapper">
        <div className="heatmap-row heatmap-header-row">
          <div className="heatmap-day-label"></div>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="heatmap-hour-label">
              {i % 3 === 0 ? `${i}h` : ''}
            </div>
          ))}
        </div>
        {days.map((day, dayIdx) => (
          <div key={day} className="heatmap-row">
            <div className="heatmap-day-label">{day}</div>
            {(grid[dayIdx] || [])
              .sort((a, b) => a.hour - b.hour)
              .map((cell) => (
                <div
                  key={cell.hour}
                  className="heatmap-cell"
                  style={{ backgroundColor: getColor(cell.count) }}
                  title={`${day} ${cell.hour}:00 — ${cell.count} commits`}
                />
              ))}
          </div>
        ))}
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="heatmap-cell" style={{ backgroundColor: '#161b22' }} />
          <div className="heatmap-cell" style={{ backgroundColor: '#0e4429' }} />
          <div className="heatmap-cell" style={{ backgroundColor: '#006d32' }} />
          <div className="heatmap-cell" style={{ backgroundColor: '#26a641' }} />
          <div className="heatmap-cell" style={{ backgroundColor: '#39d353' }} />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default ActivityHeatmap;