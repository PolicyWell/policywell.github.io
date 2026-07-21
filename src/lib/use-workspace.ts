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
import {
  loadActiveClientId,
  loadClientsRaw,
  loadDocuments,
  loadFeedback,
  loadOnboardingRaw,
  loadProfile,
  loadSession,
  saveActiveClientId,
  saveClientsRaw,
  saveDocuments,
  saveFeedback,
  saveOnboardingRaw,
  saveProfile,
  saveSession,
} from "./storage";

const EVENT = "policywell-store-change";
const onboardingBoot = new Map<string, OnboardingState>();

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

export function useSession(): SessionUser | null {
  return useSyncExternalStore(subscribe, loadSession, () => null);
}

export function useProfile(): UserProfile | null {
  return useSyncExternalStore(subscribe, loadProfile, () => null);
}

export function useDocuments(): IngestedDocument[] {
  return useSyncExternalStore(subscribe, loadDocuments, () => []);
}

export function useFeedbackEntries(): FeedbackEntry[] {
  return useSyncExternalStore(subscribe, loadFeedback, () => []);
}

function readOnboarding(session: SessionUser | null): OnboardingState | null {
  if (!session) return null;
  const raw = loadOnboardingRaw();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as OnboardingState;
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
  const getSnapshot = useCallback(
    () => readOnboarding(session),
    [session],
  );

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

let clientsCache: { raw: string; parsed: ClientRecord[] } | null = null;

function readClients(): ClientRecord[] {
  const raw = loadClientsRaw();
  if (!raw) return [];
  if (clientsCache?.raw === raw) return clientsCache.parsed;
  try {
    const parsed = JSON.parse(raw) as ClientRecord[];
    clientsCache = { raw, parsed };
    return parsed;
  } catch {
    return [];
  }
}

export function useClients(): ClientRecord[] {
  return useSyncExternalStore(subscribe, readClients, () => []);
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
