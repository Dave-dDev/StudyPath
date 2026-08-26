"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDropzone, type FileRejection } from "react-dropzone";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import DifficultySelector from "@/components/ui/DifficultySelector";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import QuotaWidget from "@/components/ui/QuotaWidget";
import type { Difficulty, StudyMode } from "@/types";
import { cn } from "@/lib/utils";

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) ?? "");
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data });
  const doc = await task.promise;
  let fullText = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n";
    page.cleanup();
  }
  await task.destroy();
  return fullText.trim();
}

const MODE_SUGGESTIONS = [
  "Lecture notes",
  "Textbook chapter",
  "Meeting recap",
  "Course slides",
  "Exam review",
];

const MODES: { id: StudyMode; icon: string; label: string; desc: string; badge: string; badgeClass: string }[] = [
  { id: "quiz",       icon: "📝", label: "Quiz Mode",       desc: "MCQ + True/False",       badge: "Most popular",  badgeClass: "badge-teal" },
  { id: "flashcards", icon: "🃏", label: "Flashcards",      desc: "Spaced repetition (SM-2)", badge: "Best retention", badgeClass: "badge-purple" },
  { id: "feynman",    icon: "💡", label: "Feynman Summary", desc: "Deep understanding",      badge: "Quick review",  badgeClass: "bg-amber-50 text-amber-400 badge" },
];

function getRecommendedMode(text: string): StudyMode {
  const length = text.trim().length;
  if (length === 0) return "quiz";
  if (length < 800) return "feynman";
  if (length > 2400) return "flashcards";
  return "quiz";
}

function getRecommendedDifficulty(text: string): Difficulty {
  const length = text.trim().length;
  if (length < 800) return "easy";
  if (length > 2400) return "hard";
  return "medium";
}

export default function UploadPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<StudyMode>("quiz");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [loading, setLoading] = useState(false);
  const [adaptiveRec, setAdaptiveRec] = useState<{ recommended: string; confidence: number } | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [readingFile, setReadingFile] = useState(false);

  // Fetch adaptive difficulty recommendation
  useEffect(() => {
    fetch("/api/adaptive-difficulty")
      .then((r) => r.json())
      .then((d) => {
        if (d.recommended && d.confidence > 0.5) {
          setAdaptiveRec(d);
          setDifficulty(d.recommended as Difficulty);
        }
      })
      .catch(() => {});
  }, []);

  const recommendedMode = useMemo(() => getRecommendedMode(text), [text]);
  const recommendedDifficulty = useMemo(() => getRecommendedDifficulty(text), [text]);

  const onDrop = useCallback(async (accepted: File[], rejected: FileRejection[]) => {
    if (rejected.length > 0) {
      toast.error(`Unsupported file: ${rejected[0].file.name}. Please upload a .txt, .md, or .pdf file (max 10 MB).`);
      return;
    }
    const file = accepted[0];
    if (!file) return;

    // Check + record an "ingest" usage unit before reading the file
    try {
      const usageRes = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ingest" }),
      });
      if (usageRes.status === 402) {
        const data = await usageRes.json();
        toast.error(data.error ?? "Import limit reached.", { duration: 6000 });
        router.push("/pricing");
        return;
      }
    } catch {
      // If usage tracking is unavailable, proceed without gating
    }

    setReadingFile(true);
    try {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const content = isPdf ? await extractPdfText(file) : await readFileAsText(file);
      if (!content.trim()) {
        toast.error(
          isPdf
            ? "No readable text found in this PDF. It may be a scanned image — try pasting the text directly."
            : "The file appears to be empty."
        );
        return;
      }
      setText(content);
      toast.success(`Loaded: ${file.name}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to read file. Try pasting the text directly.");
    } finally {
      setReadingFile(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  async function handleFetchUrl() {
    if (!urlInput.trim()) return;
    setFetchingUrl(true);
    try {
      const res = await fetch(`/api/fetch-url?url=${encodeURIComponent(urlInput)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setText(data.text);
      setUrlInput("");
      toast.success("Content fetched successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch URL");
    } finally {
      setFetchingUrl(false);
    }
  }

  async function handleGenerate() {
    if (text.trim().length < 50) {
      toast.error("Please provide at least 50 characters of text.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode, difficulty }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          toast.error(json.error ?? "Generation limit reached.", { duration: 6000 });
          router.push("/pricing");
          return;
        }
        throw new Error(json.error);
      }

      const title = text.split("\n")[0].slice(0, 60).trim() || "Untitled study set";

      let studySetId: string | null = null;
      try {
        const saveRes = await fetch("/api/study-sets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, sourceText: text, difficulty, mode, data: json.data }),
        });
        const saveJson = await saveRes.json();
        if (saveRes.ok && saveJson.set) {
          studySetId = saveJson.set.id;
        } else if (saveRes.status === 402) {
          toast(saveJson.error ?? "Study set not saved — monthly limit reached. You can still use it now.", { icon: "ℹ️", duration: 6000 });
        }
      } catch {}

      sessionStorage.setItem("studyData", JSON.stringify(json.data));
      sessionStorage.setItem("studyMode", mode);
      sessionStorage.setItem("studyMeta", JSON.stringify({ difficulty, chars: text.length }));
      if (studySetId) sessionStorage.setItem("studySetId", studySetId);

      router.push(mode === "quiz" ? "/quiz" : mode === "flashcards" ? "/flashcards" : "/feynman");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="font-bold text-3xl text-ink mb-2">What do you want to study today?</h1>
          <p className="text-gray-600">Paste text, upload a file, or fetch from a URL — we&apos;ll handle the rest.</p>
        </div>

        <div className="mb-6">
          <QuotaWidget />
        </div>

        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-4",
            isDragActive
              ? "border-teal-400 bg-teal-50"
              : "border-teal-100 bg-white hover:border-teal-400 hover:bg-teal-50/30"
          )}
        >
          <input {...getInputProps()} />
          <div className="text-3xl mb-2">📄</div>
          <p className="font-semibold text-sm text-ink mb-1">
            {isDragActive ? "Drop it!" : readingFile ? "Reading file..." : "Drop your file here"}
          </p>
          <p className="text-xs text-gray-400 mb-3">PDF, .txt, or .md — up to 10 MB</p>
          <button className="badge-teal px-4 py-1.5 text-xs">Browse files</button>
        </div>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* URL fetch */}
        <div className="flex gap-2 mb-4">
          <input
            type="url"
            className="input flex-1"
            placeholder="Paste a URL to fetch article content..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
          />
          <button
            onClick={handleFetchUrl}
            disabled={fetchingUrl || !urlInput.trim()}
            className="btn-secondary px-4 text-sm"
          >
            {fetchingUrl ? "..." : "Fetch"}
          </button>
        </div>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or paste text directly</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <textarea
          className="textarea h-36 mb-4"
          placeholder="Paste your notes, article, or chapter here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex flex-wrap gap-2 mb-6 text-xs text-gray-500">
          {MODE_SUGGESTIONS.map((tag) => (
            <span key={tag} className="badge bg-gray-100 text-gray-700">{tag}</span>
          ))}
        </div>

        {text.trim().length > 30 && (
          <div className="card border-teal-100 bg-teal-50/60 p-5 mb-6">
            <p className="text-teal-700 text-sm font-semibold mb-2">Smart study suggestion</p>
            <p className="text-sm text-ink mb-4">
              Based on your text length, <strong>{recommendedMode}</strong> is a great option.
              {adaptiveRec && (
                <> We also recommend <strong>{adaptiveRec.recommended}</strong> difficulty based on your recent performance ({Math.round(adaptiveRec.confidence * 100)}% confidence).</>
              )}
              {!adaptiveRec && <> Try <strong>{recommendedDifficulty}</strong> difficulty for the best learning flow.</>}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setMode(recommendedMode);
                  setDifficulty(adaptiveRec?.recommended as Difficulty || recommendedDifficulty);
                }}
                className="btn-primary text-sm"
              >
                Use recommendation
              </button>
              <button onClick={() => setText("")} className="btn-ghost text-sm">Clear text</button>
            </div>
          </div>
        )}

        <p className="text-sm font-semibold text-ink mb-3">Choose study mode</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "card p-5 text-left transition-all cursor-pointer",
                mode === m.id ? "border-2 border-teal-400 shadow-lifted" : "hover:border-gray-200"
              )}
            >
              <div className="text-2xl mb-2">{m.icon}</div>
              <span className={cn(m.badgeClass, "mb-2 text-[10px]")}>{m.badge}</span>
              <p className="font-semibold text-sm text-ink">{m.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>

        <div className="mb-8">
          <DifficultySelector value={difficulty} onChange={setDifficulty} />
        </div>

        <button
          onClick={handleGenerate}
          disabled={text.trim().length < 50}
          className="btn-primary w-full text-base py-4"
        >
          ✨ &nbsp;Generate my study set
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          {text.length > 0 ? `${text.length.toLocaleString()} characters · ` : ""}
          Powered by AI
        </p>
      </main>
    </div>
  );
}
