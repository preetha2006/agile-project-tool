import React, { useState, useEffect, useRef } from 'react';
import { generateReport, getReport, retryReport } from '../services/reportService';

const STATUS_CONFIG = {
  idle:       { label: 'Generate Report',   color: 'text-text-primary',   bg: '' },
  pending:    { label: 'Queued...',          color: 'text-text-secondary', bg: 'bg-bg-secondary' },
  processing: { label: 'Generating...',     color: 'text-blue-700',       bg: 'bg-blue-50' },
  completed:  { label: 'Report Ready',      color: 'text-green-700',      bg: 'bg-green-50' },
  failed:     { label: 'Generation Failed', color: 'text-red-700',        bg: 'bg-red-50' },
};

export default function ReportStatus({ projectId }) {
  const [status, setStatus] = useState('idle'); // idle | pending | processing | completed | failed
  const [report, setReport] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const intervalRef = useRef(null);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), []);

  const poll = (id) => {
    stopPolling();
    intervalRef.current = setInterval(async () => {
      try {
        const res = await getReport(id);
        const data = res.data;
        setStatus(data.status);
        if (data.status === 'completed') {
          setReport(data);
          stopPolling();
        } else if (data.status === 'failed') {
          setError(data.error_message || 'Unknown error');
          stopPolling();
        }
      } catch (e) {
        // keep polling on transient network errors
      }
    }, 3000);
  };

  const handleGenerate = async () => {
    try {
      setStatus('pending');
      setError(null);
      setReport(null);
      const res = await generateReport(projectId);
      const id = res.data.id;
      setReportId(id);
      setStatus(res.data.status || 'pending');
      poll(id);
    } catch (e) {
      setStatus('failed');
      setError(e?.response?.data?.detail || e.message || 'Failed to start report');
    }
  };

  const handleRetry = async () => {
    if (!reportId) { handleGenerate(); return; }
    try {
      setStatus('pending');
      setError(null);
      setReport(null);
      const res = await retryReport(reportId);
      setStatus(res.data.status || 'pending');
      poll(reportId);
    } catch (e) {
      setStatus('failed');
      setError(e?.response?.data?.detail || e.message || 'Retry failed');
    }
  };

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {(status === 'idle' || status === 'completed') && (
          <button
            onClick={handleGenerate}
            className="px-4 py-2 text-sm bg-text-primary text-bg-surface rounded-md hover:opacity-90 transition-opacity"
          >
            {status === 'completed' ? 'Regenerate Report' : 'Generate Report'}
          </button>
        )}

        {(status === 'pending' || status === 'processing') && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${cfg.bg} ${cfg.color}`}>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {cfg.label}
          </div>
        )}

        {status === 'failed' && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-600">{cfg.label}</span>
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 text-sm border border-border rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {status === 'completed' && report && (
        <div className="border border-accent-sage/30 bg-green-50/50 rounded-md overflow-hidden">
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-green-800 hover:bg-green-50 transition-colors"
          >
            <span>Report generated at {new Date(report.completed_at).toLocaleString()}</span>
            <span>{expanded ? '−' : '+'}</span>
          </button>

          {expanded && report.report_data && (
            <div className="px-4 pb-4 space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  ['Total Stories', report.report_data.summary?.total_stories],
                  ['Total Tasks', report.report_data.summary?.total_tasks],
                  ['Completed', report.report_data.summary?.completed_tasks],
                  ['In Progress', report.report_data.summary?.in_progress_tasks],
                  ['Completion', `${report.report_data.summary?.completion_percentage ?? 0}%`],
                  ['Sprints', report.report_data.sprints?.length ?? 0],
                ].map(([label, val]) => (
                  <div key={label} className="bg-bg-surface border border-border rounded-md p-3 text-center">
                    <div className="text-lg font-semibold text-text-primary">{val ?? '—'}</div>
                    <div className="text-xs text-text-muted mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {report.report_data.velocity?.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Velocity</h4>
                  {report.report_data.velocity.map(v => (
                    <div key={v.sprint_id} className="flex justify-between text-xs text-text-secondary py-1 border-b border-border/50">
                      <span>{v.sprint_name}</span>
                      <span className="font-medium text-text-primary">{v.completed_points} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
