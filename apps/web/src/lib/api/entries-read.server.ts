import "server-only";

import type { GetEntriesQuery } from "@basebook/contracts";
import { cacheLife, cacheTag } from "next/cache";

import { ENTRIES_LIST_TAG } from "@/lib/cache/entry-tags";

import { getEntries } from "./entries";

export async function getCachedEntries(query: GetEntriesQuery = {}) {
  "use cache";

  cacheLife("minutes");
  cacheTag(ENTRIES_LIST_TAG);

  return getEntries(query);
}
