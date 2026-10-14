"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { BarChart3, PieChart as PieIcon, TrendingUp, Award, BookOpen } from "lucide-react";

const COLORS = [
  "#6366f1", "#22d3ee", "#fbbf24", "#fb7185", "#34d399", 
  "#818cf8", "#0ea5e9", "#ec4899", "#a855f7", "#14b8a6", "#f97316"
];

const MONTH_ORDER = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      padding: '0.5rem 0.75rem', borderRadius: 10, fontSize: '0.75rem',
      boxShadow: 'var(--shadow-card)'
    }}>
      <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>{label || payload[0].name}</p>
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
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-highlight)' }}>{value}</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard({ books = [] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="surface" style={{ padding: '2rem', textAlign: 'center', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 28, height: 28, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Genre distribution
  const genreCounts = {};
  books.forEach((b) => {
    const g = b.genre || "General";
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  });
  const genreData = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Rating distribution (only rated books)
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  books.forEach((b) => {
    if (typeof b.rating === "number" && b.rating >= 1 && b.rating <= 5) {
      ratingCounts[b.rating]++;
    }
  });
  const ratingData = Object.entries(ratingCounts).map(([r, count]) => ({ rating: `${r} ★`, count }));

  // Timeline (completed books using completion or start dates)
  const timelineCounts = {};
  books
    .filter((b) => b.status === "completed" && (b.completedYear || b.startYear))
    .forEach((b) => {
      const year = b.completedYear || b.startYear;
      const month = b.completedMonth || b.startMonth || "June";
      const monthIdx = MONTH_ORDER.indexOf(month);
      const key = `${year}-${String(monthIdx).padStart(2, "0")}`;
      const label = `${month.slice(0, 3)} '${String(year).slice(-2)}`;
      timelineCounts[key] = { label, count: (timelineCounts[key]?.count || 0) + 1, key };
    });
  const timelineData = Object.values(timelineCounts)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ label, count }) => ({ name: label, books: count }));

  const completedCount = books.filter((b) => b.status === "completed").length;
  const currentlyReadingCount = books.filter((b) => b.status === "reading").length;
  const ratedBooks = books.filter((b) => typeof b.rating === "number" && b.rating > 0);
  const avgRating = ratedBooks.length > 0
    ? (ratedBooks.reduce((acc, b) => acc + b.rating, 0) / ratedBooks.length).toFixed(1)
    : "—";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} value={books.length} label="Total Catalogue" color="blue" />
        <StatCard icon={TrendingUp} value={`${completedCount} (${currentlyReadingCount} reading)`} label="Completed Reads" color="emerald" />
        <StatCard icon={Award} value={avgRating !== "—" ? `${avgRating} ★` : "—"} label="Avg Rating" color="amber" />
        <StatCard icon={BarChart3} value={Object.keys(genreCounts).length} label="Unique Genres" color="rose" />
      </div>

      {/* Visual Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Genre Donut */}
        <div className="surface" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="flex items-center gap-2">
            <PieIcon size={14} style={{ color: '#818cf8' }} />
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-highlight)' }}>Genre Distribution</h4>
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genreData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3}>
                  {genreData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center" style={{ maxHeight: 60, overflowY: 'auto' }}>
            {genreData.map((g, i) => (
              <span key={g.name} className="flex items-center gap-1" style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                {g.name} ({g.value})
              </span>
            ))}
          </div>
        </div>

        {/* Rating Bar Chart */}
        <div className="surface" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="flex items-center gap-2">
            <Award size={14} style={{ color: '#fbbf24' }} />
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-highlight)' }}>Ratings Breakdown</h4>
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="rating" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#fbbf24" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Ratings recorded for {ratedBooks.length} reviewed books
          </p>
        </div>

        {/* Timeline */}
        <div className="surface" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: '#34d399' }} />
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-highlight)' }}>Reading Pace</h4>
          </div>
          <div style={{ width: '100%', height: 200 }}>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="books" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Timeline data building up...
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Completed milestones by date
          </p>
        </div>
      </div>
    </div>
  );
}
