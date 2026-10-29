import React, { useState } from 'react';
import {
  MapPin,
  GraduationCap,
  Award,
  Sparkles,
   Sprout,
  Code2,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Camera,
  ArrowRight,
  BarChart3,
  Heart,
  ExternalLink,
} from 'lucide-react';

interface FounderPageViewProps {
  onOpenChat: (initialPrompt?: string) => void;
}

interface PortraitSlot {
  id: string;
  filename: string;
  title: string;
  caption: string;
}

const PORTRAIT_SLOTS: PortraitSlot[] = [
  {
    id: 'founder-1',
    filename: '/founder-photos/founder-1.webp',
    title: 'Founder portrait',
    caption: 'Upload founder-1.webp to public/founder-photos/ to show this portrait.',
  },
  {
    id: 'founder-2',
    filename: '/founder-photos/founder-2.webp',
    title: 'Rooftop portrait',
    caption: 'Upload founder-2.webp to public/founder-photos/ to show this portrait.',
  },
  {
    id: 'founder-3',
    filename: '/founder-photos/founder-3.webp',
    title: 'Golden-hour portrait',
    caption: 'Upload founder-3.webp to public/founder-photos/ to show this portrait.',
  },
  {
    id: 'founder-4',
    filename: '/founder-photos/founder-4.webp',
    title: 'Training portrait',
    caption: 'Upload founder-4.webp to public/founder-photos/ to show this portrait.',
  },
  {
    id: 'founder-5',
    filename: '/founder-photos/founder-5.webp',
    title: 'Fitness and discipline',
    caption: 'Upload founder-5.webp to public/founder-photos/ to show this portrait.',
  },
  {
    id: 'founder-6',
    filename: '/founder-photos/founder-6.webp',
    title: 'Athletic portrait',
    caption: 'Upload founder-6.webp to public/founder-photos/ to show this portrait.',
  },
];

const FAMILY_MEMBERS = [
  { relation: 'Father', name: 'Sandeep Kumar' },
  { relation: 'Mother', name: 'Babita' },
  { relation: 'Bade Papa', name: 'Shivkumar' },
  { relation: 'Badi Mummy', name: 'Rekha' },
  { relation: 'Brother', name: 'Deepanshu Shandilya' },
  { relation: 'Brother', name: 'Abhinav Shandilya' },
  { relation: 'Sister', name: 'Anshul Shandilya' },
];

const QUICK_ANSWERS = [
  {
    question: 'Who is Ayush Vishwakarma?',
    answer:
      'Ayush is a student builder based in Chandigarh, India, originally from Jhinjhana, Shamli, Uttar Pradesh. He is learning to build AI and web products through hands-on projects.',
  },
  {
    question: 'What is Samjha AI?',
    answer:
      'Samjha AI is an evolving India-focused AI assistant project exploring learning, research, writing, and practical productivity workflows.',
  },
  {
    question: 'What is Ayush building besides Samjha AI?',
    answer:
      'He is exploring Kisan Sathi, an agriculture-technology concept aimed at making useful modern-farming information easier for farmers to access.',
  },
  {
    question: 'What is his long-term vision?',
    answer:
      'He hopes to build useful Indian-language AI experiences and digital tools for education and agriculture. These are ongoing ambitions, not claims that every planned capability is already complete.',
  },
  {
    question: 'What are his interests outside technology?',
    answer:
      'Ayush practises taekwondo and reports earning a black belt and two state-level gold medals.',
  },
  {
    question: 'How can people follow his work?',
    answer:
      'Visit the Samjha AI website and follow the project on Instagram at @samjhaoffical. The Instagram account is the project profile, not a personal account for Ayush.',
  },
];

export const FounderPageView: React.FC<FounderPageViewProps> = ({ onOpenChat }) => {
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const [loadedWebp, setLoadedWebp] = useState<Record<string, boolean>>({});
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);

  const handlePhotoUpload = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomPhotos((prev) => ({ ...prev, [slotId]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#7C3AED]/15 border border-slate-800 rounded-2xl p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-purple-300">
              <span>Student builder · India</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">Founder profile · Samjha AI</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-balance">
                I’m Ayush Vishwakarma.
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-purple-300">
                I learn by building.
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              I’m a Class 12 student, early-stage product builder, and taekwondo practitioner. I’m
              learning to turn ideas into useful software, starting with Samjha AI and exploring
              technology that can serve students and farmers in India.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#projects-section"
                className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>Explore my projects</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => onOpenChat()}
                className="px-5 py-2.5 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Discover Samjha AI
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#7C3AED]" />
                Chandigarh, India
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#F59E0B]" />
                Class 12 student
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#10B981]" />
                Taekwondo black belt
              </span>
            </div>
          </div>

          {/* PERSONAL PROFILE CARD */}
          <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              PERSONAL PROFILE
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#EC4899] to-[#F59E0B] flex items-center justify-center text-lg font-bold text-white shrink-0">
                AV
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Ayush Vishwakarma</h2>
                <p className="text-xs text-slate-400 mt-0.5">Curious mind. Builder in progress.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
              <div className="bg-[#1E293B]/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] font-mono text-purple-300">01</div>
                <div className="text-xs font-semibold text-white mt-1">AI</div>
              </div>
              <div className="bg-[#1E293B]/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] font-mono text-[#10B981]">02</div>
                <div className="text-xs font-semibold text-white mt-1">AgriTech</div>
              </div>
              <div className="bg-[#1E293B]/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] font-mono text-[#F59E0B]">03</div>
                <div className="text-xs font-semibold text-white mt-1">Product</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MEET THE FOUNDER — PHOTO COLLECTION */}
      <section className="space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-purple-300">Meet the founder</div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Ayush, beyond the product.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            A small photo collection from everyday life, rooftop portraits, and athletic training.
            Images load from optimized WebP files in the project&apos;s public assets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PORTRAIT_SLOTS.map((slot) => {
            const previewSrc = customPhotos[slot.id];
            const hasWebp = loadedWebp[slot.id];

            return (
              <div
                key={slot.id}
                className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] bg-[#0F172A] flex items-center justify-center p-5 text-center">
                  {/* Attempt to load public/founder-photos/founder-N.webp if present */}
                  {!previewSrc && (
                    <img
                      src={slot.filename}
                      alt={slot.title}
                      onLoad={() => setLoadedWebp((prev) => ({ ...prev, [slot.id]: true }))}
                      onError={() => setLoadedWebp((prev) => ({ ...prev, [slot.id]: false }))}
                      className={`absolute inset-0 w-full h-full object-cover ${
                        hasWebp ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    />
                  )}

                  {previewSrc ? (
                    <img
                      src={previewSrc}
                      alt={slot.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    !hasWebp && (
                      <div className="space-y-2.5 max-w-xs">
                        <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-slate-700 flex items-center justify-center mx-auto text-purple-300">
                          <Camera className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{slot.caption}</p>
                      </div>
                    )
                  )}
                </div>

                <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">{slot.title}</span>
                  <label className="text-[11px] font-medium text-purple-300 hover:text-white cursor-pointer inline-flex items-center gap-1">
                    <span>{previewSrc ? 'Change photo' : 'Preview photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(slot.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. MY STORY — CURIOSITY CAME BEFORE THE CODE */}
      <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1 border-b border-slate-800 pb-4">
          <div className="text-xs font-semibold text-[#F59E0B]">My story</div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Curiosity came before the code.
          </h2>
        </div>

        <div className="space-y-4 text-sm sm:text-[15px] text-slate-200 leading-relaxed max-w-[72ch]">
          <p>
            My name is <strong className="text-white font-semibold">Ayush Vishwakarma</strong>. I am
            16 years old, and my story starts in Jhinjhana, Shamli, Uttar Pradesh. I now live in
            Chandigarh, where I study in Class 12 at DAV Senior Secondary School, Sector 8. I
            previously studied at Silver Bells Public School in Jhinjhana. I have been curious about
            websites, apps, and how technology works since I was around 11.
          </p>

          <p>
            I want to be honest about school: studying has not always been my strongest area, and I
            have not always found traditional learning easy. But I have a strong curiosity about
            creating tools, understanding AI models, and figuring out how software works behind the
            screen. I am not saying school does not matter. I am learning that I need to improve my
            study habits while also making room for the kind of practical learning that keeps me
            engaged.
          </p>

          <p>
            I have tried building websites and AI projects on different platforms, and many attempts
            did not work on the first try. Sometimes a page broke, a model would not respond, or an
            integration needed more setup than I expected. Those failures taught me to debug,
            research, test, and keep improving instead of assuming an idea will work just because it
            sounds exciting.
          </p>

          <p>
            That curiosity led me to build <strong className="text-white font-semibold">Samjha AI</strong>,
            an AI assistant project focused on chat, learning, research, writing, and practical
            digital work. I have also explored model-building and training experiments, and I want
            to understand how AI systems work rather than treating them as magic. Samjha AI is an
            evolving product that uses configured model and tool integrations; I will not pretend
            that it is already a frontier-scale foundation model trained entirely from scratch. My
            longer-term ambition is to develop stronger India-focused AI, including better
            experiences for people who use Hindi and Hinglish.
          </p>

          <p>
            I have also imagined <strong className="text-white font-semibold">Kisan Sathi</strong>, a
            future agriculture-focused product that could help farmers find useful information. It
            remains a developing idea, not a claim that a full agriculture service is already
            launched. I want to build things that solve real problems, test them with users, and
            earn trust before chasing scale or investment.
          </p>

          <p>
            Content creation has been another part of my journey. I tried to create content and grow
            an audience with a limited budget of about{' '}
            <span className="font-mono tabular-nums text-white">₹5,269</span>. I hoped to become a
            stronger creator, but I have not crossed{' '}
            <span className="font-mono tabular-nums text-white">20,000</span> subscribers so far.
            That can be disappointing, yet it has also taught me that growth takes consistency,
            useful ideas, good packaging, and time—not just effort or money. I am still learning.
          </p>

          <p>
            My ambition is to turn Samjha AI into a sustainable, high-impact Indian technology
            startup and, one day, aim for unicorn scale. I know that a unicorn valuation is not a
            plan by itself. First, I need to make the product reliable, solve a real problem,
            understand users, manage costs, and build a team capable of delivering results.
          </p>
        </div>

        {/* Education & Training Callout */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-1.5">
          <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
            Education &amp; training
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Currently studying in Class 12 at DAV Senior Secondary School, Sector 8, Chandigarh.
            Previously studied at Silver Bells Public School, Jhinjhana, Shamli. I also practise
            taekwondo and report earning a black belt and two state-level gold medals.
          </p>
        </div>
      </section>

      {/* 4. THE PEOPLE BEHIND MY JOURNEY — FAMILY SECTION */}
      <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#EC4899] inline-flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" />
            <span>The people behind my journey</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            My family, my foundation.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            There are eight people in my household, including me: my father and mother, my elder
            sister, my elder brother, my younger brother, my father&apos;s brother (my Bade Papa),
            and his wife (my Badi Mummy). They are part of the everyday environment in which I am
            growing up and trying to build something of my own. I am sharing only limited family
            information publicly; private details about them do not belong on an open website.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {FAMILY_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-1"
            >
              <div className="text-[11px] font-medium text-slate-400">{member.relation}</div>
              <div className="text-sm font-semibold text-white">{member.name}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 bg-[#0F172A]/80 border border-slate-800/90 rounded-xl p-4 leading-relaxed">
          This page is intended to explain my public work and background. It does not publish a home
          address, personal contact details, private documents, or other sensitive family
          information. Family members&apos; names are included only where already shared for this
          public biography; they should not be treated as permission to expose their private lives.
        </p>
      </section>

      {/* 5. WHAT I'M WORKING TOWARD — PROJECTS */}
      <section id="projects-section" className="space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#10B981]">What I’m working toward</div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Ideas with a practical purpose.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            These are projects and ambitions at different stages—not claims that every feature is
            already complete.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-purple-300 font-semibold">01</span>
                <span className="text-slate-400">Current focus</span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span>Samjha AI</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                An approachable AI assistant for learning, research, and practical work. My
                long-term goal is to explore useful Indian-language AI experiences.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChat()}
              className="mt-2 text-xs font-semibold text-purple-300 hover:text-white inline-flex items-center gap-1"
            >
              <span>Open Samjha AI Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#10B981] font-semibold">02</span>
                <span className="text-slate-400">Agriculture technology</span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sprout className="w-4 h-4 text-[#10B981]" />
                <span>Kisan Sathi</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                A farmer-first app concept focused on making modern farming information and useful
                digital tools easier to access.
              </p>
            </div>
            <span className="text-[11px] text-slate-400">Concept &amp; exploration stage</span>
          </div>

          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#F59E0B] font-semibold">03</span>
                <span className="text-slate-400">Learning by building</span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#F59E0B]" />
                <span>Web &amp; app development</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Exploring interface design, frontend and backend development, data, and AI
                integrations by building real projects.
              </p>
            </div>
            <span className="text-[11px] text-slate-400">Active daily practice</span>
          </div>
        </div>
      </section>

      {/* 6. QUALITY, MEASURED HONESTLY & HOW I WANT TO WORK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-purple-300">Quality, measured honestly</div>
            <h2 className="text-xl font-bold text-white">A benchmark, not a marketing claim.</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Samjha should be judged on real answers: correctness, instruction-following, language
              quality, latency, and graceful handling of uncertainty.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                num: '01',
                title: 'Answer quality',
                desc: 'Use repeatable prompts with clear expected outcomes; record failures instead of hiding them.',
              },
              {
                num: '02',
                title: 'Speed and reliability',
                desc: 'Measure response time, timeout rate, and provider fallback separately from answer quality.',
              },
              {
                num: '03',
                title: 'Hindi and Hinglish',
                desc: 'Check whether responses stay in the requested language and preserve meaning.',
              },
              {
                num: '04',
                title: 'Honest limitations',
                desc: 'Reward answers that admit uncertainty rather than inventing facts or citations.',
              },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5 space-y-1"
              >
                <div className="text-[11px] font-mono text-purple-300 font-semibold">{item.num}</div>
                <div className="text-xs font-semibold text-white">{item.title}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400">
              No public benchmark score is claimed here. Scores should be published only after the
              same test set has been run, checked, and repeated.
            </p>
            <button
              type="button"
              onClick={() => setShowBenchmarkModal((prev) => !prev)}
              className="px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-purple-300 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>
                {showBenchmarkModal ? 'Hide internal benchmark' : 'Open internal model benchmark'}
              </span>
            </button>
          </div>

          {showBenchmarkModal && (
            <div className="bg-[#0F172A] border border-slate-700 rounded-xl p-4 space-y-2 text-xs">
              <div className="font-semibold text-white">
                Internal Evaluation Checklist (Illustrative Targets Only — Not Verified Public Claims)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-[#1E293B] border border-slate-800">
                  <div className="text-slate-400">Hindi &amp; Hinglish Consistency</div>
                  <div className="font-mono tabular-nums text-white font-semibold mt-0.5">
                    Baseline 7.5 · Target 9.8
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1E293B] border border-slate-800">
                  <div className="text-slate-400">Privacy &amp; Safety Verification</div>
                  <div className="font-mono tabular-nums text-[#10B981] font-semibold mt-0.5">
                    Baseline 8.0 · Target 9.6
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1E293B] border border-slate-800">
                  <div className="text-slate-400">Cost Efficiency &amp; Accessibility</div>
                  <div className="font-mono tabular-nums text-[#F59E0B] font-semibold mt-0.5">
                    Baseline 8.5 · Target 9.8
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="lg:col-span-5 bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#F59E0B]">How I want to work</div>
            <h2 className="text-xl font-bold text-white">Progress over pretending.</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              I want to build with ambition while staying honest about what works, what needs
              improvement, and what I still need to learn.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                num: '01',
                title: 'Build, test, improve',
                desc: 'A working product matters more than a big feature list.',
              },
              {
                num: '02',
                title: 'Make AI useful',
                desc: 'Prioritize clear answers, evidence, privacy, and honest limitations.',
              },
              {
                num: '03',
                title: 'Design for India',
                desc: 'Explore practical, accessible experiences for students and farmers.',
              },
            ].map((w) => (
              <div
                key={w.num}
                className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5 flex items-start gap-3"
              >
                <span className="text-xs font-mono text-[#F59E0B] font-semibold mt-0.5">
                  {w.num}
                </span>
                <div>
                  <div className="text-xs font-semibold text-white">{w.title}</div>
                  <p className="text-xs text-slate-400 mt-0.5">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 7. QUICK ANSWERS FAQ */}
      <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-purple-300">Quick answers</div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            About Ayush Vishwakarma and Samjha AI
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUICK_ANSWERS.map((qa, idx) => (
            <div
              key={idx}
              className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-1.5"
            >
              <h3 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#7C3AED] shrink-0" />
                <span>{qa.question}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">{qa.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. THE NEXT CHAPTER */}
      <section className="bg-gradient-to-r from-[#1E293B] via-[#1E293B] to-[#7C3AED]/20 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-semibold text-[#10B981]">The next chapter</div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Build something useful. Make it reliable. Keep learning.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            My long-term ambition is to create accessible AI experiences for Indian users and
            practical digital tools for education and agriculture. The first milestone is simple:
            build a product that genuinely works for real people.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href="https://instagram.com/samjhaoffical"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5"
          >
            <span>@samjhaoffical</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={() => onOpenChat()}
            className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold transition-colors"
          >
            Chat with Samjha AI
          </button>
        </div>
      </section>
    </div>
  );
};
