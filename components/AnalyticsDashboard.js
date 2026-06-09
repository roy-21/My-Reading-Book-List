"use client";
import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from "recharts";
import { BarChart3, PieChart as PieIcon, TrendingUp, Award, BookOpen } from "lucide-react";

const COLORS = [
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#0ea5e9", // Sky
  "#ec4899", // Pink
];

const MONTH_ORDER = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AnalyticsDashboard({ books }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="glass p-8 text-center min-h-[300px] flex items-center justify-center">
        <div className="space-y-3">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Aggregating reading metrics...</p>
        </div>
      </div>
    );
  }

  // 1. Data Aggregation: Genre Distribution
  const genreCounts = {};
  books.forEach(b => {
    genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
  });
  const genreData = Object.keys(genreCounts).map(genre => ({
    name: genre,
    value: genreCounts[genre]
  })).sort((a, b) => b.value - a.value);

  // 2. Data Aggregation: Rating Distribution (1-5 Stars)
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  books.forEach(b => {
    if (b.rating >= 1 && b.rating <= 5) {
      ratingCounts[b.rating]++;
    }
  });
  const ratingData = Object.keys(ratingCounts).map(rating => ({
    rating: `${rating} ★`,
    count: ratingCounts[rating]
  }));

  // 3. Data Aggregation: Reading Journey Timeline (completed books only)
  const timelineCounts = {};
  books.filter(b => b.status === "completed" && b.startYear && b.startMonth).forEach(b => {
    const label = `${b.startMonth.slice(0, 3)} ${b.startYear.toString().slice(-2)}`;
    const monthIndex = MONTH_ORDER.indexOf(b.startMonth);
    const key = `${b.startYear}-${String(monthIndex).padStart(2, '0')}`;
    timelineCounts[key] = { label, count: (timelineCounts[key]?.count || 0) + 1, key };
  });
  
  const timelineData = Object.values(timelineCounts)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(item => ({
      name: item.label,
      books: item.count
    }));

  // Custom tooltips styling
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-space-950/90 border border-white/10 backdrop-blur-md px-3.5 py-2 rounded-lg text-xs shadow-xl">
          <p className="font-semibold text-slate-200 mb-1">{label || payload[0].name}</p>
          <p className="text-violet-400">
            {payload[0].name ? "" : "Count: "}
            <span className="font-bold">{payload[0].value}</span> {payload[0].value === 1 ? "book" : "books"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Stats Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{books.length}</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Books</div>
          </div>
        </div>

        <div className="glass p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {books.filter(b => b.status === "completed").length}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Completed</div>
          </div>
        </div>

        <div className="glass p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {(books.reduce((acc, curr) => acc + curr.rating, 0) / (books.length || 1)).toFixed(1)}★
            </div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Average Rating</div>
          </div>
        </div>

        <div className="glass p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {Object.keys(genreCounts).length}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active Genres</div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Genre Donut Chart */}
        <div className="glass p-6 flex flex-col h-[360px]">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={16} className="text-violet-400" />
            <h3 className="text-sm font-semibold text-slate-200">Genre Distribution</h3>
          </div>
          {genreData.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="h-[180px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={customTooltip} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-slate-200">{books.length}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Books</span>
                </div>
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4 max-h-[90px] overflow-y-auto pr-1">
                {genreData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-400 truncate pr-1" title={entry.name}>
                      {entry.name}
                    </span>
                    <span className="text-slate-500 font-bold ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              No data to display
            </div>
          )}
        </div>

        {/* Reading Timeline Line Chart */}
        <div className="glass p-6 flex flex-col h-[360px] md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">Reading Journey Timeline</h3>
          </div>
          {timelineData.length > 0 ? (
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={customTooltip} />
                  <Line 
                    type="monotone" 
                    dataKey="books" 
                    stroke="#22d3ee" 
                    strokeWidth={2.5}
                    dot={{ fill: "#06b6d4", stroke: "#05040f", strokeWidth: 1.5, r: 4 }}
                    activeDot={{ r: 6, fill: "#22d3ee" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Mark books as "Completed" to visualize your reading journey timeline
            </div>
          )}
        </div>

        {/* Rating Distribution Bar Chart */}
        <div className="glass p-6 flex flex-col h-[300px] md:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">Rating Distribution</h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis 
                  dataKey="rating" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={customTooltip} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Bar 
                  dataKey="count" 
                  fill="url(#colorRatingGrad)" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                >
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorRatingGrad)" />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorRatingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
