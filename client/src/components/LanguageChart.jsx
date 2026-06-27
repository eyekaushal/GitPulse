import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#58a6ff',
  '#3fb950',
  '#d29922',
  '#f85149',
  '#bc8cff',
  '#f778ba',
  '#79c0ff',
  '#56d364',
  '#e3b341',
  '#ff7b72',
];

function LanguageChart({ languages }) {
  if (!languages || languages.length === 0) return null;

  const top = languages.slice(0, 8);
  const rest = languages.slice(8);

  const chartData = [...top];
  if (rest.length > 0) {
    const otherBytes = rest.reduce((sum, l) => sum + l.bytes, 0);
    const otherPct = rest.reduce((sum, l) => sum + l.percentage, 0);
    chartData.push({
      language: 'Other',
      bytes: otherBytes,
      percentage: Math.round(otherPct * 10) / 10,
    });
  }

  return (
    <div className="section">
      <h3 className="section-title">Languages</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="percentage"
              nameKey="language"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ language, percentage }) =>
                `${language} ${percentage}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.language}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${value}%`}
              contentStyle={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                color: '#e6edf3',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default LanguageChart;