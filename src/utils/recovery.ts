// src/utils/recovery.ts
export async function hardResetAuth() {
  try {
    // Clear web storages
    localStorage.clear();
    sessionStorage.clear();

    // Best-effort: delete all IndexedDB DBs (Chromium-based browsers)
    // @ts-ignore - databases() isn’t in TS lib DOM yet
    if (indexedDB && typeof indexedDB.databases === "function") {
      // @ts-ignore
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        const name = db?.name;
        if (name) {
          try { indexedDB.deleteDatabase(name); } catch { /* ignore */ }
        }
      }
    }
  } catch {
    // ignore; this is best-effort cleanup
  }
}
