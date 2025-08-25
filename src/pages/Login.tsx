import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { checkLicense } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Attempting login with:", { email, password });

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }

      // Check license and get role
      const role = await checkLicense();
      if (!role || role === "Inactive") {
        setError("Invalid or expired license.");
        setLoading(false);
        return;
      }

      // Successful login
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{ mt: 8, p: 3, boxShadow: 3, borderRadius: 2 }}
      >
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>

        {error && <Typography color="error">{error}</Typography>}

        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
