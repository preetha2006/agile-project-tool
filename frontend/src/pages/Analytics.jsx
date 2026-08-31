import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { getProjectStats, getBurndown, getVelocity } from '../services/analyticsService';
import AnalyticsCard from '../components/AnalyticsCard';
import ReportStatus from '../components/ReportStatus';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

export default function Analytics() {
  const { projectId } = useParams();
  const [stats, setStats] = useState(null);
  const [burndown, setBurndown] = useState([]);
  const [velocity, setVelocity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const statsRes = await getProjectStats(projectId);
      setStats(statsRes.data);

      const velocityRes = await getVelocity(projectId);
      setVelocity(velocityRes.data || []);

      // Burndown requires the active sprint ID
      if (statsRes.data?.active_sprint?.id) {
        const burndownRes = await getBurndown(statsRes.data.active_sprint.id);
        setBurndown(burndownRes.data || []);
      } else {
        setBurndown([]);
      }
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [projectId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchAnalytics} />;

  const hasBurndown = burndown && burndown.length > 0;
  const hasVelocity = velocity && velocity.length > 0;

  const chartTooltipStyle = {
    contentStyle: {
      backgroundColor: '#FFFDF8',
      borderColor: '#DED6C9',
      borderRadius: '6px',
      color: '#3E3A35',
      fontSize: '13px'
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Analytics</h1>
        {stats?.active_sprint && (
          <p className="text-sm text-text-secondary mt-1">
            Active sprint: <span className="font-medium">{stats.active_sprint.name}</span>
          </p>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <AnalyticsCard title="Total Stories" value={stats?.total_stories ?? 0} />
        <AnalyticsCard title="Total Tasks" value={stats?.total_tasks ?? 0} />
        <AnalyticsCard title="Completed" value={stats?.completed_tasks ?? 0} />
        <AnalyticsCard title="In Progress" value={stats?.in_progress_tasks ?? 0} />
        <AnalyticsCard
          title="Completion"
          value={`${stats?.completion_percentage ?? 0}%`}
          subtitle={`${stats?.completed_tasks ?? 0} of ${stats?.total_tasks ?? 0} tasks done`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Burndown Chart */}
        <div className="bg-bg-surface p-6 rounded-lg border border-border">
          <h2 className="text-base font-medium text-text-primary mb-1">Sprint Burndown</h2>
          <p className="text-sm text-text-secondary mb-4">Remaining story points over time</p>
          {!hasBurndown ? (
            <div className="h-60">
              <EmptyState
                title="No burndown data"
                description={stats?.active_sprint ? 'No story point data for this sprint yet.' : 'Start a sprint to see the burndown chart.'}
              />
            </div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndown} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE5D8" />
                  <XAxis dataKey="date" stroke="#9A8F85" tick={{ fill: '#9A8F85', fontSize: 11 }} />
                  <YAxis stroke="#9A8F85" tick={{ fill: '#9A8F85', fontSize: 11 }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="ideal" stroke="#C8B9A6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Ideal" />
                  <Line type="monotone" dataKey="remaining" stroke="#B9C5D0" strokeWidth={2} dot={{ r: 3, fill: '#B9C5D0' }} name="Remaining" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Velocity Chart */}
        <div className="bg-bg-surface p-6 rounded-lg border border-border">
          <h2 className="text-base font-medium text-text-primary mb-1">Velocity</h2>
          <p className="text-sm text-text-secondary mb-4">Story points completed per sprint</p>
          {!hasVelocity ? (
            <div className="h-60">
              <EmptyState title="No velocity data" description="Complete sprints to see velocity." />
            </div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocity} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE5D8" />
                  <XAxis dataKey="sprint_name" stroke="#9A8F85" tick={{ fill: '#9A8F85', fontSize: 11 }} />
                  <YAxis stroke="#9A8F85" tick={{ fill: '#9A8F85', fontSize: 11 }} />
                  <Tooltip {...chartTooltipStyle} cursor={{ fill: '#F5F0E8' }} />
                  <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
                  <Bar dataKey="completed_points" fill="#B7C4B0" name="Completed Points" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Report Generation */}
      <div className="bg-bg-surface p-6 rounded-lg border border-border">
        <h2 className="text-base font-medium text-text-primary mb-1">Progress Report</h2>
        <p className="text-sm text-text-secondary mb-4">Generate a detailed project report in the background</p>
        <ReportStatus projectId={parseInt(projectId)} />
      </div>
    </div>
  );
}
