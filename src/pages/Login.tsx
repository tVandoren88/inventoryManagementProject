import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { TextField, Button, Container, Typography, Box, Link } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { role, checkLicense } = useAuth();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault(); // Prevent page refresh
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error){
             setError(error.message);
        }
        else{
            try {
                await checkLicense(); // Ensure license is valid before navigating
                if (role != "Inactive")
                {
                    navigate("/dashboard");
                }
            } catch (licenseError) {
                setError("Invalid or expired license.");
            }
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="xs">
            <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ mt: 8, p: 3, boxShadow: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>Login</Typography>
                {error && <Typography color="error">{error}</Typography>}
                <TextField label="Email" fullWidth margin="normal" onChange={(e) => setEmail(e.target.value)} />
                <TextField label="Password" type="password" fullWidth margin="normal" onChange={(e) => setPassword(e.target.value)} />
                <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleLogin} disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </Button>
                {/* <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
                    Don't have an account?<Link href="/signup" variant="body2" display="block" gutterBottom>Sign up</Link>
                </Typography> */}
            </Box>
        </Container>
    );
};

export default Login;
