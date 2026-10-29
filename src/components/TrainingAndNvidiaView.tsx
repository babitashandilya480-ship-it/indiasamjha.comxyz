import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  XCircle,
  Server,
  ShieldAlert,
  Download,
  Plus,
  Activity,
  BarChart3,
  Cpu,
} from 'lucide-react';
import {
  FeedbackDatasetItem,
  VERIFIED_KNOWLEDGE_BASE,
  BENCHMARK_COMPARISON_ROWS,
  RECOVERY_AUDIT_INVENTORY,
} from '../data/samjhaInventoryData';
import {
  MemoryRecord,
  FIXED_EVALUATION_SUITE,
  SupportedLanguage,
  evaluateLanguageQuality,
} from '../core/samjhaEngine';

interface TrainingAndNvidiaViewProps {
  feedbackItems: FeedbackDatasetItem[];
  onUpdateFeedbackItem: (
    id: string,
    updates: Partial<Pick<FeedbackDatasetItem, 'approvalStatus' | 'consentForTraining' | 'rating'>>
  ) => void;
  onAddFeedbackItem: (item: Omit<FeedbackDatasetItem, 'id' | 'createdAt'>) => void;
  memories: MemoryRecord[];
}

type TrainingSubTab =
  | 'feedback'
  | 'preferences'
  | 'knowledge'
  | 'approved_examples'
  | 'eval_datasets'
  | 'weights_nvidia'
  | 'benchmarks_audit';

export const TrainingAndNvidiaView: React.FC<TrainingAndNvidiaViewProps> = ({
  feedbackItems,
  onUpdateFeedbackItem,
  onAddFeedbackItem,
  memories,
}) => {
  const [subTab, setSubTab] = useState<TrainingSubTab>('feedback');

  // New feedback submission state
  const [promptText, setPromptText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('Hinglish');
  const [category, setCategory] = useState<FeedbackDatasetItem['category']>('language_quality');
  const [rating, setRating] = useState<number>(5);
  const [consentForTraining, setConsentForTraining] = useState<boolean>(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  // NVIDIA NIM Adapter test state
  const [nimLoading, setNimLoading] = useState(false);
  const [nimPrompt, setNimPrompt] = useState('Explain tensor parallelism in 2 sentences.');
  const [nimResult, setNimResult] = useState<{
    available: boolean;
    status: string;
    endpoint: string;
    modelId: string;
    message?: string;
    output?: string;
    error?: unknown;
  } | null>(null);

  const approvedTrainingExamples = feedbackItems.filter(
    (f) => f.consentForTraining && f.approvalStatus === 'approved'
  );

  const handleCreateFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || !responseText.trim()) {
      setFormMsg('Please provide both prompt text and target response text.');
      return;
    }
    const langEval = evaluateLanguageQuality(responseText, language);
    onAddFeedbackItem({
      conversationId: 'conv_welcome',
      promptText: promptText.trim(),
      responseText: responseText.trim(),
      rating,
      category,
      language,
      consentForTraining,
      approvalStatus: 'pending',
    });
    setPromptText('');
    setResponseText('');
    setConsentForTraining(false);
    setFormMsg(
      `Submitted feedback to review queue. Independent Language Quality Score (${language}): ${langEval.score}/100 (${langEval.notes})`
    );
  };

  const handleTestNvidiaNim = async () => {
    setNimLoading(true);
    try {
      const res = await fetch('/api/nvidia/infer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: nimPrompt }),
      });
      const data = await res.json();
      setNimResult(data);
    } catch (err: unknown) {
      setNimResult({
        available: false,
        status: 'CLIENT_FETCH_ERROR',
        endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
        modelId: 'meta/llama-3.1-70b-instruct',
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setNimLoading(false);
    }
  };

  const handleDownloadJsonl = () => {
    const lines = approvedTrainingExamples.map((ex) =>
      JSON.stringify({
        messages: [
          { role: 'system', content: `Samjha AI (${ex.language})` },
          { role: 'user', content: ex.promptText },
          { role: 'assistant', content: ex.responseText },
        ],
        metadata: {
          id: ex.id,
          language: ex.language,
          category: ex.category,
          consentVerified: ex.consentForTraining,
          approvalStatus: ex.approvalStatus,
        },
      })
    );
    const blob = new Blob([lines.join('\n')], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'samjha_approved_training_dataset.jsonl';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Training Mode, Multilingual Quality & NVIDIA Adapter
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Strictly separated governance across User Feedback, Persistent Preferences, Verified Knowledge, Approved Training Examples, Evaluation Datasets, and Model-Weight / NVIDIA NIM Readiness.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-300 shrink-0">
          Approved Dataset Examples: {approvedTrainingExamples.length} / {feedbackItems.length}
        </div>
      </div>

      {/* 7-Way Segmented Filter Bar (Zero-Pill Functional Tabs) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#1E293B] border border-slate-800 rounded-xl">
        {[
          { id: 'feedback', label: '01. User Feedback' },
          { id: 'preferences', label: '02. Persistent Preferences' },
          { id: 'knowledge', label: '03. Verified Knowledge' },
          { id: 'approved_examples', label: '04. Approved Examples' },
          { id: 'eval_datasets', label: '05. Evaluation Datasets' },
          { id: 'weights_nvidia', label: '06. Weights & NVIDIA NIM' },
          { id: 'benchmarks_audit', label: '07. Benchmarks & Audit' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id as TrainingSubTab)}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              subTab === tab.id
                ? 'bg-[#7C3AED] text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: User Feedback Collection & Review */}
      {subTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleCreateFeedback}
            className="lg:col-span-5 bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4"
          >
            <h2 className="text-base font-semibold text-white">
              Submit Candidate Feedback & Language Audit
            </h2>
            <div>
              <label htmlFor="fb-prompt" className="block text-xs font-medium text-slate-300 mb-1">
                User Prompt
              </label>
              <textarea
                id="fb-prompt"
                rows={2}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Enter the prompt to evaluate..."
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label htmlFor="fb-response" className="block text-xs font-medium text-slate-300 mb-1">
                Verified / Improved Target Response
              </label>
              <textarea
                id="fb-response"
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write the ideal response in the target language..."
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label htmlFor="fb-lang" className="block text-xs text-slate-400 mb-1">
                  Language
                </label>
                <select
                  id="fb-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
                >
                  <option value="Hinglish">Hinglish</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>
              <div>
                <label htmlFor="fb-cat" className="block text-xs text-slate-400 mb-1">
                  Category
                </label>
                <select
                  id="fb-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackDatasetItem['category'])}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
                >
                  <option value="language_quality">Language Quality</option>
                  <option value="accuracy">Accuracy</option>
                  <option value="reasoning">Reasoning</option>
                  <option value="tool_routing">Tool Routing</option>
                  <option value="safety">Safety</option>
                </select>
              </div>
              <div>
                <label htmlFor="fb-rating" className="block text-xs text-slate-400 mb-1">
                  Rating (1-5)
                </label>
                <select
                  id="fb-rating"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
                >
                  <option value={5}>5 - Exemplary</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Acceptable</option>
                  <option value={2}>2 - Needs Repair</option>
                  <option value={1}>1 - Defective</option>
                </select>
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={consentForTraining}
                onChange={(e) => setConsentForTraining(e.target.checked)}
                className="mt-0.5 rounded border-slate-600"
              />
              <span>
                I explicitly consent to include this anonymized example in the Samjha AI fine-tuning dataset if approved by a reviewer.
              </span>
            </label>

            {formMsg && (
              <div className="p-2.5 bg-[#0F172A] border border-slate-700 rounded-lg text-xs text-emerald-300">
                {formMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Add to Feedback Review Queue
            </button>
          </form>

          <div className="lg:col-span-7 bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-white">
              Feedback Review & Authorization Queue ({feedbackItems.length})
            </h2>
            <div className="space-y-3">
              {feedbackItems.map((item) => {
                const langAudit = evaluateLanguageQuality(item.responseText, item.language);
                return (
                  <div
                    key={item.id}
                    className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-white font-semibold">{item.language}</span>
                        <span>·</span>
                        <span>{item.category}</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">Rating: {item.rating}/5</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums text-[#10B981]">
                          Lang Score: {langAudit.score}%
                        </span>
                      </div>
                      <span
                        className={`font-mono text-xs ${
                          item.approvalStatus === 'approved'
                            ? 'text-[#10B981]'
                            : item.approvalStatus === 'rejected'
                            ? 'text-rose-400'
                            : 'text-[#F59E0B]'
                        }`}
                      >
                        {item.approvalStatus.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong className="text-white">Prompt:</strong> {item.promptText}
                    </p>
                    <p className="text-xs text-slate-400">
                      <strong className="text-slate-200">Target Response:</strong> {item.responseText}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.consentForTraining}
                          onChange={(e) =>
                            onUpdateFeedbackItem(item.id, {
                              consentForTraining: e.target.checked,
                            })
                          }
                        />
                        <span>Training Consent Granted</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateFeedbackItem(item.id, { approvalStatus: 'approved' })
                          }
                          className="px-3 py-1 bg-emerald-950/70 hover:bg-emerald-900 text-[#10B981] border border-emerald-700 rounded-md text-xs font-medium"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateFeedbackItem(item.id, { approvalStatus: 'rejected' })
                          }
                          className="px-3 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-md text-xs font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Persistent Preferences */}
      {subTab === 'preferences' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">
            02. Persistent User Preferences (Isolated from Model Weights)
          </h2>
          <p className="text-xs text-slate-400">
            Preferences customize response tone and language at inference time via CPM without mutating underlying model weights.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories
              .filter((m) => m.memoryType === 'preference')
              .map((pref) => (
                <div
                  key={pref.id}
                  className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 space-y-1"
                >
                  <div className="text-xs font-semibold text-white">{pref.title}</div>
                  <p className="text-xs text-slate-300">{pref.content}</p>
                  <div className="text-[11px] font-mono text-[#10B981] pt-1">
                    Status: {pref.approved ? 'Active in CPM' : 'Paused'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: Verified Knowledge */}
      {subTab === 'knowledge' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">
            03. Verified Domain Knowledge Base
          </h2>
          <div className="space-y-3">
            {VERIFIED_KNOWLEDGE_BASE.map((vk) => (
              <div
                key={vk.id}
                className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{vk.topic}</span>
                  <span className="text-slate-400">
                    {vk.sourceCitation} · Verified by {vk.verifiedBy}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{vk.statement}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Approved Training Examples */}
      {subTab === 'approved_examples' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">
                04. Approved Fine-Tuning Dataset Examples ({approvedTrainingExamples.length})
              </h2>
              <p className="text-xs text-slate-400">
                Contains only records with both explicit user training consent and reviewer approval.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadJsonl}
              disabled={approvedTrainingExamples.length === 0}
              className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Export Validated JSONL
            </button>
          </div>
          {approvedTrainingExamples.length === 0 ? (
            <div className="p-8 text-center bg-[#0F172A] border border-slate-800 rounded-lg text-xs text-slate-400">
              No examples currently satisfy both Consent = true and Approval = approved. Approve an item in Tab 01 to populate the training dataset.
            </div>
          ) : (
            <div className="space-y-2.5">
              {approvedTrainingExamples.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 space-y-1.5 text-xs"
                >
                  <div className="flex justify-between text-slate-400">
                    <span className="font-mono text-[#10B981]">CONSENT + APPROVED VERIFIED</span>
                    <span>
                      {ex.language} · {ex.category}
                    </span>
                  </div>
                  <p className="text-white font-medium">Q: {ex.promptText}</p>
                  <p className="text-slate-300">A: {ex.responseText}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Evaluation Datasets */}
      {subTab === 'eval_datasets' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">
            05. Fixed Evaluation Dataset (Held-Out from Training)
          </h2>
          <p className="text-xs text-slate-400">
            Held-out benchmark prompts used to compare prompt candidates and model routing before deployment.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Benchmark Case</th>
                  <th className="py-2 pr-4">Mode / Language</th>
                  <th className="py-2 pr-4">Expected Target Model</th>
                  <th className="py-2">Expected SCCL Tool</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {FIXED_EVALUATION_SUITE.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-4 font-mono text-slate-400">{c.id}</td>
                    <td className="py-2.5 pr-4 text-white font-medium">{c.name}</td>
                    <td className="py-2.5 pr-4 text-slate-300">
                      {c.mode} · {c.language}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-purple-300">{c.expectedModel}</td>
                    <td className="py-2.5 font-mono text-amber-300">{c.expectedTool}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Model-Weight Updates & NVIDIA NIM / NeMo Environment (Area 9) */}
      {subTab === 'weights_nvidia' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                NVIDIA NIM Server-Side Inference Adapter
              </h2>
              <span className="text-xs font-mono text-amber-400">Isolated Adapter</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tests the isolated <code className="text-purple-300">/api/nvidia/infer</code> endpoint. Keeps verified Gemini production routing as default unless an authorized NVIDIA NIM endpoint is configured and passes the evaluation suite.
            </p>
            <div className="space-y-2">
              <label htmlFor="nim-test-prompt" className="block text-xs text-slate-400">
                Adapter Verification Prompt
              </label>
              <div className="flex gap-2">
                <input
                  id="nim-test-prompt"
                  type="text"
                  value={nimPrompt}
                  onChange={(e) => setNimPrompt(e.target.value)}
                  className="flex-1 bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleTestNvidiaNim}
                  disabled={nimLoading}
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium rounded-lg whitespace-nowrap shrink-0"
                >
                  {nimLoading ? 'Testing...' : 'Probe NIM Adapter'}
                </button>
              </div>
            </div>

            {nimResult && (
              <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Adapter Status:</span>
                  <span
                    className={`font-mono font-semibold ${
                      nimResult.available ? 'text-[#10B981]' : 'text-[#F59E0B]'
                    }`}
                  >
                    {nimResult.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Configured Model:</span>
                  <span className="font-mono text-white">{nimResult.modelId}</span>
                </div>
                <p className="text-slate-300 pt-1">
                  {nimResult.message || nimResult.output || JSON.stringify(nimResult.error)}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-white">
              NVIDIA NeMo & Compute Hardware Readiness Check
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3 flex justify-between">
                <span className="text-slate-400">Local GPU / CUDA Drivers:</span>
                <span className="font-mono text-amber-400">Not Detected (CPU Container)</span>
              </div>
              <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3 flex justify-between">
                <span className="text-slate-400">Model Weight Fine-Tuning Job:</span>
                <span className="font-mono text-amber-400">
                  Blocked by Missing GPU Compute
                </span>
              </div>
              <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3 flex justify-between">
                <span className="text-slate-400">Active Production Inference:</span>
                <span className="font-mono text-[#10B981]">
                  Gemini 4 Argon + 3.8 Flash + 3.1 Flash-Lite
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed pt-1">
                Per Area 9 & Area 14 directives: No paid cloud GPU jobs or unapproved compute services are activated. While local GPU weight updates are unavailable in this container, JSONL dataset preparation, prompt optimization, SCEM/SCCL verification, and evaluation suites are active.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Benchmark Comparison & Area 1-15 Audit Inventory */}
      {subTab === 'benchmarks_audit' && (
        <div className="space-y-6">
          {/* Benchmark Table */}
          <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Samjha AI Capability Benchmark Matrix
                </h2>
                <p className="text-xs text-slate-400">
                  Note: Reference and target scores are illustrative engineering estimates from the project specification; verified current scores reflect measured internal SCEM/VEM test suite performance.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-4">Capability</th>
                    <th className="py-2 pr-4 text-right">Reference (Projected)*</th>
                    <th className="py-2 pr-4 text-right">Prior Baseline*</th>
                    <th className="py-2 pr-4 text-right text-[#10B981]">Samjha Repaired</th>
                    <th className="py-2 text-right text-[#EC4899]">Future Target*</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 tabular-nums">
                  {BENCHMARK_COMPARISON_ROWS.map((row) => (
                    <tr key={row.rank} className="hover:bg-slate-800/30">
                      <td className="py-2 pr-3 font-mono text-slate-400">{row.rank}</td>
                      <td className="py-2 pr-4 font-medium text-white">{row.capability}</td>
                      <td className="py-2 pr-4 text-right font-mono text-sky-400">
                        {row.projectedReference.toFixed(1)}
                      </td>
                      <td className="py-2 pr-4 text-right font-mono text-slate-400">
                        {row.samjhaBaseline.toFixed(1)}
                      </td>
                      <td className="py-2 pr-4 text-right font-mono font-semibold text-[#10B981]">
                        {row.samjhaVerifiedCurrent.toFixed(1)}
                      </td>
                      <td className="py-2 text-right font-mono text-[#EC4899]">
                        {row.samjhaTarget.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recovery & Rebuild Audit Table */}
          <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">
              Master Recovery & Rebuild Implementation Inventory (Areas 1–15)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 pr-4">Area / Subsystem</th>
                    <th className="py-2 pr-4">Prior State & Root Cause</th>
                    <th className="py-2 pr-4">Repair & Verification Action</th>
                    <th className="py-2 text-right">Status Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {RECOVERY_AUDIT_INVENTORY.map((entry, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-white">{entry.component}</div>
                        <div className="text-slate-400 mt-0.5">{entry.area}</div>
                      </td>
                      <td className="py-3 pr-4 text-slate-300">
                        <div>{entry.priorState}</div>
                        <div className="text-slate-400 mt-0.5">Cause: {entry.rootCause}</div>
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{entry.repairAction}</td>
                      <td className="py-3 text-right font-mono whitespace-nowrap">
                        <span
                          className={
                            entry.deliveryStatus === 'Implemented and tested'
                              ? 'text-[#10B981]'
                              : 'text-[#F59E0B]'
                          }
                        >
                          {entry.deliveryStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
