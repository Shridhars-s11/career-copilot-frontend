import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
 
const API_BASE = 'https://career-copilot-api-cg9h.onrender.com'
 
function ProgressPage() {
  const [trends, setTrends] = useState(null)
  const [error, setError] = useState(null)
 
  useEffect(() => {
    fetch(`${API_BASE}/performance/trends`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        return res.json()
      })
      .then(setTrends)
      .catch((e) => setError(e.message))
  }, [])
 
  if (error) {
    return <p className="text-secondary text-sm">{error}</p>
  }
  if (!trends) {
    return <p className="text-muted text-sm">Loading…</p>
  }
 
  const categories = Object.keys(trends)
  if (categories.length === 0) {
    return (
      <p className="text-muted text-sm">
        No interview sessions yet — practice a mock interview to start seeing your trend here.
      </p>
    )
  }
 
  // merge all categories into one array of points, keyed by index (session order)
  const maxLen = Math.max(...categories.map((c) => trends[c].length))
  const chartData = Array.from({ length: maxLen }, (_, i) => {
    const point = { session: i + 1 }
    categories.forEach((cat) => {
      if (trends[cat][i]) point[cat] = trends[cat][i].score
    })
    return point
  })
 
  const colors = { technical: '#D9A441', communication: '#4FA3A3' }
 
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-mono text-2xl text-ink tracking-tight">Progress</h1>
        <p className="text-muted text-sm mt-1">Your interview scores over time, by category.</p>
      </header>
      <section className="bg-surface border border-border rounded-lg p-5">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#2A3350" strokeDasharray="3 3" />
            <XAxis dataKey="session" stroke="#8B92A8" fontSize={12} label={{ value: 'Session #', position: 'insideBottom', offset: -5, fill: '#8B92A8', fontSize: 11 }} />
            <YAxis stroke="#8B92A8" fontSize={12} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#171E2E', border: '1px solid #2A3350', borderRadius: 6 }} labelStyle={{ color: '#E8E6DF' }} />
            <Legend />
            {categories.map((cat) => (
              <Line
                key={cat}
                type="monotone"
                dataKey={cat}
                stroke={colors[cat] || '#8B92A8'}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}
 
function MatchRing({ score }) {
  const pct = score != null ? Math.round(score * 100) : null
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const offset = pct != null ? circumference * (1 - pct / 100) : circumference
 
  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#2A3350" strokeWidth="5" />
        {pct != null && (
          <circle
            cx="32" cy="32" r={radius} fill="none"
            stroke="#D9A441" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        )}
      </svg>
      <span className="absolute font-mono text-sm text-ink">
        {pct != null ? `${pct}%` : '—'}
      </span>
    </div>
  )
}
 
function Sidebar({ page, onNavigate }) {
  const items = [
    { label: 'Job Matches', key: 'jobs', enabled: true },
    { label: 'Resumes', key: 'resumes', enabled: false },
    { label: 'Interview Practice', key: 'interview', enabled: false },
    { label: 'Progress', key: 'progress', enabled: true },
  ]
  return (
    <aside className="w-56 shrink-0 border-r border-border px-5 py-6 hidden md:block">
      <div className="font-mono text-accent text-sm tracking-wide mb-8">CAREER COPILOT</div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <div
            key={item.key}
            onClick={() => item.enabled && onNavigate(item.key)}
            className={`px-3 py-2 rounded text-sm font-sans ${
              page === item.key ? 'bg-surface text-ink' : 'text-muted'
            } ${item.enabled ? 'cursor-pointer hover:text-ink' : 'cursor-not-allowed opacity-50'}`}
          >
            {item.label}
          </div>
        ))}
      </nav>
    </aside>
  )
}
 
function ResumeUpload({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
 
  async function upload() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/resume/upload`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      setResult(data)
      onUploaded(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <section className="bg-surface border border-border rounded-lg p-5 mb-6">
      <h2 className="font-mono text-sm text-ink mb-3">Upload your resume</h2>
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm text-muted file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-bg file:text-ink file:text-sm"
        />
        <button
          onClick={upload}
          disabled={loading || !file}
          className="bg-accent text-bg font-mono text-xs px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {result && (
        <p className="text-secondary text-sm mt-3">
          Saved as resume id <strong>{result.resume_id}</strong> — it's been filled into the search form below.
        </p>
      )}
      {error && <p className="text-secondary text-sm mt-3">{error}</p>}
    </section>
  )
}
 
export default function App() {
  const [page, setPage] = useState('jobs')
  const [form, setForm] = useState({
    profile_text: 'Fresher aspiring AI/ML engineer skilled in Python, PyTorch, LangChain, FastAPI, Docker, MySQL',
    skills: 'Python, PyTorch, LangChain, FastAPI, Docker, MySQL',
    query: 'python developer',
    resume_id: 1,
    location: '',
    workMode: 'any',
  })
  const [loading, setLoading] = useState(false)
  const [match, setMatch] = useState(null) // { thread_id, job_id, job_title, company, apply_url, message }
  const [tailorResult, setTailorResult] = useState(null)
  const [decisionResult, setDecisionResult] = useState(null)
  const [error, setError] = useState(null)
 
  async function runSearch() {
    setLoading(true)
    setError(null)
    setMatch(null)
    setTailorResult(null)
    setDecisionResult(null)
 
    let finalQuery = form.query
    if (form.location.trim()) finalQuery += ` in ${form.location.trim()}`
    if (form.workMode === 'remote') finalQuery += ' remote'
    if (form.workMode === 'onsite') finalQuery += ' onsite'
 
    try {
      const res = await fetch(`${API_BASE}/run-job-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_text: form.profile_text,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          query: finalQuery,
          resume_id: Number(form.resume_id),
        }),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setMatch(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
 
  async function tailorResume() {
    if (!match) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/resume/tailor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_id: Number(form.resume_id), job_id: match.job_id }),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setTailorResult(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
 
  async function decide(decision) {
    if (!match) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/application/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: match.thread_id, decision }),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      setDecisionResult({ ...data, decision })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <div className="min-h-screen flex font-sans">
      <Sidebar page={page} onNavigate={setPage} />
 
      <main className="flex-1 px-6 md:px-10 py-8 max-w-3xl">
        {page === 'progress' ? (
          <ProgressPage />
        ) : (
          <>
        <header className="mb-8">
          <h1 className="font-mono text-2xl text-ink tracking-tight">Job Matches</h1>
          <p className="text-muted text-sm mt-1">
            Find the best-fit role for your profile, tailor your resume if you want to, decide.
          </p>
        </header>
 
        <ResumeUpload
          onUploaded={(data) =>
            setForm((f) => ({
              ...f,
              resume_id: data.resume_id,
              skills: data.profile.skills.join(', '),
              profile_text: data.profile.summary,
            }))
          }
        />
 
        <section className="bg-surface border border-border rounded-lg p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm text-muted">
              Search query
              <input
                className="bg-bg border border-border rounded px-3 py-2 text-ink font-sans focus:outline-none focus:ring-1 focus:ring-accent"
                value={form.query}
                onChange={(e) => setForm({ ...form, query: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted">
              Resume id
              <input
                className="bg-bg border border-border rounded px-3 py-2 text-ink font-sans focus:outline-none focus:ring-1 focus:ring-accent"
                value={form.resume_id}
                onChange={(e) => setForm({ ...form, resume_id: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted">
              Location (city, state — optional)
              <input
                placeholder="e.g. Bangalore, Karnataka"
                className="bg-bg border border-border rounded px-3 py-2 text-ink font-sans focus:outline-none focus:ring-1 focus:ring-accent"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted">
              Work mode
              <select
                className="bg-bg border border-border rounded px-3 py-2 text-ink font-sans focus:outline-none focus:ring-1 focus:ring-accent"
                value={form.workMode}
                onChange={(e) => setForm({ ...form, workMode: e.target.value })}
              >
                <option value="any">Any</option>
                <option value="remote">Remote / work from home</option>
                <option value="onsite">Onsite / in office</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted sm:col-span-2">
              Skills (comma separated)
              <input
                className="bg-bg border border-border rounded px-3 py-2 text-ink font-sans focus:outline-none focus:ring-1 focus:ring-accent"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted sm:col-span-2">
              Profile summary
              <textarea
                rows={2}
                className="bg-bg border border-border rounded px-3 py-2 text-ink font-sans focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                value={form.profile_text}
                onChange={(e) => setForm({ ...form, profile_text: e.target.value })}
              />
            </label>
          </div>
          <button
            onClick={runSearch}
            disabled={loading}
            className="mt-4 bg-accent text-bg font-mono text-sm px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Find best match'}
          </button>
        </section>
 
        {error && (
          <div className="border border-secondary/40 bg-secondary/10 text-secondary text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}
 
        {match && !decisionResult && (
          <section className="bg-surface border border-border rounded-lg p-5 mb-6">
            <div className="text-xs font-mono text-muted mb-1">JOB #{match.job_id}</div>
            <h3 className="text-ink text-base font-medium mb-1">{match.job_title}</h3>
            <p className="text-muted text-sm mb-3">{match.company}</p>
            {match.apply_url && (
              <a
                href={match.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary text-sm underline hover:text-ink inline-block mb-4"
              >
                View original posting →
              </a>
            )}
 
            {!tailorResult && (
              <div className="mb-4">
                <button
                  onClick={tailorResume}
                  disabled={loading}
                  className="border border-border text-ink font-mono text-xs px-4 py-2 rounded hover:border-accent disabled:opacity-50"
                >
                  {loading ? 'Tailoring…' : 'Tailor my resume for this job'}
                </button>
              </div>
            )}
 
            {tailorResult && (
              <div className="bg-bg border border-border rounded p-4 mb-4">
                <div className="text-xs font-mono text-muted mb-1">
                  TAILORED RESUME — id {tailorResult.new_resume_id}
                </div>
                <p className="text-ink text-sm leading-relaxed">{tailorResult.tailored_profile.summary}</p>
              </div>
            )}
 
            <div className="flex gap-3">
              <button
                onClick={() => decide('approve')}
                disabled={loading}
                className="bg-accent text-bg font-mono text-xs px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => decide('reject')}
                disabled={loading}
                className="border border-border text-muted font-mono text-xs px-4 py-2 rounded hover:text-ink hover:border-secondary disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </section>
        )}
 
        {decisionResult && (
          <>
            <section className="bg-surface border border-border rounded-lg p-5 mb-6">
              <div className="font-mono text-sm text-accent mb-1">
                {decisionResult.decision === 'approve' ? 'Approved' : 'Rejected'}
              </div>
              <p className="text-muted text-sm">
                Application for job #{match.job_id} marked as {decisionResult.decision}d.
              </p>
            </section>
 
            {decisionResult.decision === 'approve' && <InterviewPractice jobId={match.job_id} />}
          </>
        )}
          </>
        )}
      </main>
    </div>
  )
}
 
function InterviewPractice({ jobId }) {
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
 
  async function getQuestion() {
    setLoading(true)
    setError(null)
    setFeedback(null)
    setAnswer('')
    try {
      const res = await fetch(`${API_BASE}/interview/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setQuestion(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
 
  async function submitAnswer() {
    if (!question || !answer.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/interview/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, question: question.question, user_answer: answer }),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setFeedback(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <section className="bg-surface border border-border rounded-lg p-5">
      <h2 className="font-mono text-sm text-ink mb-3">Interview Practice</h2>
 
      {!question && (
        <button
          onClick={getQuestion}
          disabled={loading}
          className="bg-accent text-bg font-mono text-xs px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Generating…' : 'Get a question for this role'}
        </button>
      )}
 
      {question && !feedback && (
        <div>
          <p className="text-ink text-sm leading-relaxed mb-3">{question.question}</p>
          <textarea
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer…"
            className="w-full bg-bg border border-border rounded px-3 py-2 text-ink font-sans text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none mb-3"
          />
          <button
            onClick={submitAnswer}
            disabled={loading || !answer.trim()}
            className="bg-accent text-bg font-mono text-xs px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Scoring…' : 'Submit answer'}
          </button>
        </div>
      )}
 
      {feedback && (
        <div>
          <div className="flex gap-6 mb-4">
            <div className="flex flex-col items-center gap-1">
              <MatchRing score={feedback.technical_score / 100} />
              <span className="text-xs text-muted font-mono">Technical</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MatchRing score={feedback.communication_score / 100} />
              <span className="text-xs text-muted font-mono">Communication</span>
            </div>
          </div>
          <p className="text-ink text-sm leading-relaxed whitespace-pre-line">{feedback.feedback}</p>
        </div>
      )}
 
      {error && <p className="text-secondary text-sm mt-3">{error}</p>}
    </section>
  )
}