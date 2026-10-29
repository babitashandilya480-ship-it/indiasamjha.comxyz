import React, { useState } from 'react';
import {
  Image as ImageIcon,
  ScanEye,
  Video,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const MultimodalStudioView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate_image' | 'analyze_image' | 'analyze_video'>(
    'generate_image'
  );

  // 1. Image Generation State (gemini-3-pro-image-preview with 1K, 2K, 4K)
  const [imgPrompt, setImgPrompt] = useState(
    'Architectural evening view of a serene knowledge pavilion in Bengaluru with warm glowing amber lanterns and lush courtyard reflection, photorealistic editorial photography'
  );
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '3:4' | '9:16'>('16:9');
  const [genLoading, setGenLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // 2. Image Understanding State (gemini-4-argon)
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [visionPrompt, setVisionPrompt] = useState(
    'Analyze this diagram or photo thoroughly: summarize the key architecture components, text labels, and workflow steps.'
  );
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState<string | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);

  // 3. Video Understanding State (gemini-4-argon)
  const [selectedVideoBase64, setSelectedVideoBase64] = useState<string | null>(null);
  const [selectedVideoMime, setSelectedVideoMime] = useState<string>('video/mp4');
  const [selectedVideoName, setSelectedVideoName] = useState<string>('');
  const [videoPrompt, setVideoPrompt] = useState(
    'Analyze this video for key events, visual progression, spoken or on-screen concepts, and structured action takeaways.'
  );
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgPrompt.trim()) return;
    setGenLoading(true);
    setGenError(null);
    try {
      const res = await fetch('/api/multimodal/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imgPrompt,
          imageSize,
          aspectRatio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Image generation failed');
      }
      setGeneratedImageUrl(data.imageUrl);
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenLoading(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageName(file.name);
    setSelectedImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadBuiltInSampleImage = async () => {
    try {
      setVisionError(null);
      const response = await fetch(
        '/assets/aistudio/WhatsApp_Image_2026-10-28_at_5.51.28_AM_e3cdd6f5.jpeg'
      );
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedImageBase64(reader.result);
          setSelectedImageMime('image/jpeg');
          setSelectedImageName('Samjha_SCEM_SCCL_Architecture.jpeg');
        }
      };
      reader.readAsDataURL(blob);
    } catch (err: unknown) {
      setVisionError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleAnalyzeImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImageBase64) {
      setVisionError('Please upload a photo or load the project diagram first.');
      return;
    }
    setVisionLoading(true);
    setVisionError(null);
    try {
      const res = await fetch('/api/multimodal/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: selectedImageBase64,
          mimeType: selectedImageMime,
          prompt: visionPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Image analysis failed');
      }
      setVisionResult(data.analysis);
    } catch (err: unknown) {
      setVisionError(err instanceof Error ? err.message : String(err));
    } finally {
      setVisionLoading(false);
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 18 * 1024 * 1024) {
      setVideoError('Please select a video clip under 18 MB for inline analysis.');
      return;
    }
    setVideoError(null);
    setSelectedVideoName(file.name);
    setSelectedVideoMime(file.type || 'video/mp4');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedVideoBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideoBase64) {
      setVideoError('Please upload an MP4 or WebM video file first.');
      return;
    }
    setVideoLoading(true);
    setVideoError(null);
    try {
      const res = await fetch('/api/multimodal/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: selectedVideoBase64,
          mimeType: selectedVideoMime,
          prompt: videoPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Video analysis failed');
      }
      setVideoResult(data.analysis);
    } catch (err: unknown) {
      setVideoError(err instanceof Error ? err.message : String(err));
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Multimodal Intelligence Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate 1K/2K/4K visuals with <code className="text-purple-300">gemini-3-pro-image-preview</code> and analyze photos & videos with <code className="text-purple-300">gemini-4-argon</code>.
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#1E293B] border border-slate-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('generate_image')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'generate_image'
              ? 'bg-[#7C3AED] text-white'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> Generate Image (1K / 2K / 4K)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analyze_image')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analyze_image'
              ? 'bg-[#7C3AED] text-white'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <ScanEye className="w-3.5 h-3.5" /> Analyze Photo (Gemini 4 Argon)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analyze_video')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analyze_video'
              ? 'bg-[#7C3AED] text-white'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Video className="w-3.5 h-3.5" /> Analyze Video (Gemini 4 Argon)
        </button>
      </div>

      {/* 1. Generate High-Quality Images */}
      {activeTab === 'generate_image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleGenerateImage}
            className="lg:col-span-5 bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                High-Resolution Image Synthesis
              </h2>
              <span className="text-xs font-mono text-purple-300">
                gemini-3-pro-image-preview
              </span>
            </div>

            <div>
              <label htmlFor="img-gen-prompt" className="block text-xs font-medium text-slate-300 mb-1.5">
                Visual Description Prompt
              </label>
              <textarea
                id="img-gen-prompt"
                rows={4}
                value={imgPrompt}
                onChange={(e) => setImgPrompt(e.target.value)}
                placeholder="Describe subject, lighting, environment, and composition..."
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-medium text-slate-300 mb-1.5">
                  Image Resolution Size
                </span>
                <div className="grid grid-cols-3 gap-1.5 bg-[#0F172A] p-1 rounded-lg border border-slate-800">
                  {(['1K', '2K', '4K'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setImageSize(sz)}
                      className={`py-1.5 text-xs font-mono font-semibold rounded-md transition-colors ${
                        imageSize === sz
                          ? 'bg-[#7C3AED] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="img-aspect-ratio" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Aspect Ratio
                </label>
                <select
                  id="img-aspect-ratio"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="16:9">16:9 Landscape</option>
                  <option value="1:1">1:1 Square</option>
                  <option value="4:3">4:3 Editorial</option>
                  <option value="3:4">3:4 Portrait</option>
                  <option value="9:16">9:16 Vertical</option>
                </select>
              </div>
            </div>

            {genError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-200">
                {genError}
              </div>
            )}

            <button
              type="submit"
              disabled={genLoading}
              className="w-full py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {genLoading ? `Generating ${imageSize} Image...` : `Generate ${imageSize} Image`}
            </button>
          </form>

          <div className="lg:col-span-7 bg-[#1E293B] border border-slate-800 rounded-xl p-5 min-h-[360px] flex flex-col justify-center items-center">
            {generatedImageUrl ? (
              <div className="w-full space-y-3">
                <img
                  src={generatedImageUrl}
                  alt={imgPrompt}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[480px] object-contain rounded-lg border border-slate-800 bg-[#0F172A]"
                />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Model: gemini-3-pro-image-preview · Resolution: {imageSize}</span>
                  <a
                    href={generatedImageUrl}
                    download={`samjha_${imageSize}.png`}
                    className="text-purple-300 hover:text-white underline"
                  >
                    Download Image
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 max-w-md py-12">
                <ImageIcon className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-sm font-medium text-slate-300">
                  Ready to Generate High-Resolution Imagery
                </p>
                <p className="text-xs text-slate-400">
                  Select 1K, 2K, or 4K resolution on the left and submit your prompt to synthesize visuals via server-side Gemini 3 Pro Image Preview.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Analyze Uploaded Photos (gemini-4-argon) */}
      {activeTab === 'analyze_image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleAnalyzeImage}
            className="lg:col-span-5 bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Photo & Diagram Understanding</h2>
              <span className="text-xs font-mono text-purple-300">gemini-4-argon</span>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="photo-upload-input"
                className="block text-xs font-medium text-slate-300"
              >
                Upload Photo (PNG, JPEG, WebP)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="photo-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="flex-1 text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#7C3AED] file:text-white hover:file:bg-[#6D28D9]"
                />
                <button
                  type="button"
                  onClick={handleLoadBuiltInSampleImage}
                  className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs whitespace-nowrap"
                >
                  Load Architecture Diagram
                </button>
              </div>
            </div>

            {selectedImageBase64 && (
              <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-2">
                <img
                  src={selectedImageBase64}
                  alt={selectedImageName || 'Selected preview'}
                  referrerPolicy="no-referrer"
                  className="max-h-44 mx-auto object-contain rounded"
                />
                <p className="text-[11px] text-slate-400 text-center mt-1 truncate">
                  {selectedImageName}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="vision-prompt-input" className="block text-xs font-medium text-slate-300 mb-1">
                Analysis Instruction
              </label>
              <textarea
                id="vision-prompt-input"
                rows={3}
                value={visionPrompt}
                onChange={(e) => setVisionPrompt(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            {visionError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-200">
                {visionError}
              </div>
            )}

            <button
              type="submit"
              disabled={visionLoading}
              className="w-full py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {visionLoading ? 'Analyzing with Gemini 4 Argon...' : 'Analyze Image'}
            </button>
          </form>

          <div className="lg:col-span-7 bg-[#1E293B] border border-slate-800 rounded-xl p-5 min-h-[340px]">
            <h3 className="text-sm font-semibold text-white mb-3">
              Gemini 4 Argon Visual Analysis Output
            </h3>
            {visionResult ? (
              <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {visionResult}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-12 text-center">
                Upload an image or click &ldquo;Load Architecture Diagram&rdquo; and run analysis to inspect Gemini 4 Argon&apos;s multimodal reasoning output.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Analyze Video Content (gemini-4-argon) */}
      {activeTab === 'analyze_video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleAnalyzeVideo}
            className="lg:col-span-5 bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Video Content Analysis</h2>
              <span className="text-xs font-mono text-purple-300">gemini-4-argon</span>
            </div>

            <div>
              <label
                htmlFor="video-upload-input"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Upload Video File (MP4, WebM, MOV)
              </label>
              <input
                id="video-upload-input"
                type="file"
                accept="video/*"
                onChange={handleVideoFileUpload}
                className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#7C3AED] file:text-white hover:file:bg-[#6D28D9]"
              />
              {selectedVideoName && (
                <p className="text-xs text-emerald-300 mt-1.5">Loaded: {selectedVideoName}</p>
              )}
            </div>

            <div>
              <label htmlFor="video-prompt-input" className="block text-xs font-medium text-slate-300 mb-1">
                Video Analysis Prompt
              </label>
              <textarea
                id="video-prompt-input"
                rows={3}
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            {videoError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-200">
                {videoError}
              </div>
            )}

            <button
              type="submit"
              disabled={videoLoading}
              className="w-full py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {videoLoading ? 'Analyzing Video with Gemini 4 Argon...' : 'Analyze Video'}
            </button>
          </form>

          <div className="lg:col-span-7 bg-[#1E293B] border border-slate-800 rounded-xl p-5 min-h-[340px]">
            <h3 className="text-sm font-semibold text-white mb-3">
              Gemini 4 Argon Video Understanding Report
            </h3>
            {videoResult ? (
              <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {videoResult}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-12 text-center">
                Upload a video clip and submit your query to extract key timeline events, visual concepts, and summaries using Gemini 4 Argon.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
