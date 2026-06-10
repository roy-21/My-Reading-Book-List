"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { BarChart3, PieChart as PieIcon, TrendingUp, Award, BookOpen } from "lucide-react";

const COLORS = ["#6366f1", "#22d3ee", "#fbbf24", "#fb7185", "#34d399", "#818cf8", "#0ea5e9", "#ec4899"];

const MONTH_ORDER = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#12151e', border: '1px solid rgba(255,255,255,0.06)',
      padding: '0.5rem 0.75rem', borderRadius: 10, fontSize: '0.75rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
    }}>
      <p style={{ fontWeight: 600, color: '#dce0e8', marginBottom: 2 }}>{label || payload[0].name}</p>
      <p style={{ color: '#818cf8' }}>
        <span style={{ fontWeight: 700 }}>{payload[0].value}</span> {payload[0].value === 1 ? "book" : "books"}
      </p>
    </div>
  );
}

const COLOR_MAP = {
  blue:    { bg: "rgba(99, 102, 241, 0.08)", border: "rgba(99, 102, 241, 0.12)", text: "#818cf8" },
  emerald: { bg: "rgba(52, 211, 153, 0.08)", border: "rgba(52, 211, 153, 0.12)", text: "#34d399" },
  amber:   { bg: "rgba(251, 191, 36, 0.08)", border: "rgba(251, 191, 36, 0.12)", text: "#fbbf24" },
  rose:    { bg: "rgba(251, 113, 133, 0.08)", border: "rgba(251, 113, 133, 0.12)", text: "#fb7185" },
};

function StatCard({ icon: Icon, value, label, color }) {
  const styles = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div className="surface" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: styles.bg, border: `1px solid ${styles.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: styles.text
      }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0f1f5' }}>{value}</div>
        <div style={{ fontSize: '0.6rem', color: '#636d82', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard({ books }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="surface" style={{ padding: '2rem', textAlign: 'center', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 28, height: 28, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
          <p style={{ color: '#636d82', fontSize: '0.85rem' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Genre distribution
  const genreCounts = {};
  books.forEach((b) => { genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1; });
  const genreData = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Rating distribution
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  books.forEach((b) => { if (b.rating >= 1 && b.rating <= 5) ratingCounts[b.rating]++; });
  const ratingData = Object.entries(ratingCounts).map(([r, count]) => ({ rating: `${r} ★`, count }));

  // Timeline (completed books)
  const timelineCounts = {};
  books
    .filter((b) => b.status === "completed" && b.startYear && b.startMonth)
    .forEach((b) => {
      const monthIdx = MONTH_ORDER.indexOf(b.startMonth);
      const key = `${b.startYear}-${String(monthIdx).padStart(2, "0")}`;
      const label = `${b.startMonth.slice(0, 3)} ${String(b.startYear).slice(-2)}`;
      timelineCounts[key] = { label, count: (timelineCounts[key]?.count || 0) + 1, key };
    });
  const timelineData = Object.values(timelineCounts)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ label, count }) => ({ name: label, books: count }));

  const completedCount = books.filter((b) => b.status === "completed").length;
  const avgRating = books.length > 0
    ? (books.reduce((acc, b) => acc + b.rating, 0) / books.length).toFixed(1)
    : "0.0";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} value={books.length} label="Total Books" color="blue" />
        <StatCard icon={TrendingUp} value={completedCount} label="Completed" color="emerald" />
        <StatCard icon={Award} value={`${avgRating}★`} label="Avg Rating" color="amber" />
        <StatCard icon={BarChart3} value={Object.keys(genreCounts).length} label="Genres" color="rose" />
      </div>

      {/* Visual Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.12), transparent)' }} />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Donut */}
        <div className="surface" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: 340 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
            <PieIcon size={14} style={{ color: '#818cf8' }} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dce0e8' }}>Genre Distribution</h3>
          </div>
          {genreData.length > 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ height: 170, width: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genreData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                      {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dce0e8' }}>{books.length}</span>
                  <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#636d82', fontWeight: 700 }}>Books</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: '0.75rem', maxHeight: 80, overflowY: 'auto' }}>
                {genreData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-1.5" style={{ fontSize: '0.7rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, backgroundColor: COLORS[i % COLORS.length] }} />
                    <span style={{ color: '#8b94a6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
                    <span style={{ color: '#49516a', fontWeight: 700, marginLeft: 'auto' }}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#49516a', fontSize: '0.75rem' }}>No data</div>
          )}
        </div>

        {/* Timeline */}
        <div className="surface md:col-span-2" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: 340 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
            <TrendingUp size={14} style={{ color: '#22d3ee' }} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dce0e8' }}>Reading Timeline</h3>
          </div>
          {timelineData.length > 0 ? (
            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="#353d52" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#353d52" fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="books" stroke="#22d3ee" strokeWidth={2}
                    dot={{ fill: "#22d3ee", stroke: "#0c0e14", strokeWidth: 2, r: 3.5 }}
                    activeDot={{ r: 5, fill: "#22d3ee" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#49516a', fontSize: '0.75rem' }}>
              Complete some books to see your timeline
            </div>
          )}
        </div>

        {/* Rating Bar Chart */}
        <div className="surface md:col-span-3" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: 280 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
            <Award size={14} style={{ color: '#fbbf24' }} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dce0e8' }}>Rating Distribution</h3>
          </div>
          <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="rating" stroke="#353d52" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#353d52" fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.015)" }} />
                <Bar dataKey="count" fill="url(#ratingGrad)" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
