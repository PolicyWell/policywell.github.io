import type {
  FeedbackEntry,
  IngestedDocument,
  SessionUser,
  UserProfile,
} from "./types";

const PROFILE_KEY = "policywell_profile";
const DOCS_KEY = "policywell_documents";
const SESSION_KEY = "policywell_session";
const FEEDBACK_KEY = "policywell_feedback";
const ONBOARDING_KEY = "policywell_onboarding";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function saveSession(user: SessionUser | null) {
  if (!canUseStorage()) return;
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function loadSession(): SessionUser | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile) {
  if (!canUseStorage()) return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): UserProfile | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveDocuments(docs: IngestedDocument[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
}

export function loadDocuments(): IngestedDocument[] {
  if (!canUseStorage()) return [];
  const raw = localStorage.getItem(DOCS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as IngestedDocument[];
  } catch {
    return [];
  }
}

export function saveFeedback(entries: FeedbackEntry[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(entries));
}

export function loadFeedback(): FeedbackEntry[] {
  if (!canUseStorage()) return [];
  const raw = localStorage.getItem(FEEDBACK_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FeedbackEntry[];
  } catch {
    return [];
  }
}

export function saveOnboardingRaw(raw: string) {
  if (!canUseStorage()) return;
  localStorage.setItem(ONBOARDING_KEY, raw);
}

export function loadOnboardingRaw(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(ONBOARDING_KEY);
}

export function clearWorkspaceData() {
  if (!canUseStorage()) return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(DOCS_KEY);
  localStorage.removeItem(FEEDBACK_KEY);
  localStorage.removeItem(ONBOARDING_KEY);
}
