import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AccessDenied: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                textAlign: "center",
            }}
        >
            <Typography variant="h4" color="error" gutterBottom>
                Access Denied
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                You do not have permission to view this page. Ask your admin for help.
            </Typography>
            {/* <Button variant="contained" color="primary" onClick={() => navigate("/")}>
                Go to Home
            </Button> */}
        </Box>
    );
};

export default AccessDenied;
