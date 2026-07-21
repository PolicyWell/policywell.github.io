"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createOnboardingState } from "./onboarding";
import type {
  FeedbackEntry,
  IngestedDocument,
  OnboardingState,
  SessionUser,
  UserProfile,
} from "./types";
import type { ClientRecord } from "./clients";
import type { ScoreSnapshot } from "./history";
import type { Recommendation } from "./recommendations";
import type { FollowUpTask } from "./tasks";
import {
  loadActiveClientId,
  loadClientsRaw,
  loadDocumentsRaw,
  loadFeedbackRaw,
  loadHistoryRaw,
  loadRecommendationsRaw,
  loadTasksRaw,
  loadOnboardingRaw,
  loadProfile,
  loadSession,
  saveActiveClientId,
  saveClientsRaw,
  saveDocuments,
  saveFeedback,
  saveHistoryRaw,
  saveRecommendationsRaw,
  saveTasksRaw,
  saveOnboardingRaw,
  saveProfile,
  saveSession,
} from "./storage";

const EVENT = "policywell-store-change";
const onboardingBoot = new Map<string, OnboardingState>();

/**
 * useSyncExternalStore requires getSnapshot to return a cached reference when
 * data is unchanged. Returning a fresh [] / JSON.parse() every call causes
 * React error #185 (maximum update depth exceeded) and blank "couldn't load" pages.
 */
function makeJsonSnapshot<T>(read: () => string | null, fallback: T): () => T {
  let cache: { raw: string; parsed: T } | null = null;
  return () => {
    const raw = read();
    if (!raw) return fallback;
    if (cache?.raw === raw) return cache.parsed;
    try {
      const parsed = JSON.parse(raw) as T;
      cache = { raw, parsed };
      return parsed;
    } catch {
      return fallback;
    }
  };
}

function makeObjectSnapshot<T>(
  load: () => T | null,
  serialize: (value: T) => string,
): () => T | null {
  let cache: { raw: string; parsed: T } | null = null;
  return () => {
    const value = load();
    if (value == null) return null;
    const raw = serialize(value);
    if (cache?.raw === raw) return cache.parsed;
    cache = { raw, parsed: value };
    return value;
  };
}

export function notifyStore() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

const readSession = makeObjectSnapshot(loadSession, (v) => JSON.stringify(v));
const readProfile = makeObjectSnapshot(loadProfile, (v) => JSON.stringify(v));

export function useSession(): SessionUser | null {
  return useSyncExternalStore(subscribe, readSession, () => null);
}

export function useProfile(): UserProfile | null {
  return useSyncExternalStore(subscribe, readProfile, () => null);
}

const EMPTY_DOCS: IngestedDocument[] = [];
const readDocuments = makeJsonSnapshot<IngestedDocument[]>(
  loadDocumentsRaw,
  EMPTY_DOCS,
);

export function useDocuments(): IngestedDocument[] {
  return useSyncExternalStore(subscribe, readDocuments, () => EMPTY_DOCS);
}

const EMPTY_FEEDBACK: FeedbackEntry[] = [];
const readFeedback = makeJsonSnapshot<FeedbackEntry[]>(
  loadFeedbackRaw,
  EMPTY_FEEDBACK,
);

export function useFeedbackEntries(): FeedbackEntry[] {
  return useSyncExternalStore(subscribe, readFeedback, () => EMPTY_FEEDBACK);
}

let onboardingRawCache: { raw: string; parsed: OnboardingState } | null = null;

function readOnboarding(session: SessionUser | null): OnboardingState | null {
  if (!session) return null;
  const raw = loadOnboardingRaw();
  if (raw) {
    if (onboardingRawCache?.raw === raw) {
      onboardingBoot.set(session.id, onboardingRawCache.parsed);
      return onboardingRawCache.parsed;
    }
    try {
      const parsed = JSON.parse(raw) as OnboardingState;
      onboardingRawCache = { raw, parsed };
      onboardingBoot.set(session.id, parsed);
      return parsed;
    } catch {
      /* fallthrough */
    }
  }
  const cached = onboardingBoot.get(session.id);
  if (cached) return cached;
  const created = createOnboardingState(
    session.id,
    session.role,
    session.name,
    session.email,
  );
  onboardingBoot.set(session.id, created);
  return created;
}

export function useOnboardingState(
  session: SessionUser | null,
): [OnboardingState | null, (next: OnboardingState) => void] {
  const getSnapshot = useCallback(() => readOnboarding(session), [session]);

  const state = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const setState = useCallback(
    (next: OnboardingState) => {
      if (session) onboardingBoot.set(session.id, next);
      saveOnboardingRaw(JSON.stringify(next));
      notifyStore();
    },
    [session],
  );

  return [state, setState];
}

export function persistSession(user: SessionUser | null) {
  saveSession(user);
  notifyStore();
}

export function persistProfile(profile: UserProfile) {
  saveProfile(profile);
  notifyStore();
}

export function persistDocuments(docs: IngestedDocument[]) {
  saveDocuments(docs);
  notifyStore();
}

export function persistFeedback(entries: FeedbackEntry[]) {
  saveFeedback(entries);
  notifyStore();
}

export function clearOnboardingBoot() {
  onboardingBoot.clear();
}

const EMPTY_CLIENTS: ClientRecord[] = [];
let clientsCache: { raw: string; parsed: ClientRecord[] } | null = null;

function readClients(): ClientRecord[] {
  const raw = loadClientsRaw();
  if (!raw) return EMPTY_CLIENTS;
  if (clientsCache?.raw === raw) return clientsCache.parsed;
  try {
    const parsed = JSON.parse(raw) as ClientRecord[];
    clientsCache = { raw, parsed };
    return parsed;
  } catch {
    return EMPTY_CLIENTS;
  }
}

export function useClients(): ClientRecord[] {
  return useSyncExternalStore(subscribe, readClients, () => EMPTY_CLIENTS);
}

export function useActiveClientId(): string | null {
  return useSyncExternalStore(subscribe, loadActiveClientId, () => null);
}

export function persistClients(clients: ClientRecord[]) {
  saveClientsRaw(JSON.stringify(clients));
  notifyStore();
}

/** Activating a client loads their profile + documents into the shared workspace. */
export function activateClient(client: ClientRecord) {
  saveActiveClientId(client.id);
  saveProfile(client.profile);
  saveDocuments(client.documents);
  notifyStore();
}

const EMPTY_RECS: Recommendation[] = [];
const readRecs = makeJsonSnapshot<Recommendation[]>(
  loadRecommendationsRaw,
  EMPTY_RECS,
);

export function useRecommendations(): Recommendation[] {
  return useSyncExternalStore(subscribe, readRecs, () => EMPTY_RECS);
}

export function persistRecommendations(recs: Recommendation[]) {
  saveRecommendationsRaw(JSON.stringify(recs));
  notifyStore();
}

const EMPTY_HISTORY: ScoreSnapshot[] = [];
const readHistory = makeJsonSnapshot<ScoreSnapshot[]>(
  loadHistoryRaw,
  EMPTY_HISTORY,
);

export function useScoreHistory(): ScoreSnapshot[] {
  return useSyncExternalStore(subscribe, readHistory, () => EMPTY_HISTORY);
}

export function persistScoreHistory(history: ScoreSnapshot[]) {
  saveHistoryRaw(JSON.stringify(history));
  notifyStore();
}

const EMPTY_TASKS: FollowUpTask[] = [];
const readTasks = makeJsonSnapshot<FollowUpTask[]>(loadTasksRaw, EMPTY_TASKS);

export function useTasks(): FollowUpTask[] {
  return useSyncExternalStore(subscribe, readTasks, () => EMPTY_TASKS);
}

export function persistTasks(tasks: FollowUpTask[]) {
  saveTasksRaw(JSON.stringify(tasks));
  notifyStore();
}
