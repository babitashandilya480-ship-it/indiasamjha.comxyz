import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  GitBranch,
  Layers,
  Terminal,
  Sparkles,
  FileCode2,
} from 'lucide-react';
import {
  parseSCCL,
  validateSCCL,
  compileNaturalLanguageToSCCL,
  serializeSCCL,
  MemoryRecord,
  PromptVersion,
  FIXED_EVALUATION_SUITE,
  evaluatePromptCandidate,
  authorizeAndDeployCandidate,
  rollbackToPromptVersion,
  routeTaskToModel,
  detectPromptInjection,
  SamjhaMode,
  SupportedLanguage,
  SelfImprovementStage,
} from '../core/samjhaEngine';

interface ScemArchitectureStudioProps {
  memories: MemoryRecord[];
  onToggleMemoryApproval: (id: string) => void;
  onAddMemory: (title: string, content: string, memoryType: MemoryRecord['memoryType']) => void;
  promptVersions: PromptVersion[];
  onUpdatePromptVersions: (versions: PromptVersion[]) => void;
  userEmail: string;
}

const DEFAULT_SCCL_SAMPLE = `task ResearchBrief {
  goal: "Create a research brief on AI in education"
  context: "Use reliable and recent sources"

  step search_sources {
    tool: web.search
    input: goal
    requires: none
    expect: source_list
  }
  step analyze_content {
    tool: document.analyze
    input: search_sources.result
    requires: search_sources
    expect: key_points
  }
  step write_report {
    tool: document.compose
    input: analyze_content.result
    requires: search_sources, analyze_content
    expect: report_document
  }

  verify sources_present: every_claim_has_source(write_report.result)
  verify no_hallucination: check_factual_consistency(write_report.result)
  policy permissions: allow([web.search, document.analyze, document.compose])
}`;

const PIPELINE_STAGES: SelfImprovementStage[] = [
  'OBSERVE',
  'DIAGNOSE',
  'PROPOSE',
  'TEST',
  'COMPARE',
  'APPROVE',
  'DEPLOY',
  'MONITOR',
];

export const ScemArchitectureStudio: React.FC<ScemArchitectureStudioProps> = ({
  memories,
  onToggleMemoryApproval,
  onAddMemory,
  promptVersions,
  onUpdatePromptVersions,
  userEmail,
}) => {
  const [scclInput, setScclInput] = useState<string>(DEFAULT_SCCL_SAMPLE);
  const [nlPromptToCompile, setNlPromptToCompile] = useState<string>(
    'Research how AI is used in Indian higher education and create a verified report with citations'
  );
  const [compileMode, setCompileMode] = useState<SamjhaMode>('research');
  const [compileLang, setCompileLang] = useState<SupportedLanguage>('Hinglish');

  // Memory form state
  const [newMemTitle, setNewMemTitle] = useState('');
  const [newMemContent, setNewMemContent] = useState('');
  const [newMemType, setNewMemType] = useState<MemoryRecord['memoryType']>('preference');
  const [memFormError, setMemFormError] = useState<string | null>(null);

  // Self-Improvement Loop state
  const [activeStage, setActiveStage] = useState<SelfImprovementStage>('COMPARE');
  const [evalSuiteResults, setEvalSuiteResults] = useState<
    Array<{
      id: string;
      name: string;
      routedModel: string;
      expectedModel: string;
      passed: boolean;
      notes: string;
    }>
  >([]);
  const [deploymentBanner, setDeploymentBanner] = useState<string | null>(null);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [showDiagramModal, setShowDiagramModal] = useState(false);

  // Parse & validate current SCCL editor content deterministically
  let parsedTask = null;
  let parseError: string | null = null;
  let validationResult = null;

  try {
    parsedTask = parseSCCL(scclInput);
    validationResult = validateSCCL(parsedTask);
  } catch (err: unknown) {
    parseError = err instanceof Error ? err.message : String(err);
  }

  const handleCompileNL = () => {
    if (!nlPromptToCompile.trim()) return;
    const task = compileNaturalLanguageToSCCL(nlPromptToCompile, compileMode, compileLang);
    setScclInput(serializeSCCL(task));
  };

  const handleRunFixedEvalSuite = () => {
    setActiveStage('TEST');
    const results = FIXED_EVALUATION_SUITE.map((testCase) => {
      if (testCase.mustRejectInjection) {
        const inj = detectPromptInjection(testCase.prompt);
        return {
          id: testCase.id,
          name: testCase.name,
          routedModel: 'VEM Security Guard',
          expectedModel: 'Blocked by VEM',
          passed: inj.detected,
          notes: inj.detected
            ? `Blocked injection pattern (${inj.matchedPattern})`
            : 'Failed to detect injection',
        };
      }
      const route = routeTaskToModel(testCase.prompt, testCase.mode);
      const passed = route.modelId === testCase.expectedModel;
      return {
        id: testCase.id,
        name: testCase.name,
        routedModel: route.modelId,
        expectedModel: testCase.expectedModel,
        passed,
        notes: route.rationale,
      };
    });
    setEvalSuiteResults(results);
    setActiveStage('COMPARE');
  };

  const activePrompt = promptVersions.find((v) => v.status === 'active') || promptVersions[0];
  const candidatePrompt =
    promptVersions.find((v) => v.status === 'candidate') || promptVersions[1] || promptVersions[0];
  const comparison = evaluatePromptCandidate(activePrompt, candidatePrompt);

  const handleApproveAndDeploy = (candidateId: string) => {
    try {
      setDeploymentError(null);
      const updated = authorizeAndDeployCandidate(promptVersions, candidateId, userEmail);
      onUpdatePromptVersions(updated);
      setActiveStage('DEPLOY');
      setDeploymentBanner(
        `Authorized & deployed prompt version ${candidateId} by ${userEmail}. Monitoring active.`
      );
    } catch (err: unknown) {
      setDeploymentError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRollback = (targetId: string) => {
    try {
      setDeploymentError(null);
      const updated = rollbackToPromptVersion(promptVersions, targetId, userEmail);
      onUpdatePromptVersions(updated);
      setActiveStage('MONITOR');
      setDeploymentBanner(`Rolled back production prompt to ${targetId}.`);
    } catch (err: unknown) {
      setDeploymentError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemTitle.trim() || !newMemContent.trim()) {
      setMemFormError('Both memory title and content are required.');
      return;
    }
    setMemFormError(null);
    onAddMemory(newMemTitle.trim(), newMemContent.trim(), newMemType);
    setNewMemTitle('');
    setNewMemContent('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            SCEM & SCCL Cognitive Architecture Workbench
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Inspect and verify Samjha Cognitive Control Language (SCCL), Adaptive Planning (APM), Context & Memory (CPM), Verification Engine (VEM), and the Small Brain Self-Improvement Loop.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowDiagramModal((v) => !v)}
          className="px-4 py-2 text-xs font-medium bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          {showDiagramModal ? 'Hide Architecture Blueprint' : 'View Original Blueprint Diagram'}
        </button>
      </div>

      {/* Optional Blueprint Reference Preview */}
      {showDiagramModal && (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Original Samjha AI Framework & SCCL Specification Blueprint
            </h2>
            <span className="text-xs text-slate-400">
              Recovered from /assets/aistudio/WhatsApp_Image_2026-10-28_at_5.51.28_AM_e3cdd6f5.jpeg
            </span>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#0F172A]">
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-10-28_at_5.51.28_AM_e3cdd6f5.jpeg"
              alt="Samjha AI Overall Model Framework and SCCL Grammar Diagram"
              referrerPolicy="no-referrer"
              className="w-full max-h-[520px] object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* 1. Natural Language -> SCCL Compiler & Live Validator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: SCCL Compiler & Source Editor */}
        <div className="lg:col-span-7 bg-[#1E293B] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-[#7C3AED]" />
                <h2 className="text-base font-semibold text-white">
                  01. SCCL Task Compiler & Deterministic Parser
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">Grammar v1.0</span>
            </div>

            {/* Natural language to SCCL converter bar */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3 space-y-2.5">
              <label
                htmlFor="nl-to-sccl-input"
                className="block text-xs font-medium text-slate-300"
              >
                Convert Natural Language Request to Structured SCCL Task
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="nl-to-sccl-input"
                  type="text"
                  value={nlPromptToCompile}
                  onChange={(e) => setNlPromptToCompile(e.target.value)}
                  placeholder="Enter any user request..."
                  className="flex-1 bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
                <select
                  aria-label="Compile Mode"
                  value={compileMode}
                  onChange={(e) => setCompileMode(e.target.value as SamjhaMode)}
                  className="bg-[#1E293B] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200"
                >
                  <option value="research">Research Mode</option>
                  <option value="thinking">Deep Thinking</option>
                  <option value="learning">Learning Mode</option>
                  <option value="standard">Standard Mode</option>
                  <option value="fast">Fast Lite</option>
                </select>
                <select
                  aria-label="Compile Language"
                  value={compileLang}
                  onChange={(e) => setCompileLang(e.target.value as SupportedLanguage)}
                  className="bg-[#1E293B] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200"
                >
                  <option value="Hinglish">Hinglish</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
                <button
                  type="button"
                  onClick={handleCompileNL}
                  className="px-3.5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Compile to SCCL
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="sccl-code-editor"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Interactive SCCL Definition (Edit to test schema & policy validation)
              </label>
              <textarea
                id="sccl-code-editor"
                rows={14}
                value={scclInput}
                onChange={(e) => setScclInput(e.target.value)}
                className="w-full font-mono text-xs bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 text-emerald-300 focus:outline-none focus:border-[#7C3AED] leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400">
              Allowlisted Tools: <code className="text-slate-300">web.search · document.analyze · document.compose · code.inspect · memory.retrieve</code>
            </span>
            <button
              type="button"
              onClick={() => setScclInput(DEFAULT_SCCL_SAMPLE)}
              className="text-slate-300 hover:text-white underline whitespace-nowrap shrink-0"
            >
              Reset Sample
            </button>
          </div>
        </div>

        {/* Right: APM Execution DAG & VEM Validation Output */}
        <div className="lg:col-span-5 bg-[#1E293B] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#10B981]" />
                <h2 className="text-base font-semibold text-white">
                  02. SCEM Execution Plan (APM DAG & VEM)
                </h2>
              </div>
              {validationResult?.valid ? (
                <span className="text-xs font-medium text-[#10B981] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid SCCL Plan
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Validation Error
                </span>
              )}
            </div>

            {parseError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-200">
                {parseError}
              </div>
            )}

            {validationResult && !validationResult.valid && (
              <div className="p-3 bg-amber-950/40 border border-amber-800 rounded-lg space-y-1">
                <p className="text-xs font-semibold text-amber-300">
                  SCEM Policy & Dependency Violations:
                </p>
                <ul className="list-disc list-inside text-xs text-amber-200 space-y-0.5">
                  {validationResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {parsedTask && validationResult && (
              <div className="space-y-3">
                <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Task Identifier:</span>
                    <span className="font-mono text-white font-semibold">{parsedTask.name}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 shrink-0">Goal:</span>
                    <span className="text-slate-200 text-right truncate">{parsedTask.goal}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 shrink-0">Topological Order:</span>
                    <span className="font-mono text-[#10B981] text-right">
                      {validationResult.executionOrder.join(' → ')}
                    </span>
                  </div>
                </div>

                {/* APM Step Cards */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-300">
                    Adaptive Planning Module (APM) Step Graph
                  </p>
                  {parsedTask.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="bg-[#0F172A] border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-[#7C3AED] font-semibold">
                            Step 0{index + 1}: {step.id}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="font-mono text-amber-400">{step.tool}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          requires: {step.requires.length ? step.requires.join(', ') : 'none'} · expect:{' '}
                          {step.expect}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-[#10B981] shrink-0">READY</span>
                    </div>
                  ))}
                </div>

                {/* VEM Verifications & Policy Rules */}
                <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-medium text-slate-300">
                    Verification Engine (VEM) & Policy Gates
                  </p>
                  {parsedTask.verifications.map((v) => (
                    <div key={v.id} className="text-xs font-mono text-slate-300 truncate">
                      verify {v.id}: <span className="text-[#10B981]">{v.expression}</span>
                    </div>
                  ))}
                  {parsedTask.policies.map((p) => (
                    <div key={p.id} className="text-xs font-mono text-slate-300 truncate">
                      policy {p.id}: <span className="text-amber-300">{p.expression}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
            SCEM guarantees deterministic topological execution and blocks tools outside the policy allowlist.
          </div>
        </div>
      </div>

      {/* 2. Controlled Self-Improvement Pipeline (Area 7 & Area 8) */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              03. Samjha Small Brain — Controlled Self-Improvement Pipeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Version-controlled lifecycle: automated candidate evaluation with mandatory human authorization and 1-click rollback.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunFixedEvalSuite}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5" /> Run 5-Case Fixed Evaluation Suite
          </button>
        </div>

        {/* 8-Stage Pipeline Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCurrent = stage === activeStage;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setActiveStage(stage)}
                className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                  isCurrent
                    ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white'
                    : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-[11px] font-mono text-slate-400">0{idx + 1}</div>
                <div className="text-xs font-semibold tracking-tight whitespace-nowrap truncate">
                  {stage}
                </div>
              </button>
            );
          })}
        </div>

        {deploymentBanner && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-700 rounded-lg text-xs text-emerald-200 flex items-center justify-between">
            <span>{deploymentBanner}</span>
            <button
              type="button"
              onClick={() => setDeploymentBanner(null)}
              className="text-emerald-300 hover:text-white underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {deploymentError && (
          <div className="p-3 bg-rose-950/50 border border-rose-700 rounded-lg text-xs text-rose-200">
            {deploymentError}
          </div>
        )}

        {/* Prompt Version Registry & Candidate Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300">
              Prompt Version Registry & Release Gates
            </h3>
            <div className="space-y-2.5">
              {promptVersions.map((ver) => (
                <div
                  key={ver.id}
                  className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-white">
                        {ver.versionNumber} ({ver.id})
                      </span>
                      <span className="text-slate-500">·</span>
                      <span
                        className={
                          ver.status === 'active'
                            ? 'text-[#10B981] font-medium'
                            : ver.status === 'candidate'
                            ? 'text-[#F59E0B] font-medium'
                            : 'text-slate-400'
                        }
                      >
                        {ver.status.toUpperCase()}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="font-mono tabular-nums text-slate-300">
                        Eval: {ver.evalPassRate}%
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="font-mono tabular-nums text-slate-300">
                        Safety: {ver.safetyPassRate}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">{ver.title}</p>
                    <p className="text-xs text-slate-400 truncate">{ver.systemPromptTemplate}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ver.status === 'candidate' && (
                      <button
                        type="button"
                        onClick={() => handleApproveAndDeploy(ver.id)}
                        className="px-3 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-slate-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
                      >
                        Approve & Deploy
                      </button>
                    )}
                    {ver.status === 'archived' && (
                      <button
                        type="button"
                        onClick={() => handleRollback(ver.id)}
                        className="px-3 py-1.5 bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <RotateCcw className="w-3 h-3" /> Rollback
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white">
                Candidate vs. Active Baseline Comparison
              </h3>
              <span className="text-xs font-mono text-[#10B981]">
                Delta: +{comparison.candidateScore - comparison.baselineScore}%
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Baseline ({comparison.baselineId}):</span>
                <span className="font-mono tabular-nums">{comparison.baselineScore}% Pass</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate ({comparison.candidateId}):</span>
                <span className="font-mono tabular-nums text-[#10B981]">
                  {comparison.candidateScore}% Pass
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Zero-Trust Safety Gate:</span>
                <span className="font-mono text-[#10B981]">
                  {comparison.safetyPassed ? 'PASSED (100%)' : 'BLOCKED'}
                </span>
              </div>
            </div>
            {comparison.improvementsFound.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <p className="text-xs font-medium text-slate-300">Verified Improvements:</p>
                {comparison.improvementsFound.map((imp, idx) => (
                  <p key={idx} className="text-xs text-emerald-300">
                    • {imp}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Evaluation Suite Results Table */}
        {evalSuiteResults.length > 0 && (
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h3 className="text-xs font-semibold text-white">
              Fixed Regression Evaluation Suite Results ({evalSuiteResults.filter((r) => r.passed).length}/
              {evalSuiteResults.length} Passed)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 pr-4">Case</th>
                    <th className="py-2 pr-4">Routed Model / Guard</th>
                    <th className="py-2 pr-4">Expected</th>
                    <th className="py-2 pr-4">Rationale</th>
                    <th className="py-2 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {evalSuiteResults.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 pr-4 font-medium text-white">{row.name}</td>
                      <td className="py-2.5 pr-4 font-mono text-purple-300">{row.routedModel}</td>
                      <td className="py-2.5 pr-4 font-mono text-slate-300">{row.expectedModel}</td>
                      <td className="py-2.5 pr-4 text-slate-400">{row.notes}</td>
                      <td className="py-2.5 text-right font-mono">
                        {row.passed ? (
                          <span className="text-[#10B981]">PASS</span>
                        ) : (
                          <span className="text-rose-400">FAIL</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 3. SCEM Context & Memory Module (CPM) Manager */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-white">
              04. Context & Memory Module (CPM) — Authorized Memory Store
            </h2>
            <p className="text-xs text-slate-400">
              Only memories explicitly marked Approved are retrieved into the LLM context window during inference.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-300">
            Approved: {memories.filter((m) => m.approved).length} / {memories.length}
          </span>
        </div>

        <form onSubmit={handleCreateMemory} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#0F172A] p-3.5 rounded-lg border border-slate-800">
          <div className="md:col-span-3">
            <label htmlFor="cpm-mem-title" className="sr-only">Memory Title</label>
            <input
              id="cpm-mem-title"
              type="text"
              value={newMemTitle}
              onChange={(e) => setNewMemTitle(e.target.value)}
              placeholder="Memory title (e.g. Coding Style)"
              className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="md:col-span-5">
            <label htmlFor="cpm-mem-content" className="sr-only">Memory Content</label>
            <input
              id="cpm-mem-content"
              type="text"
              value={newMemContent}
              onChange={(e) => setNewMemContent(e.target.value)}
              placeholder="Authorized context details..."
              className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="md:col-span-2">
            <select
              aria-label="Memory Type"
              value={newMemType}
              onChange={(e) => setNewMemType(e.target.value as MemoryRecord['memoryType'])}
              className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
            >
              <option value="preference">Preference</option>
              <option value="knowledge">Knowledge</option>
              <option value="project_context">Project Context</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full px-3 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Add Memory
            </button>
          </div>
        </form>

        {memFormError && (
          <p className="text-xs text-rose-400">{memFormError}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 flex items-start justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-white">{mem.title}</span>
                  <span className="text-slate-500">·</span>
                  <span className="font-mono text-slate-400">{mem.memoryType}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{mem.content}</p>
              </div>
              <button
                type="button"
                onClick={() => onToggleMemoryApproval(mem.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors shrink-0 ${
                  mem.approved
                    ? 'bg-emerald-950/60 border-emerald-700 text-[#10B981]'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {mem.approved ? 'Approved' : 'Excluded'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
