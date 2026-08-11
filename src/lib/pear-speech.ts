/**
 * Browser speech helpers for the Pear live oral agent (Web Speech API).
 * No backend required — works on local `next dev`.
 */

export type PearSpeechStatus = "idle" | "speaking" | "unsupported";

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

/** Spell ages/numbers so TTS doesn't drop a digit (56 → "fifty-five") or misread "live". */
export function numberToSpeechWords(n: number): string {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v) || v < 0) return String(n);
  if (v < 20) return ONES[v] ?? String(v);
  if (v < 100) {
    const ten = Math.floor(v / 10);
    const one = v % 10;
    return one === 0 ? TENS[ten]! : `${TENS[ten]}-${ONES[one]}`;
  }
  return String(v);
}

/** Avoid "live" (/lɪv/) — spell the LIVE sense for speech engines. */
export function speakLivePhrase(kind: "demo" | "agent" | "walkthrough" = "demo"): string {
  if (kind === "agent") return "real-time agent";
  if (kind === "walkthrough") return "real-time walkthrough";
  return "real-time demo";
}

export function speakAge(age: number): string {
  return `age ${numberToSpeechWords(age)}`;
}

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() != null;
}

/** Prefer a clear English voice when available. */
function pickVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferred =
    voices.find(
      (v) =>
        /en(-|_)US/i.test(v.lang) &&
        /Samantha|Karen|Daniel|Google US English|Microsoft Aria|Natural/i.test(
          v.name,
        ),
    ) ||
    voices.find((v) => /en(-|_)US/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang));
  return preferred ?? voices[0] ?? null;
}

export function stopPearSpeech() {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
}

/**
 * Speak narration aloud. Cancels any in-flight utterance first.
 * Returns a promise that resolves when speech ends (or immediately if unsupported).
 */
export function speakPearScript(
  text: string,
  opts?: { rate?: number; pitch?: number },
): Promise<PearSpeechStatus> {
  if (!text.trim()) return Promise.resolve("idle");
  if (!isSpeechSynthesisSupported()) return Promise.resolve("unsupported");

  stopPearSpeech();

  return new Promise((resolve) => {
    const utter = new SpeechSynthesisUtterance(text.trim());
    utter.rate = opts?.rate ?? 1.02;
    utter.pitch = opts?.pitch ?? 1;
    utter.lang = "en-US";
    const voice = pickVoice();
    if (voice) utter.voice = voice;

    utter.onend = () => resolve("idle");
    utter.onerror = () => resolve("idle");

    // Chrome sometimes needs voices loaded asynchronously.
    const start = () => {
      window.speechSynthesis.speak(utter);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        const v = pickVoice();
        if (v) utter.voice = v;
        start();
      };
      // Fallback if voices never fire
      window.setTimeout(start, 250);
    } else {
      start();
    }
  });
}

export type PearListenHandle = {
  stop: () => void;
};

/**
 * One-shot voice input → transcript callback.
 * Uses Web Speech Recognition when available (Chrome / Edge / Safari).
 */
export function startPearListen(handlers: {
  onResult: (transcript: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}): PearListenHandle | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    handlers.onError?.("Voice input isn’t supported in this browser.");
    return null;
  }

  const recognition = new Ctor();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const first = event.results[0]?.[0]?.transcript?.trim();
    if (first) handlers.onResult(first);
  };
  recognition.onerror = (event) => {
    handlers.onError?.(event.error ?? "Voice input failed.");
  };
  recognition.onend = () => {
    handlers.onEnd?.();
  };

  try {
    recognition.start();
  } catch {
    handlers.onError?.("Couldn’t start the microphone.");
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    },
  };
}

/** Build a short oral script from simulation fields (keeps TTS crisp). */
export function buildOralScript(parts: {
  headline: string;
  bullets?: string[];
  closer?: string;
}): string {
  const bullets = (parts.bullets ?? []).filter(Boolean);
  return [parts.headline, ...bullets, parts.closer]
    .filter(Boolean)
    .join(" ");
}
