'use client';

import { createElement, useMemo, useState } from 'react';
import { BriefcaseBusiness, CalendarDays, ChartNoAxesCombined, Clock3, Handshake, Target } from 'lucide-react';

const STATUS_ROWS = [
  { label: 'Applied', color: 'var(--ct-primary)' },
  { label: 'Screening', color: 'var(--ct-cyan)' },
  { label: 'Interviewing', color: 'var(--ct-warning)' },
  { label: 'Offer Received', color: 'var(--ct-success)' },
  { label: 'Rejected', color: 'var(--ct-danger)' },
];
const EMPTY_LIST = [];

const validDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const countBy = (items, getKey) => items.reduce((counts, item) => {
  const key = getKey(item) || 'Not specified';
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {});

function MetricCard({ icon, label, value, detail, tone = 'green' }) {
  return (
    <article className={`analytics-metric analytics-metric-${tone}`}>
      <div className="analytics-metric-top">
        <span className="analytics-metric-icon">{createElement(icon, { size: 17 })}</span>
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ProgressRow({ label, value, total, color, suffix }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="analytics-progress-row">
      <div className="analytics-progress-label">
        <span><i style={{ background: color }} />{label}</span>
        <strong>{value}<small>{suffix || ` · ${percentage}%`}</small></strong>
      </div>
      <div className="analytics-progress-track" aria-label={`${label}: ${percentage}%`}>
        <span style={{ width: `${percentage}%`, background: color }} />
      </div>
    </div>
  );
}

export default function Analytics({ initialStats = { totalApplications: 0, totalInterviews: 0, byStatus: {}, applications: [], interviews: [] } }) {
  const [period, setPeriod] = useState(6);
  const applications = Array.isArray(initialStats.applications) ? initialStats.applications : EMPTY_LIST;
  const interviews = Array.isArray(initialStats.interviews) ? initialStats.interviews : EMPTY_LIST;
  const total = applications.length;
  const byStatus = initialStats.byStatus || {};
  const interviewStages = (byStatus.Interviewing || 0) + (byStatus['Offer Received'] || 0);
  const offers = byStatus['Offer Received'] || 0;
  const active = total - offers - (byStatus.Rejected || 0);
  const interviewRate = total ? Math.round((interviewStages / total) * 100) : 0;
  const offerRate = total ? Math.round((offers / total) * 100) : 0;

  const monthly = useMemo(() => {
    const now = new Date();
    return Array.from({ length: period }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (period - index - 1), 1);
      const count = applications.filter((application) => {
        const applied = validDate(application.dateApplied || application.createdAt);
        return applied && applied.getFullYear() === date.getFullYear() && applied.getMonth() === date.getMonth();
      }).length;
      return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString(undefined, { month: 'short' }), count };
    });
  }, [applications, period]);
  const maxMonth = Math.max(1, ...monthly.map((month) => month.count));

  const sources = useMemo(() => Object.entries(countBy(applications, (application) => application.source?.trim()))
    .map(([label, count]) => {
      const matched = applications.filter((application) => (application.source?.trim() || 'Not specified') === label);
      const advanced = matched.filter((application) => ['Screening', 'Interviewing', 'Offer Received'].includes(application.status)).length;
      const sourceOffers = matched.filter((application) => application.status === 'Offer Received').length;
      return { label, count, advanced, sourceOffers, rate: matched.length ? Math.round((advanced / matched.length) * 100) : 0 };
    })
    .sort((a, b) => b.count - a.count || b.rate - a.rate)
    .slice(0, 5), [applications]);

  const roles = useMemo(() => Object.entries(countBy(applications, (application) => application.title?.trim()))
    .sort((a, b) => b[1] - a[1]).slice(0, 5), [applications]);
  const workModes = useMemo(() => Object.entries(countBy(applications, (application) => application.workMode))
    .sort((a, b) => b[1] - a[1]), [applications]);

  const upcomingInterviews = interviews.filter((interview) => {
    const date = validDate(interview.date);
    return date && date >= new Date(new Date().setHours(0, 0, 0, 0));
  }).length;
  const latestApplication = applications.reduce((latest, application) => {
    const date = validDate(application.dateApplied || application.createdAt);
    return date && (!latest || date > latest) ? date : latest;
  }, null);
  const lastActivity = latestApplication
    ? latestApplication.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No applications yet';

  return (
    <div className="page-enter analytics-page">
      <header className="analytics-header">
        <div>
          <p className="analytics-eyebrow">Your search, in focus</p>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">A clear view of application momentum, outcomes, and where to focus next.</p>
        </div>
        <div className="analytics-period" role="group" aria-label="Application period">
          {[6, 12].map((months) => (
            <button key={months} className={period === months ? 'active' : ''} onClick={() => setPeriod(months)}>
              {months} months
            </button>
          ))}
        </div>
      </header>

      <section className="analytics-metrics" aria-label="Job search summary">
        <MetricCard icon={BriefcaseBusiness} label="Applications" value={total} detail={`${active} active in your pipeline`} />
        <MetricCard icon={Handshake} label="Reached interviews" value={`${interviewRate}%`} detail={`${interviewStages} applications advanced`} tone="sage" />
        <MetricCard icon={Target} label="Offers" value={offers} detail={`${offerRate}% of applications`} tone="ochre" />
        <MetricCard icon={CalendarDays} label="Interviews scheduled" value={upcomingInterviews} detail={`${interviews.length} total interview records`} tone="clay" />
      </section>

      <section className="analytics-main-grid">
        <article className="ct-card analytics-card analytics-activity-card">
          <div className="analytics-card-heading">
            <div><p className="analytics-eyebrow">Application activity</p><h2>Monthly momentum</h2></div>
            <span className="analytics-card-icon"><ChartNoAxesCombined size={18} /></span>
          </div>
          {total ? (
            <div className="analytics-chart" style={{ '--analytics-month-count': period }} role="img" aria-label={`Applications per month over the last ${period} months`}>
              {monthly.map((month) => (
                <div className="analytics-chart-column" key={month.key}>
                  <span className="analytics-chart-count">{month.count || ''}</span>
                  <div className="analytics-chart-well"><span style={{ height: `${month.count ? Math.max(8, (month.count / maxMonth) * 100) : 0}%` }} /></div>
                  <span className="analytics-chart-month">{month.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-empty"><BriefcaseBusiness size={20} /><span>Log your first application to see monthly activity here.</span></div>
          )}
          <div className="analytics-card-foot"><Clock3 size={14} /> Latest application: <strong>{lastActivity}</strong></div>
        </article>

        <article className="ct-card analytics-card">
          <div className="analytics-card-heading"><div><p className="analytics-eyebrow">Current pipeline</p><h2>Stage by stage</h2></div></div>
          <div className="analytics-status-list">
            {STATUS_ROWS.map((row) => <ProgressRow key={row.label} label={row.label} value={byStatus[row.label] || 0} total={total} color={row.color} />)}
          </div>
          <p className="analytics-note">Interview rate counts applications in Interviewing or Offer Received.</p>
        </article>
      </section>

      <section className="analytics-secondary-grid">
        <article className="ct-card analytics-card">
          <div className="analytics-card-heading"><div><p className="analytics-eyebrow">What is working</p><h2>Sources & progression</h2></div></div>
          {sources.length ? <div className="analytics-source-list">
            {sources.map((source) => <div className="analytics-source-row" key={source.label}>
              <div className="analytics-source-name"><strong>{source.label}</strong><span>{source.count} {source.count === 1 ? 'application' : 'applications'}</span></div>
              <div className="analytics-source-result"><strong>{source.rate}%</strong><span>advanced</span></div>
              <div className="analytics-source-result"><strong>{source.sourceOffers}</strong><span>offers</span></div>
            </div>)}
          </div> : <div className="analytics-empty">Add a source to your applications to compare where opportunities come from.</div>}
        </article>

        <article className="ct-card analytics-card">
          <div className="analytics-card-heading"><div><p className="analytics-eyebrow">Your focus</p><h2>Roles & work style</h2></div></div>
          {roles.length ? <div className="analytics-role-list">
            {roles.map(([role, count]) => <ProgressRow key={role} label={role} value={count} total={total} color="var(--ct-primary)" />)}
          </div> : <div className="analytics-empty">Your most tracked roles will appear here.</div>}
          {workModes.length > 0 && <div className="analytics-work-modes">
            {workModes.map(([mode, count]) => <span key={mode}>{mode}<strong>{count}</strong></span>)}
          </div>}
        </article>
      </section>
    </div>
  );
}
