import React, { useState, useEffect, useRef } from 'react';
import { generateReport, getReport, retryReport, downloadReport } from '../services/reportService';

export default function ReportStatus({ projectId }) {
  const [status,      setStatus]      = useState('idle');
  const [report,      setReport]      = useState(null);
  const [reportId,    setReportId]    = useState(null);
  const [error,       setError]       = useState(null);
  const [expanded,    setExpanded]    = useState(false);
  const [downloading, setDownloading] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const stopPolling  = () => clearInterval(intervalRef.current);
  const startPolling = (id) => {
    stopPolling();
    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await getReport(id);
        setStatus(data.status);
        if (data.status === 'completed') { setReport(data); stopPolling(); }
        else if (data.status === 'failed') { setError(data.error_message || 'Unknown error'); stopPolling(); }
      } catch { /* keep retrying on transient errors */ }
    }, 3000);
  };

  const handleGenerate = async () => {
    try {
      setStatus('pending'); setError(null); setReport(null);
      const { data } = await generateReport(projectId);
      setReportId(data.id);
      setStatus(data.status || 'pending');
      startPolling(data.id);
    } catch (e) {
      setStatus('failed');
      setError(e?.response?.data?.detail || e.message || 'Failed to start');
    }
  };

  const handleRetry = async () => {
    if (!reportId) { handleGenerate(); return; }
    try {
      setStatus('pending'); setError(null); setReport(null);
      await retryReport(reportId);
      startPolling(reportId);
    } catch (e) {
      setStatus('failed');
      setError(e?.response?.data?.detail || e.message || 'Retry failed');
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadReport(reportId);
    } catch (e) {
      setError('Download failed — please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-3">

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Generate / Regenerate */}
        {(status === 'idle' || status === 'completed') && (
          <button onClick={handleGenerate}
            className="px-4 py-2 text-sm bg-text-primary text-bg-surface rounded-md hover:opacity-90 transition-opacity">
            {status === 'completed' ? 'Regenerate Report' : 'Generate Report'}
          </button>
        )}

        {/* Spinner */}
        {(status === 'pending' || status === 'processing') && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-bg-secondary text-text-secondary">
            <span className="inline-block w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
            {status === 'pending' ? 'Queued...' : 'Generating report...'}
          </div>
        )}

        {/* Download — appears once completed */}
        {status === 'completed' && reportId && (
          <button onClick={handleDownload} disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-border text-text-primary rounded-md hover:bg-bg-secondary disabled:opacity-50 transition-colors">
            {downloading
              ? <><span className="inline-block w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />Downloading...</>
              : <><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v11" />
                  </svg>Download Report</>
            }
          </button>
        )}

        {/* Retry */}
        {status === 'failed' && (
          <>
            <span className="text-sm text-red-600 font-medium">Generation failed</span>
            <button onClick={handleRetry}
              className="px-3 py-1.5 text-sm border border-border rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors">
              Retry
            </button>
          </>
        )}
      </div>

      {/* ── Error message ── */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>
      )}

      {/* ── Completed summary card ── */}
      {status === 'completed' && report && (
        <div className="border border-border rounded-md overflow-hidden">
          <button onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-green-800 bg-green-50/50 hover:bg-green-50 transition-colors">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Ready — {report.completed_at ? new Date(report.completed_at).toLocaleString() : ''}
            </span>
            <span>{expanded ? '−' : '+'}</span>
          </button>

          {expanded && report.report_data && (
            <div className="px-4 pb-4 space-y-3 border-t border-border">
              <div className="grid grid-cols-3 gap-2 pt-3">
                {[
                  ['Stories',     report.report_data.summary?.total_stories],
                  ['Tasks',       report.report_data.summary?.total_tasks],
                  ['Done',        report.report_data.summary?.completed_tasks],
                  ['In Progress', report.report_data.summary?.in_progress_tasks],
                  ['To Do',       report.report_data.summary?.todo_tasks],
                  ['Completion',  `${report.report_data.summary?.completion_percentage ?? 0}%`],
                ].map(([label, val]) => (
                  <div key={label} className="bg-bg-surface border border-border rounded-md p-3 text-center">
                    <div className="text-lg font-semibold text-text-primary">{val ?? '—'}</div>
                    <div className="text-xs text-text-muted mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {report.report_data.velocity?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Velocity</p>
                  <div className="rounded-md border border-border overflow-hidden">
                    {report.report_data.velocity.map(v => (
                      <div key={v.sprint_id} className="flex justify-between text-xs px-3 py-2 border-b border-border/50 last:border-0 text-text-secondary">
                        <span>{v.sprint_name}</span>
                        <span className="font-semibold text-text-primary">{v.completed_points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-text-muted">
                Use <strong>Download Report</strong> above to save a formatted HTML file to your Downloads folder.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
