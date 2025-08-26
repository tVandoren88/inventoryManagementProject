import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { ROLE_PERMISSIONS } from "../utils/permissions";
import { hardResetAuth } from "../utils/recovery";

interface AuthContextType {
  user: any | null;
  role: string | null;
  company_id: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null; role?: string | null; company_id?: string | null }>;
  logout: () => Promise<void>;
  hasPermission: (requiredRoles: string[]) => boolean;
  checkLicense: (companyId?: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [company_id, setCompanyID] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const hydrateProfile = async (uid: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, company_id")
        .eq("id", uid)
        .single();
      if (error) {
        console.error("hydrateProfile error:", error);
        setRole(null);
        setCompanyID(null);
        return { role: null as string | null, company_id: null as string | null };
      }
      setRole(data.role);
      setCompanyID(data.company_id);
      return { role: data.role as string | null, company_id: data.company_id as string | null };
    };

    const init = async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUser = sessionData?.session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await hydrateProfile(currentUser.id);
        } else {
          setRole(null);
          setCompanyID(null);
        }
      } catch (e: any) {
        const msg = String(e?.message || "").toLowerCase();
        // Auto-recover from IndexedDB corruption (“snappy”, “corruption”, etc.)
        if (msg.includes("snappy") || msg.includes("indexeddb") || msg.includes("corruption")) {
          console.warn("Detected storage corruption, performing hard auth reset…", e);
          try { await supabase.auth.signOut(); } catch {}
          await hardResetAuth();
          window.location.assign("/login");
          return; // stop init flow
        }
        console.error("Unexpected auth init error:", e);
        setUser(null);
        setRole(null);
        setCompanyID(null);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (event === "SIGNED_OUT") {
        setRole(null);
        setCompanyID(null);
        setLoading(false);
        return;
      }

      if (sessionUser) {
        setLoading(true);
        await hydrateProfile(sessionUser.id);
        setLoading(false);
      } else {
        setRole(null);
        setCompanyID(null);
        setLoading(false);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const checkLicense = async (companyId?: string) => {
    const idToCheck = companyId || company_id;
    if (!idToCheck) throw new Error("No company ID available");

    const { data, error } = await supabase
      .from("licenses")
      .select("status, expiration_date")
      .eq("company_id", idToCheck)
      .single();

    if (error || !data) throw new Error("License not found.");

    const expired = new Date(data.expiration_date) < new Date();
    if (data.status !== "Active" || expired) throw new Error("License is invalid or expired.");

    return data.status as string;
  };

  const hasPermission = (requiredRoles: string[]) => {
    if (!role) return false;
    return requiredRoles.some((r) => ROLE_PERMISSIONS[role]?.includes(r));
  };

  // Normalize email to avoid case-sensitivity issues
  const login = async (email: string, password: string) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    const sessionUser = data.user ?? data.session?.user ?? null;
    let nextRole: string | null = null;
    let nextCompany: string | null = null;

    if (sessionUser) {
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("role, company_id")
        .eq("id", sessionUser.id)
        .single();

      if (!profErr && prof) {
        setUser(sessionUser);
        setRole(prof.role);
        setCompanyID(prof.company_id);
        nextRole = prof.role ?? null;
        nextCompany = prof.company_id ?? null;
      } else {
        console.error("login hydrate error:", profErr);
        setUser(sessionUser);
        setRole(null);
        setCompanyID(null);
      }
    }

    setLoading(false);
    return { error: null, role: nextRole, company_id: nextCompany };
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) console.error("signOut error:", error);

    // Force-clear local auth state regardless of error
    setUser(null);
    setRole(null);
    setCompanyID(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, role, company_id, loading, login, logout, hasPermission, checkLicense }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
