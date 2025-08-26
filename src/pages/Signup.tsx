import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async () => {
        setLoading(true);
        setError(null);const
        normalizedEmail = email.trim().toLowerCase();
        const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password});
        if (error){
             setError(error.message);
        }
        else if (data.user){
            const { error: profileError } = await supabase
                .from("profiles")
                .insert([{ id: data.user.id, email: data.user.email }]);
            if (profileError) {
                setError(profileError.message);
            } else {
                navigate("/dashboard"); // Redirect to dashboard after signup
            }
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, p: 3, boxShadow: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>Sign Up</Typography>
                {error && <Typography color="error">{error}</Typography>}
                <TextField label="Email" fullWidth margin="normal" onChange={(e) => setEmail(e.target.value)} />
                <TextField label="Password" type="password" fullWidth margin="normal" onChange={(e) => setPassword(e.target.value)} />
                <Button variant="contained" color="primary" fullWidth onClick={handleSignup} disabled={loading}>
                    {loading ? "Signing up..." : "Sign Up"}
                </Button>
                <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
                    Already have an account? <Link to="/login">Log in</Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default Signup;
