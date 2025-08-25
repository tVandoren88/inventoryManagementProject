import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ROLE_PERMISSIONS } from "../utils/permissions";

interface AuthContextType {
    user: any | null;
    role: string | null;
    company_id: string | null;
    loading: boolean;
    logout: () => Promise<void>;
    hasPermission: (requiredRoles: string[]) => boolean;
    checkLicense: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [company_id, setCompanyID] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUser = async () => {

            setLoading(true);
            const { data: sessionData } = await supabase.auth.getSession();
            setUser(sessionData?.session?.user || null);
            if (sessionData?.session?.user) {

                setUser(sessionData.session.user);

                const { data, error } = await supabase
                    .from("profiles")
                    .select("role, company_id")
                    .eq("id", sessionData.session.user.id)
                    .single();
                if (!error) {
                    console.log(data.role);
                    setRole(data.role)
                    setCompanyID(data.company_id);
                } else {
                    setRole(null);
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        };

        fetchUser();

        // Listen for auth state changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === "SIGNED_IN" || _event === "SIGNED_OUT") {
                if (session?.user) {
                    setUser(session.user);
                    setLoading(true);
                    supabase
                        .from("profiles")
                        .select("role, company_id")
                        .eq("id", session.user.id)
                        .single()
                        .then(({ data, error }) => {
                            if (!error){
                                setRole(data.role);
                                setCompanyID(data.company_id)
                            }
                            setLoading(false);
                        });
                } else {
                    setUser(null);
                    setRole(null);
                }
            }
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);
    const checkLicense = async () => {
        const { data, error } = await supabase
            .from("licenses")
            .select("status, expiration_date")
            .eq("company_id", company_id)
            .single();

        if (error || !data || data.status !== "Active" || new Date(data.expiration_date) < new Date()) {
            throw new Error("License is invalid or expired.");
        }
    };
    // Function to check if user has permission
    const hasPermission = (requiredRoles: string[]) => {
        if (!role) return false; // Ensure role is set
        return requiredRoles.some((r) => ROLE_PERMISSIONS[role]?.includes(r));
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, company_id, loading, logout, hasPermission, checkLicense }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
