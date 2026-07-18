import "server-only";

import type { GetEntriesQuery } from "@basebook/contracts";
import { cacheLife, cacheTag } from "next/cache";

import {
  ENTRIES_LIST_TAG,
  getEntryTag,
} from "@/lib/cache/entry-tags";

import { getEntries, getEntry } from "./entries";

export async function getCachedEntries(query: GetEntriesQuery = {}) {
  "use cache";

  cacheLife("minutes");
  cacheTag(ENTRIES_LIST_TAG);

  return getEntries(query);
}

export async function getCachedEntry(id: string) {
  "use cache";

  cacheLife("minutes");
  cacheTag(getEntryTag(id));

  return getEntry(id);
}

export async function getFreshEntry(id: string) {
  return getEntry(id);
}
