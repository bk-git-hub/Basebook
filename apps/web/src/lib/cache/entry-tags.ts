const DEMO_OWNER_ID = "demo-user-001";

export const ENTRIES_LIST_TAG = `basebook:entries:list:${DEMO_OWNER_ID}`;

export function getEntryTag(entryId: string) {
  return `basebook:entry:${DEMO_OWNER_ID}:${entryId}`;
}
