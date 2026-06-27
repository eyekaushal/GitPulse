import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function CommitTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="section">
      <h3 className="section-title">Commit Timeline</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis
              dataKey="date"
              stroke="#8b949e"
              tick={{ fill: '#8b949e', fontSize: 12 }}
              tickFormatter={(d) => {
                const date = new Date(d);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              stroke="#8b949e"
              tick={{ fill: '#8b949e', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                color: '#e6edf3',
              }}
              labelStyle={{ color: '#e6edf3' }}
            />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="#58a6ff"
              fill="#58a6ff"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CommitTimeline;