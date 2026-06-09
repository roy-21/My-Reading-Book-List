"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { BarChart3, PieChart as PieIcon, TrendingUp, Award, BookOpen } from "lucide-react";

const COLORS = ["#3b82f6", "#22d3ee", "#fbbf24", "#fb7185", "#34d399", "#6366f1", "#0ea5e9", "#ec4899"];

const MONTH_ORDER = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-base-700 px-3 py-2 rounded-lg text-xs shadow-lg">
      <p className="font-semibold text-gray-200 mb-0.5">{label || payload[0].name}</p>
      <p className="text-blue-400">
        <span className="font-bold">{payload[0].value}</span> {payload[0].value === 1 ? "book" : "books"}
      </p>
    </div>
  );
}

const COLOR_MAP = {
  blue:    { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  amber:   { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  rose:    { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400" },
};

function StatCard({ icon: Icon, value, label, color }) {
  const styles = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div className="surface p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg ${styles.bg} border ${styles.border} flex items-center justify-center ${styles.text}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xl font-bold text-gray-100">{value}</div>
        <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard({ books }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="surface p-8 text-center min-h-[300px] flex items-center justify-center">
        <div className="space-y-3">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading analytics...</p>
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
    <div className="space-y-6 animate-fade-in">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} value={books.length} label="Total Books" color="blue" />
        <StatCard icon={TrendingUp} value={completedCount} label="Completed" color="emerald" />
        <StatCard icon={Award} value={`${avgRating}★`} label="Avg Rating" color="amber" />
        <StatCard icon={BarChart3} value={Object.keys(genreCounts).length} label="Genres" color="rose" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Donut */}
        <div className="surface p-5 flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon size={14} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-200">Genre Distribution</h3>
          </div>
          {genreData.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="h-[170px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genreData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                      {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-gray-200">{books.length}</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Books</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-3 max-h-[80px] overflow-y-auto">
                {genreData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-400 truncate">{entry.name}</span>
                    <span className="text-gray-600 font-bold ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600 text-xs">No data</div>
          )}
        </div>

        {/* Timeline */}
        <div className="surface p-5 flex flex-col h-[340px] md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-gray-200">Reading Timeline</h3>
          </div>
          {timelineData.length > 0 ? (
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="name" stroke="#404040" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#404040" fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="books" stroke="#22d3ee" strokeWidth={2}
                    dot={{ fill: "#22d3ee", stroke: "#000", strokeWidth: 1.5, r: 3.5 }}
                    activeDot={{ r: 5, fill: "#22d3ee" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600 text-xs">
              Complete some books to see your timeline
            </div>
          )}
        </div>

        {/* Rating Bar Chart */}
        <div className="surface p-5 flex flex-col h-[280px] md:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <Award size={14} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-gray-200">Rating Distribution</h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="rating" stroke="#404040" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#404040" fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Bar dataKey="count" fill="url(#ratingGrad)" radius={[3, 3, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
