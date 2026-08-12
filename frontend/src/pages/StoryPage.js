import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchRegion, startStory, restartStory, moveBack, advance } from "../lib/api";
import { useApp } from "../context/AppContext";
import audioEngine from "../lib/audio";
import CollectibleReveal from "../components/CollectibleReveal";
import { ArrowLeft, ArrowRight, BookOpen, Quote, Sparkles, Map, RotateCcw } from "lucide-react";

export default function StoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { refresh, provinceProgress } = useApp();

  const [region, setRegion] = useState(null);
  const [regionError, setRegionError] = useState("");
  const [phase, setPhase] = useState("loading"); // loading | intro | playing
  const [nodeId, setNodeId] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reveal, setReveal] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setRegionError("");
    fetchRegion(slug)
      .then((r) => {
        if (!alive) return;
        setRegion(r);
      })
      .catch(() => alive && setRegionError("Cerita tidak ditemukan."));
    audioEngine.start(slug);
    return () => {
      alive = false;
      audioEngine.stop();
    };
  }, [slug]);

  useEffect(() => {
    refresh();
  }, [refresh, slug]);

  const prov = provinceProgress(slug);
  const status = prov?.status;
  const activeRun = prov?.activeRun;

  useEffect(() => {
    if (!region || !status || phase !== "loading") return;
    if (status === "completed" && prov?.lastDiscoveryId) {
      // Refresh on Discovery restores the last Discovery without replaying the reward animation.
      enter(prov.lastDiscoveryId);
    } else {
      setPhase("intro");
    }
  }, [region, status, prov?.lastDiscoveryId]);

  const enter = (node) => {
    setNodeId(node);
    setPhase("playing");
    setAnimKey((k) => k + 1);
  };

  const handleStart = async () => {
    setPending(true);
    setError("");
    try {
      const res = await startStory(slug);
      await refresh();
      enter(res.node_id);
    } catch (e) {
      setError("Gagal memulai cerita. Coba lagi.");
    } finally {
      setPending(false);
    }
  };

  const handleResume = () => {
    if (activeRun?.currentNodeId) enter(activeRun.currentNodeId);
  };

  const handleRestart = async () => {
    setPending(true);
    setError("");
    try {
      const res = await restartStory(slug);
      await refresh();
      enter(res.node_id);
    } catch (e) {
      setError("Gagal memulai ulang. Coba lagi.");
    } finally {
      setPending(false);
    }
  };

  const doForward = useCallback(
    async (choiceId) => {
      setPending(true);
      setError("");
      try {
        const res = await advance(slug, nodeId, choiceId);
        await refresh();
        setNodeId(res.node_id);
        setAnimKey((k) => k + 1);
        if (res.newly_collected) {
          setTimeout(() => setReveal(res.newly_collected), 600);
        }
      } catch (e) {
        setError("Progres belum tersimpan. Coba lagi.");
      } finally {
        setPending(false);
      }
    },
    [slug, nodeId, refresh]
  );

  const doBack = async () => {
    setPending(true);
    setError("");
    try {
      const res = await moveBack(slug);
      await refresh();
      setNodeId(res.node_id);
      setAnimKey((k) => k + 1);
    } catch (e) {
      setError("Gagal kembali. Coba lagi.");
    } finally {
      setPending(false);
    }
  };

  if (regionError) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="text-tinta">{regionError}</p>
        <button
          onClick={() => navigate("/jelajah")}
          data-testid="story-notfound-btn"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-merah px-5 py-2.5 font-semibold text-white"
        >
          <Map size={16} /> Kembali ke peta
        </button>
      </div>
    );
  }

  if (!region || !status) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sepia" data-testid="story-loading">
        Memuat cerita…
      </div>
    );
  }

  const node = phase === "playing" ? region.story.nodes[nodeId] : null;
  const history = activeRun?.nodeHistory || [];
  const choiceLocked = node?.type === "choice" && Boolean(activeRun?.latestChoiceId);
  const accent = region.accent;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-6" data-testid="story-page">
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => navigate("/jelajah")}
          data-testid="story-back-btn"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sepia transition-soft hover:text-tinta"
        >
          <ArrowLeft size={16} /> Peta
        </button>
        <div className="flex items-center gap-2 text-xs text-sepia">
          <span className="stamp rounded-full border border-sepia/40 px-2 py-0.5">{region.story.category}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-sepia">
          {region.island} · {region.name}
        </p>
        <h1 className="font-display text-3xl font-black leading-tight text-tinta md:text-4xl">
          {region.story.title}
        </h1>
      </div>

      {error && (
        <div
          className="mb-4 rounded-xl border border-merah/40 bg-merah/10 px-4 py-3 text-sm text-tinta"
          data-testid="story-error"
        >
          {error}
        </div>
      )}

      {phase === "intro" && (
        <div className="arsip-card rounded-2xl p-6 shadow-arsip" data-testid="story-intro">
          <p className="text-lg leading-relaxed text-tinta">{region.blurb}</p>
          <p className="mt-2 text-sm text-sepia">
            Satu cerita singkat, satu pilihan, satu penemuan. Tidak ada pilihan yang salah.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {status === "not_started" && (
              <button
                onClick={handleStart}
                disabled={pending}
                data-testid="story-start-btn"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-soft disabled:opacity-60"
                style={{ background: accent }}
              >
                Mulai cerita <ArrowRight size={18} />
              </button>
            )}
            {status === "in_progress" && (
              <>
                <button
                  onClick={handleResume}
                  data-testid="story-resume-btn"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-soft"
                  style={{ background: accent }}
                >
                  Lanjutkan cerita <ArrowRight size={18} />
                </button>
                <button
                  onClick={handleRestart}
                  disabled={pending}
                  data-testid="story-restart-btn"
                  className="inline-flex items-center gap-2 rounded-full border border-tinta/25 px-6 py-3 font-semibold text-tinta transition-soft hover:bg-kertas2 disabled:opacity-60"
                >
                  <RotateCcw size={16} /> Mulai dari awal
                </button>
              </>
            )}
            {status === "completed" && (
              <>
                <button
                  onClick={handleRestart}
                  disabled={pending}
                  data-testid="story-replay-btn"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-soft disabled:opacity-60"
                  style={{ background: accent }}
                >
                  <RotateCcw size={16} /> Mainkan ulang cerita
                </button>
                <button
                  onClick={() => navigate("/passport")}
                  data-testid="story-passport-btn"
                  className="inline-flex items-center gap-2 rounded-full border border-tinta/25 px-6 py-3 font-semibold text-tinta transition-soft hover:bg-kertas2"
                >
                  Lihat Passport
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {phase === "playing" && node && (
        <div key={animKey} className="rise-in">
          {node.image && node.type === "scene" && (
            <div className="mb-5 overflow-hidden rounded-2xl shadow-arsip">
              <img src={node.image.src} alt={node.image.alt} className="h-56 w-full object-cover md:h-72" />
            </div>
          )}

          {node.type === "scene" && (
            <div className="arsip-card rounded-2xl p-6 shadow-arsip" data-testid="story-scene">
              <BookOpen size={22} style={{ color: accent }} className="mb-3" />
              <p className="text-lg leading-relaxed text-tinta md:text-xl">{node.text}</p>
              <button
                onClick={() => doForward(null)}
                disabled={pending}
                data-testid="story-continue-btn"
                className="group mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-soft disabled:opacity-60"
                style={{ background: accent }}
              >
                {pending ? "Menyimpan…" : "Lanjutkan"}
                {!pending && <ArrowRight size={18} />}
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
                {node.choices.map((c) => {
                  const chosen = choiceLocked && activeRun.latestChoiceId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => doForward(c.id)}
                      disabled={pending || choiceLocked}
                      data-testid={`choice-${c.id}`}
                      aria-pressed={chosen}
                      className={`group flex items-center justify-between rounded-xl border-2 px-5 py-4 text-left font-medium transition-soft ${
                        chosen
                          ? "border-merah bg-merah/10 text-tinta"
                          : "border-sepia/25 bg-kertas/60 text-tinta hover:-translate-y-0.5 disabled:opacity-50"
                      }`}
                      style={chosen ? { borderColor: accent } : undefined}
                    >
                      {c.label}
                      {chosen ? (
                        <span className="text-xs text-sepia">Pilihanmu · terkunci</span>
                      ) : (
                        <ArrowRight size={18} className="text-sepia" />
                      )}
                    </button>
                  );
                })}
              </div>
              {choiceLocked && (
                <button
                  onClick={() => doForward(activeRun.latestChoiceId)}
                  disabled={pending}
                  data-testid="choice-continue-locked"
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-soft disabled:opacity-60"
                  style={{ background: accent }}
                >
                  {pending ? "Menyimpan…" : "Lanjutkan pilihan"} {!pending && <ArrowRight size={18} />}
                </button>
              )}
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
                <div className="mt-4 flex flex-wrap gap-2">
                  {node.sources?.map((s, i) =>
                    s.url ? (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`discovery-source-${i}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-3 py-1.5 text-xs opacity-90 transition-soft hover:opacity-100"
                      >
                        Sumber: {s.label} ↗
                      </a>
                    ) : (
                      <span key={i} className="text-xs opacity-80">
                        Sumber: {s.label}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/jelajah")}
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

          {node.type !== "discovery" && (
            <button
              onClick={doBack}
              disabled={pending}
              data-testid="story-node-back"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sepia transition-soft hover:text-tinta disabled:opacity-50"
            >
              <ArrowLeft size={16} /> Kembali
            </button>
          )}
        </div>
      )}

      {reveal && (
        <CollectibleReveal
          collectible={reveal}
          regionName={region.name}
          accent={accent}
          onClose={() => setReveal(null)}
          onPassport={() => navigate("/passport")}
          onExplore={() => navigate("/jelajah")}
        />
      )}
    </div>
  );
}
