'use client';

import { Header } from '@/components/header';
import Link from 'next/link';
import { StoryScene3D } from '@/components/story-scene';
import { Check, Flame, Star, ArrowRight, ArrowDown } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScrollNav({ currentSection }: { currentSection: string }) {
  const sections = [
    { id: 'hero', label: 'Start' },
    { id: 'act-1', label: 'The feed' },
    { id: 'act-2', label: 'The page' },
    { id: 'act-3', label: 'The margin' },
    { id: 'act-4', label: 'The circle' },
    { id: 'interlude', label: 'The honest part' },
    { id: 'act-5', label: 'A year later' },
    { id: 'cta', label: 'Join' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 items-end pointer-events-none mix-blend-difference hidden md:flex">
      {sections.map((sec) => (
        <button
          key={sec.id}
          onClick={() => scrollTo(sec.id)}
          className={`group flex items-center gap-4 pointer-events-auto transition-all ${currentSection === sec.id ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}
          aria-label={`Scroll to ${sec.label}`}
        >
          <span className={`text-xs font-mono uppercase tracking-widest text-white transition-all ${currentSection === sec.id ? 'translate-x-0' : 'translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}>
            {sec.label}
          </span>
          <div className={`transition-all rounded-full bg-white ${currentSection === sec.id ? 'w-2 h-8' : 'w-2 h-2'}`} />
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'act-1', 'act-2', 'act-3', 'act-4', 'interlude', 'act-5', 'cta'];
      const scrollPos = window.scrollY + window.innerHeight / 2;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="relative w-full selection:bg-accent-soft selection:text-ink">
      <Header />
      <StoryScene3D />
      <ScrollNav currentSection={activeSection} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10 pointer-events-none pb-24">
        
        {/* HERO */}
        <section id="hero" className="min-h-[85vh] pt-28 pb-12 sm:min-h-screen sm:pt-48 sm:pb-24 flex flex-col justify-center pointer-events-auto">
          <FadeIn>
            <h3 className="text-accent uppercase tracking-[0.2em] text-xs font-bold mb-6">A story you already know</h3>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl leading-[1.1] mb-4 sm:mb-8 max-w-3xl text-ink">
              It&apos;s 11:47pm and the feed already knows how tonight goes.
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-ink-soft max-w-2xl mb-8 sm:mb-16 leading-relaxed">
              You&apos;ve been here an hour. You couldn&apos;t name three things you saw.
            </p>
            <button 
              onClick={() => scrollTo('act-1')}
              className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.15em] text-ink-faint border-l-2 border-accent pl-4 hover:text-accent transition-colors cursor-pointer text-left"
            >
              Scroll — this one ends differently <ArrowDown className="w-4 h-4 animate-bounce" />
            </button>
          </FadeIn>
        </section>

        {/* ACT I */}
        <section id="act-1" className="min-h-[80vh] py-12 sm:min-h-[120vh] sm:py-24 flex flex-col justify-center items-end text-right pointer-events-auto">
          <div className="max-w-2xl">
            <FadeIn>
              <h3 className="text-accent uppercase tracking-[0.2em] text-xs font-bold mb-6">Act I · The feed</h3>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl leading-[1.1] mb-4 sm:mb-8 text-ink">
                Two hours a day, every day, spent becoming no one in particular.
              </h2>
              <div className="bg-surface/95 md:bg-surface/80 md:backdrop-blur-md p-6 rounded-xl border border-rule/50 shadow-sm inline-block text-left">
                <p className="text-lg text-ink-soft leading-relaxed">
                  That&apos;s the average. Not because you&apos;re weak — because ten thousand engineers are paid to make the next flick land. It&apos;s not a moral failing. It&apos;s a design win. Someone else&apos;s.
                </p>
              </div>
              <div className="mt-12 text-left bg-surface/95 md:bg-surface/80 md:backdrop-blur-md p-6 rounded-xl border border-rule/50 shadow-sm inline-block">
                <p className="text-lg text-ink-soft leading-relaxed">
                  <span className="font-semibold text-ink">Same thumb. Same hour.<br/>Different ending.</span><br/>
                  The urge to pick up the phone is not the enemy. It just needs somewhere better to land.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ACT II */}
        <section id="act-2" className="min-h-[80vh] py-12 sm:min-h-[120vh] sm:py-24 flex flex-col justify-center pointer-events-auto">
          <div className="max-w-2xl">
            <FadeIn>
              <h3 className="text-accent uppercase tracking-[0.2em] text-xs font-bold mb-6">Act II · The page</h3>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl leading-[1.1] mb-4 sm:mb-8 text-ink">
                The phone opens. This time it&apos;s a book.
              </h2>
              <p className="text-base sm:text-xl text-ink-soft leading-relaxed mb-8 sm:mb-16 bg-surface/95 md:bg-surface/80 md:backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-sm inline-block">
                A real one — the same PDF for everyone in your circle, laid out on warm paper. It has a last page. That is not a missing feature.
              </p>
              
              <div className="border-l-2 border-accent pl-6 py-2 bg-surface/95 md:bg-surface/80 md:backdrop-blur-md rounded-r-xl max-w-lg">
                <h4 className="text-sm font-bold uppercase tracking-widest text-ink mb-3">The gesture</h4>
                <p className="text-lg text-ink-soft leading-relaxed">
                  A line reads you back. You mark it.<br/>
                  Select the sentence, one tap, done. The highlight lands on the exact words — at any zoom, on any screen, for every friend who opens the page after you.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ACT III */}
        <section id="act-3" className="min-h-[80vh] py-12 sm:min-h-[120vh] sm:py-24 flex flex-col justify-center items-end text-right pointer-events-auto">
          <div className="max-w-2xl">
            <FadeIn>
              <h3 className="text-accent uppercase tracking-[0.2em] text-xs font-bold mb-6">Act III · The margin</h3>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl leading-[1.1] mb-4 sm:mb-8 text-ink">
                By morning, someone has answered in the margin.
              </h2>
              <p className="text-xl text-ink-soft leading-relaxed bg-surface/95 md:bg-surface/80 md:backdrop-blur-md p-6 rounded-xl border border-rule/50 shadow-sm text-left inline-block">
                Not a like. A sentence, from a friend, anchored to the paragraph that caused it. The social urge — noticed, answered, aimed at something that lasts.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ACT IV */}
        <section id="act-4" className="min-h-[80vh] py-12 sm:min-h-[120vh] sm:py-24 flex flex-col justify-center items-center text-center pointer-events-auto pt-32">
          <div className="max-w-4xl w-full">
            <FadeIn>
              <h3 className="text-accent uppercase tracking-[0.2em] text-xs font-bold mb-6">Act IV · The circle</h3>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl leading-[1.1] mb-8 sm:mb-16 text-ink max-w-3xl mx-auto">
                Two or three people who notice whether you showed up.
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative">
                <div className="bg-raised/95 md:bg-raised/90 md:backdrop-blur-md p-8 rounded-2xl shadow-sm border border-rule relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center mb-6">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-ink mb-3 text-lg">Commit</h4>
                  <p className="text-ink-soft leading-relaxed">
                    One concrete habit per chapter, named out loud. Small enough to survive a bad day.
                  </p>
                </div>
                
                <div className="bg-raised/95 md:bg-raised/90 md:backdrop-blur-md p-8 rounded-2xl shadow-sm border border-rule relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center mb-6">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-ink mb-3 text-lg">Check in</h4>
                  <p className="text-ink-soft leading-relaxed">
                    Everyone marks it done, or doesn&apos;t. The streak belongs to the circle — miss, and it breaks for all of you.
                  </p>
                </div>
                
                <div className="bg-raised/95 md:bg-raised/90 md:backdrop-blur-md p-8 rounded-2xl shadow-sm border border-rule relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center mb-6">
                    <Star className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-ink mb-3 text-lg">Vault</h4>
                  <p className="text-ink-soft leading-relaxed">
                    Pin what mattered. Searchable across every book you&apos;ve read together, forever.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* INTERLUDE */}
        <section id="interlude" className="min-h-[75vh] py-14 sm:min-h-[100vh] sm:py-32 flex flex-col justify-center items-center text-center max-w-3xl mx-auto pointer-events-auto">
          <FadeIn>
            <h4 className="font-bold text-ink mb-4 text-xl">The honest part</h4>
            <p className="text-base sm:text-xl text-ink-soft leading-relaxed mb-8 sm:mb-12 bg-surface/95 md:bg-surface/80 md:backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-sm">
              You can still lose two hours in here.<br/>
              Chase the tangent. Argue about one paragraph until midnight. The difference is where it lands: you&apos;ll be two hours deeper into the book, with the margins to prove it.
            </p>
            <blockquote className="border-y border-rule py-6 my-6 sm:py-8 sm:my-8 bg-surface/90 md:bg-surface/60 md:backdrop-blur-sm px-6 rounded-2xl">
              <p className="font-serif text-2xl sm:text-3xl md:text-4xl italic text-ink mb-6 leading-tight">
                “A reader lives a thousand lives before he dies. The man who never reads lives only one.”
              </p>
              <footer className="text-sm font-bold uppercase tracking-widest text-ink-faint">
                George R.R. Martin
              </footer>
            </blockquote>
          </FadeIn>
        </section>

        {/* ACT V */}
        <section id="act-5" className="min-h-[75vh] py-12 sm:min-h-[100vh] sm:py-24 flex flex-col justify-center items-center text-center pointer-events-auto">
          <div className="max-w-3xl relative z-10">
            <FadeIn>
              <h3 className="text-accent uppercase tracking-[0.2em] text-xs font-bold mb-6">Act V · A year later</h3>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl leading-[1.1] mb-4 sm:mb-8 text-ink">
                The scroll left nothing. The shelf is still here.
              </h2>
              <p className="text-xl text-ink-soft leading-relaxed bg-surface/95 md:bg-surface/80 md:backdrop-blur-md p-6 rounded-xl border border-rule/50 shadow-sm inline-block">
                Every book finished together, every highlight worth keeping, every habit that stuck — one vault, built an evening at a time out of hours that used to vanish.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* OUTRO / CTA */}
        <section id="cta" className="min-h-[75vh] py-12 sm:min-h-[100vh] sm:py-24 flex flex-col justify-center items-center text-center pointer-events-auto">
          <FadeIn className="flex flex-col items-center">
            <div className="bg-surface/95 md:bg-surface/80 md:backdrop-blur-md p-12 rounded-3xl border border-rule shadow-xl">
              <h2 className="font-serif text-4xl sm:text-6xl md:text-8xl leading-[1.1] text-ink mb-2">
                Want to learn and grow?
              </h2>
              <h2 className="font-serif text-4xl sm:text-6xl md:text-8xl leading-[1.1] text-accent mb-8">
                Use this.
              </h2>
              <p className="text-base sm:text-xl text-ink-faint italic mb-8 sm:mb-12">
                Want to keep scrolling? You know the way back.
              </p>
              
              <Link href="/signup" className="group inline-flex w-fit items-center gap-3 bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all hover:scale-105 active:scale-95 mb-8 mx-auto">
                Open a circle
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <p className="text-sm font-bold uppercase tracking-widest text-ink-faint mb-4">
                Invite-only · No feed inside · The book ends, and that&apos;s the point
              </p>
            </div>
            
            <div className="flex flex-col items-center border-t border-rule pt-12 w-full mt-24">
               <div className="flex items-center gap-2 text-ink font-bold text-2xl tracking-tight mb-4">
                  Readrise
               </div>
               <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">
                  Read together · Argue in the margins · Keep what mattered
               </p>
            </div>
          </FadeIn>
        </section>
        
      </div>
    </main>
  );
}

