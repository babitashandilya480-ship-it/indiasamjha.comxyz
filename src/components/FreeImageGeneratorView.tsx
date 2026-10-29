import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download, Wand2, RefreshCw } from 'lucide-react';

interface GeneratedImageItem {
  id: string;
  prompt: string;
  imageUrl: string;
  aspectRatio: '1:1' | '16:9' | '4:3' | '3:4' | '9:16';
  timestamp: string;
}

const SAMPLE_IMAGE_PROMPTS = [
  'A futuristic eco-friendly Indian city at sunset with solar monorails and lush rooftop gardens, cinematic digital art',
  'Modern Indian farmer in a golden wheat field using a sleek Kisan Sathi tablet with holographic weather data, warm sunlight',
  'Cozy student study desk in Chandigarh overlooking the hills at twilight, warm lamp light, coding laptop, lo-fi aesthetic',
  'Dynamic taekwondo black belt athlete performing a high kick in a minimalist sunlit dojo, dramatic lighting',
];

export const FreeImageGeneratorView: React.FC = () => {
  const [prompt, setPrompt] = useState(SAMPLE_IMAGE_PROMPTS[0]);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '3:4' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GeneratedImageItem[]>([]);

  const handleGenerate = async (customPrompt?: string) => {
    const targetPrompt = (customPrompt ?? prompt).trim();
    if (!targetPrompt || isGenerating) return;
    if (customPrompt) setPrompt(customPrompt);

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/multimodal/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: targetPrompt,
          aspectRatio,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not generate image.');
      }

      const newItem: GeneratedImageItem = {
        id: `img_${Date.now().toString(36)}`,
        prompt: targetPrompt,
        imageUrl: data.imageUrl,
        aspectRatio,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setGallery((prev) => [newItem, ...prev]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const activeImage = gallery[0] || null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#1E293B] via-[#1E293B] to-[#EC4899]/15 border border-slate-800 rounded-2xl p-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-pink-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Samjha Nano Vision · Free Text-to-Image Studio</span>
          </div>
          <span className="text-xs font-mono text-[#10B981]">Free &amp; Instant Generation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Turn Your Ideas Into Visuals
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Describe any scene, illustration, concept art, or poster in English, Hindi, or Hinglish.
          Samjha Nano Vision generates high-clarity images for free.
        </p>
      </div>

      {/* Main 2-Column Creator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Controls */}
        <div className="lg:col-span-5 bg-[#1E293B] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="samjha-img-prompt" className="text-xs font-semibold text-white block">
              Describe Your Image
            </label>
            <textarea
              id="samjha-img-prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A futuristic Indian smart village with solar panels and green farms..."
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          {/* Aspect Ratio Picker */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300 block">Aspect Ratio</span>
            <div className="grid grid-cols-5 gap-2">
              {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 px-2 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                      : 'bg-[#0F172A] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F59E0B] hover:opacity-95 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating with Samjha Nano Vision...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Free Image</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-200">
              {error}
            </div>
          )}

          {/* Quick Starter Prompts */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">
              Try a 1-Click Inspiration Prompt:
            </span>
            <div className="space-y-1.5">
              {SAMPLE_IMAGE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleGenerate(sample)}
                  disabled={isGenerating}
                  className="w-full text-left p-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors line-clamp-2"
                >
                  &ldquo;{sample}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Canvas Preview */}
        <div className="lg:col-span-7 bg-[#1E293B] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#EC4899]" />
              <span>Generated Canvas</span>
            </h2>
            {activeImage && (
              <a
                href={activeImage.imageUrl}
                download={`samjha-ai-${activeImage.id}.png`}
                className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-purple-300 inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </a>
            )}
          </div>

          {activeImage ? (
            <div className="space-y-3">
              <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center p-2">
                <img
                  src={activeImage.imageUrl}
                  alt={activeImage.prompt}
                  className="max-h-[420px] w-auto rounded-lg object-contain"
                />
              </div>
              <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Samjha Nano Vision · {activeImage.aspectRatio}</span>
                  <span className="font-mono">{activeImage.timestamp}</span>
                </div>
                <p className="text-slate-200">{activeImage.prompt}</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl min-h-[340px] flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1E293B] border border-slate-700 flex items-center justify-center text-pink-400">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-bold text-white">Ready to Create</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click <strong className="text-slate-200">Generate Free Image</strong> on the left
                  or ask for an image directly inside the main Chat!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
