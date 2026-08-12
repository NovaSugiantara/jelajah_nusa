import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchRegion } from "../lib/api";
import { useApp } from "../context/AppContext";
import audioEngine from "../lib/audio";
import CollectibleReveal from "../components/CollectibleReveal";
import { ArrowLeft, ArrowRight, BookOpen, Quote, ExternalLink, Sparkles, Map } from "lucide-react";

export default function StoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { recordProgress } = useApp();

  const [region, setRegion] = useState(null);
  const [nodeId, setNodeId] = useState(null);
  const [choiceId, setChoiceId] = useState(null);
  const [reveal, setReveal] = useState(null); // {collectible}
  const [ending, setEnding] = useState(false);
  const [stepCount, setStepCount] = useState(1);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchRegion(slug).then((r) => {
      if (!alive) return;
      setRegion(r);
      setNodeId(r.story.start);
    });
    audioEngine.start(slug);
    return () => {
      alive = false;
      audioEngine.stop();
    };
  }, [slug]);

  // mark as "sedang dijelajahi" on entry
  useEffect(() => {
    if (region) recordProgress({ region_slug: slug, story_completed: false });
  }, [region]);

  const node = region ? region.story.nodes[nodeId] : null;

  const totalSteps = useMemo(() => {
    if (!region) return 4;
    // scenes until choice + 1 choice + 1 discovery
    let count = 0;
    let cur = region.story.start;
    const nodes = region.story.nodes;
    while (cur && nodes[cur] && nodes[cur].type === "scene") {
      count++;
      cur = nodes[cur].next;
    }
    return count + 2;
  }, [region]);

  const goTo = useCallback((next) => {
    setStepCount((s) => s + 1);
    setAnimKey((k) => k + 1);
    setNodeId(next);
  }, []);

  const completeStory = useCallback(
    async (discoveryId) => {
      if (ending) return;
      setEnding(true);
      const data = await recordProgress({
        region_slug: slug,
        story_completed: true,
        choice_id: choiceId,
        discovery_id: discoveryId,
      });
      if (data.newly_collected) {
        setTimeout(() => setReveal(data.newly_collected), 700);
      }
    },
    [ending, recordProgress, slug, choiceId]
  );

  // when reaching a discovery node, complete the story
  useEffect(() => {
    if (node && node.type === "discovery") {
      completeStory(nodeId);
    }
  }, [nodeId]);

  if (!region || !node) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sepia" data-testid="story-loading">
        Memuat cerita…
      </div>
    );
  }

  const accent = region.accent;
  const progressPct = Math.min(100, (stepCount / totalSteps) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-6" data-testid="story-page">
      {/* top bar */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          data-testid="story-back-btn"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sepia transition-soft hover:text-tinta"
        >
          <ArrowLeft size={16} /> Peta
        </button>
        <div className="flex items-center gap-2 text-xs text-sepia">
          <span className="stamp rounded-full border border-sepia/40 px-2 py-0.5">{region.story.category}</span>
        </div>
      </div>

      {/* header */}
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-sepia">
          {region.island} · {region.name}
        </p>
        <h1 className="font-display text-3xl font-black leading-tight text-tinta md:text-4xl">
          {region.story.title}
        </h1>
      </div>

      {/* progress */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-kertas2" data-testid="story-progress">
        <div className="h-full rounded-full transition-soft" style={{ width: `${progressPct}%`, background: accent }} />
      </div>

      {/* node */}
      <div key={animKey} className="rise-in">
        {node.image && node.type === "scene" && (
          <div className="mb-5 overflow-hidden rounded-2xl shadow-arsip">
            <img src={node.image} alt={region.name} className="h-56 w-full object-cover md:h-72" />
          </div>
        )}

        {node.type === "scene" && (
          <div className="arsip-card rounded-2xl p-6 shadow-arsip" data-testid="story-scene">
            <BookOpen size={22} style={{ color: accent }} className="mb-3" />
            <p className="text-lg leading-relaxed text-tinta md:text-xl">{node.text}</p>
            <button
              onClick={() => goTo(node.next)}
              data-testid="story-continue-btn"
              className="group mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-soft"
              style={{ background: accent }}
            >
              Lanjutkan
              <ArrowRight size={18} className="transition-soft group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {node.type === "choice" && (
          <div className="arsip-card rounded-2xl p-6 shadow-arsip" data-testid="story-choice">
            <p className="stamp mb-1 text-[11px]" style={{ color: accent }}>
              Titik keputusan
            </p>
            <p className="mb-5 text-lg font-semibold text-tinta md:text-xl">{node.text}</p>
            <div className="grid gap-3">
              {node.choices.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setChoiceId(c.id);
                    goTo(c.next);
                  }}
                  data-testid={`choice-${c.id}`}
                  className="group flex items-center justify-between rounded-xl border-2 border-sepia/25 bg-kertas/60 px-5 py-4 text-left font-medium text-tinta transition-soft hover:-translate-y-0.5"
                  style={{ borderColor: undefined }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                >
                  {c.label}
                  <ArrowRight size={18} className="text-sepia transition-soft group-hover:translate-x-1" />
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-sepia">
              Tidak ada pilihan yang salah — setiap jalan membawamu pada penemuan yang berbeda.
            </p>
          </div>
        )}

        {node.type === "discovery" && (
          <div data-testid="story-discovery">
            <div className="arsip-card rounded-2xl p-6 shadow-arsip">
              <p className="text-lg leading-relaxed text-tinta">{node.text}</p>
            </div>

            <div
              className="mt-4 rounded-2xl p-6 text-white shadow-arsip"
              style={{ background: accent }}
              data-testid="discovery-fact"
            >
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={16} />
                <span className="stamp text-[11px]">Penemuan</span>
              </div>
              <Quote size={22} className="mb-2 opacity-70" />
              <p className="text-lg font-medium leading-relaxed">{node.fact}</p>
              <p className="mt-4 flex items-center gap-1.5 text-xs opacity-90">
                <ExternalLink size={13} /> {node.source}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/")}
                data-testid="discovery-map-btn"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-tinta/25 px-5 py-3 font-semibold text-tinta transition-soft hover:bg-kertas2"
              >
                <Map size={17} /> Jelajah lain
              </button>
              <button
                onClick={() => navigate("/passport")}
                data-testid="discovery-passport-btn"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-tinta px-5 py-3 font-semibold text-kertas transition-soft hover:opacity-90"
              >
                Nusa Passport
              </button>
            </div>
          </div>
        )}
      </div>

      {reveal && (
        <CollectibleReveal
          collectible={reveal}
          regionName={region.name}
          accent={accent}
          onClose={() => setReveal(null)}
          onPassport={() => navigate("/passport")}
        />
      )}
    </div>
  );
}
