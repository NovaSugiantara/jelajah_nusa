import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWall, submitVoice } from "../lib/api";
import { useApp } from "../context/AppContext";
import { MessagesSquare, Send, Quote, ShieldCheck, ArrowRight } from "lucide-react";

export default function Suara() {
  const { progress } = useApp();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [entries, setEntries] = useState([]);
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");

  const completed = progress?.stats?.completedCount || 0;
  const canSubmit = completed > 0;

  const load = () => fetchWall().then((d) => { setPrompt(d.prompt); setEntries(d.entries); });

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || sending) return;
    setSending(true);
    setNotice("");
    try {
      const res = await submitVoice(answer.trim());
      setNotice(res.message);
      setAnswer("");
    } catch (err) {
      setNotice("Gagal mengirim. Coba lagi sebentar.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8 md:px-6" data-testid="suara-page">
      <div className="text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-merah/30 bg-merah/10 px-3 py-1 text-xs font-medium text-merah">
          <MessagesSquare size={13} /> Suara Nusantara
        </div>
        <h1 className="font-display text-3xl font-black text-tinta md:text-5xl">Refleksi di akhir perjalanan</h1>
        <p className="mx-auto mt-3 max-w-xl text-tinta/75">
          Setelah menyusuri kisah-kisah Nusantara, bagikan harapanmu. Suara terkumpul secara anonim
          dan tampil di dinding komunitas setelah ditinjau.
        </p>
      </div>

      {/* prompt + form */}
      <div className="mt-8 overflow-hidden rounded-2xl arsip-card shadow-arsip">
        <div className="bg-tinta p-6 text-kertas">
          <Quote size={24} className="mb-2 text-merah" />
          <p className="font-display text-2xl font-bold leading-snug">
            {prompt || "Indonesia seperti apa yang ingin kamu lihat di masa depan?"}
          </p>
        </div>

        <div className="p-6">
          {canSubmit ? (
            <form onSubmit={handleSubmit} data-testid="voice-form">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value.slice(0, 280))}
                placeholder="Tulis harapanmu untuk Indonesia…"
                rows={3}
                data-testid="voice-input"
                className="w-full resize-none rounded-xl border border-sepia/30 bg-kertas/70 p-4 text-tinta outline-none transition-soft focus:border-merah"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-sepia">{answer.length}/280 · anonim</span>
                <button
                  type="submit"
                  disabled={!answer.trim() || sending}
                  data-testid="voice-submit"
                  className="inline-flex items-center gap-2 rounded-full bg-merah px-5 py-2.5 font-semibold text-white transition-soft hover:bg-merahdark disabled:opacity-50"
                >
                  <Send size={16} /> {sending ? "Mengirim…" : "Kirim suara"}
                </button>
              </div>
              {notice && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-emas/40 bg-emas/10 px-4 py-3 text-sm text-tinta" data-testid="voice-notice">
                  <ShieldCheck size={16} className="text-emas" /> {notice}
                </div>
              )}
            </form>
          ) : (
            <div className="text-center" data-testid="voice-locked">
              <p className="text-tinta/75">Selesaikan minimal satu perjalanan untuk membagikan suaramu.</p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-merah px-5 py-2.5 font-semibold text-white transition-soft hover:bg-merahdark"
              >
                Mulai menjelajah <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* wall */}
      <section className="pt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-tinta">Dinding Komunitas</h2>
          <span className="text-sm text-sepia">{entries.length} suara</span>
        </div>
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {entries.map((e, i) => (
            <div
              key={i}
              className="mb-4 break-inside-avoid rounded-2xl arsip-card p-5 shadow-arsip rise-in"
              style={{ animationDelay: `${(i % 6) * 0.05}s` }}
              data-testid={`wall-entry-${i}`}
            >
              <Quote size={18} className="mb-2 text-merah" />
              <p className="text-tinta">{e.answer_text}</p>
              <p className="mt-3 stamp text-[10px] text-sepia">— Warga Nusantara</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
