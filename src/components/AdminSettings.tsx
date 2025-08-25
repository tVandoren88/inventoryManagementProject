import { Box, TextField, Typography, Button, InputAdornment } from "@mui/material";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface AdminSettingsProps {}

const AdminSettings: React.FC<AdminSettingsProps> = () => {
    const [margin, setMargin] = useState<number | "">("");
    const [tax, setTax] = useState<number | "">("");

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase
                .from("settings")
                .select("margin, tax")
                .limit(1)
                .single();
            console.log(data)
            if (data) {
                setMargin(data.margin);
                setTax(data.tax);
            }
        };
        fetchSettings();
    }, []);

    const handleUpdate = async () => {
        if (margin === "" || tax === "") return;

        const { error } = await supabase
            .from("settings")
            .update({ margin, tax })
            .limit(1);

        if (error) {
            console.error("Error updating settings:", error);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, margin: "auto", p: 2 }}>
            <Typography variant="h5" sx={{ textAlign: "center", mb: 2 }}>
                Settings
            </Typography>
            <TextField
                label="Margin"
                type="number"
                fullWidth
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value) || "")}
                sx={{ mb: 2 }}
                slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    },
                  }}
            />
            <TextField
                label="Tax"
                type="number"
                fullWidth
                value={tax}
                onChange={(e) => setTax(Number(e.target.value) || "")}
                sx={{ mb: 2 }}
                slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    },
                  }}
            />
            <Button variant="contained" color="primary" fullWidth onClick={handleUpdate}>
                Save Settings
            </Button>
        </Box>
    );
};

export default AdminSettings;
