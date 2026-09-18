'use client';

import { useMemo, useState } from 'react';

type Result = { ok?: boolean; decision?: string; confidence?: number; reasons?: string[]; actions?: string[]; risk?: string; error?: string };

const starters = [
  'Check my marketplace health',
  'Find anything that looks broken',
  'Optimize the seller experience',
  'Review recent AI decisions',
];

export default function AIAssistant() {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const canRun = command.trim().length > 2 && !busy;
  const summary = useMemo(() => {
    if (!result) return null;
    if (result.error) return { decision: 'error', confidence: '—', error: result.error };
    const decision = result.decision || 'plan';
    const confidence = typeof result.confidence === 'number' ? `${Math.round(result.confidence)}%` : '—';
    return { decision, confidence };
  }, [result]);

  async function run() {
    if (!canRun) return;
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch('/api/admin/ai/command', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ command: command.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      setResult(response.ok ? data : { error: data?.error || 'The AI could not complete that request.' });
    } catch {
      setResult({ error: 'The AI connection failed. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className='ai-assistant card wide'>
      <div className='section-head'>
        <div>
          <div className='eyebrow'>AI ASSISTANT</div>
          <h2>Tell the AI what you need</h2>
          <p className='muted'>Use normal language. The AI checks the system, explains what it found, and chooses a safe next step.</p>
        </div>
        <span className='ai-badge'>Always-on ready</span>
      </div>
      <div className='ai-starters' aria-label='Suggested commands'>
        {starters.map((text) => <button key={text} type='button' className='chip' onClick={() => setCommand(text)}>{text}</button>)}
      </div>
      <textarea className='input ai-input' rows={4} value={command} onChange={(e) => setCommand(e.target.value)} placeholder='Example: Find anything that looks broken and fix only safe problems.' />
      <div className='ai-actions'>
        <button className='primary' disabled={!canRun} onClick={run}>{busy ? 'Checking…' : 'Ask AI'}</button>
        <span className='muted'>No coding required.</span>
      </div>
      {summary && <div className='ai-result'>
        <div className='ai-result-head'><strong>{summary.decision.replaceAll('_', ' ')}</strong><span>Confidence {summary.confidence}</span></div>{summary.error && <p>{summary.error}</p>}
        {result?.risk && <p><b>Risk:</b> {result.risk}</p>}
        {result?.reasons?.length ? <div><b>Why</b><ul>{result.reasons.slice(0, 5).map((x) => <li key={x}>{x}</li>)}</ul></div> : null}
        {result?.actions?.length ? <div><b>Next steps</b><ul>{result.actions.slice(0, 5).map((x) => <li key={x}>{x}</li>)}</ul></div> : null}
      </div>}
    </section>
  );
}
