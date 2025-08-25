import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

const MyAccount: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
        console.log("Fetching user...");
      const { data: user, error } = await supabase.auth.getUser();
      if (error) {
        setError("Error fetching user data");
      } else if (user?.user) {
        setUserId(user.user.id);
        setEmail(user.user.email || "");

        // Fetch additional user data from 'profiles' table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.user.id)
          .single();

        if (profileError) {
          setError("Error fetching profile data");
        } else if (profile) {
          setName(profile.name || "");
        }
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    setSuccess(null);
    setError(null);

    if (!userId) {
      setError("User not found");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Profile updated successfully!");
    }
  };

  const handleUpdateEmail = async (event: React.FormEvent) => {
    event.preventDefault()
    setSuccess(null);
    setError(null);
    if (!email) return setError("Email is required");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Email updated successfully! Please check your email for verification.");
    }
  };

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevents default form submission behavior

    setSuccess(null);
    setError(null);

    if (!password || !confirmPassword) return setError("All fields are required");
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      setLoading(false);

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password updated successfully!");
        setPassword("");
        setConfirmPassword("");

        // Check if the session is still valid
        const session = supabase.auth.getSession();
        if (!session) {
          // You can redirect the user or show a message to reauthenticate
          console.log("Session expired. Please log in again.");
        }
      }
    } catch (err) {
      setLoading(false);
      setError(`Error: ${err}`);
    }
    console.log("test")

  };


  return (
    <Box sx={{ maxWidth: 500, margin: "auto", p: 2 }}>
      <Typography variant="h5" sx={{ textAlign: "center", mb: 2 }}>
        My Account
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      {/* Update Name */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Update Name"}
        </Button>
      </Box>

      {/* Update Email */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleUpdateEmail}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Update Email"}
        </Button>
      </Box>

      {/* Update Password */}
      <Box>
        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
        type="button" // Ensure it's a 'button' and not 'submit'
        variant="contained"
        color="secondary"
        fullWidth
        onClick={handleUpdatePassword}
        disabled={loading}
        >
        {loading ? <CircularProgress size={24} /> : "Update Password"}
        </Button>
      </Box>
    </Box>
  );
};

export default MyAccount;
