import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2", // Customize primary color
        },
        secondary: {
            main: "#dc004e", // Customize secondary color
        },
    },
    typography: {
        fontFamily: "Arial, sans-serif", // Set a global font
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8, // Rounded buttons globally
                    textTransform: "none", // Disable uppercase text
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                "::-webkit-scrollbar": {
                    width: "8px",
                    height: "8px",
                },
                "::-webkit-scrollbar-track": {
                    background: "#f0f0f0", // Light gray track
                    borderRadius: "10px",
                },
                "::-webkit-scrollbar-thumb": {
                    background: "#bbb", // Medium gray thumb
                    borderRadius: "10px",
                    transition: "background 0.3s ease",
                },
                "::-webkit-scrollbar-thumb:hover": {
                    background: "#888", // Darker gray on hover
                },
                "*": {
                    scrollbarWidth: "thin", // Firefox support
                    scrollbarColor: "#bbb #f0f0f0",
                },
            },
        },
    },
});

export default theme;
