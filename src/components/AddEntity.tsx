import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
    Box, TextField, Button, MenuItem, Typography, CircularProgress, Alert, Select, FormControl, InputLabel
} from "@mui/material";
import { validateField } from "../utils/validation"; // Import validation utility
import { capitalizeFirstLetter } from "../utils/formatting";
import { useAuth } from "../context/AuthContext";

const formSchemas = {
    customer: {
        data: [
            { label: "Company Name", name: "company", type: "text", required: true, validate_type: "name" },
            { label: "Email", name: "email", type: "email", required: true, validate_type: "email" },
            { label: "Phone", name: "phone", type: "tel", required: true, validate_type: "phone" },
            { label: "Address", name: "address", type: "text", required: true, validate_type: "required" },
        ],
        table: "customers",
    },
    user: {
        data: [
            { label: "Name", name: "name", type: "text", required: true, validate_type: "name" },
            { label: "Email", name: "email", type: "email", required: true, validate_type: "email" },
            { label: "Password", name: "password", type: "password", required: true, validate_type: "required" },
            {
                label: "Role",
                name: "role",
                type: "select",
                required: false,
                validate_type: "required",
                options: [
                    { label: "Admin", value: "Admin" },
                    { label: "User", value: "User" },
                    { label: "Service", value: "Service" },
                    { label: "Inactive", value: "Inactive", selected: "selected" },
                ],
            },
        ],
        table: "profiles",
    },
    part: {
        data: [
            { label: "Part Name", name: "name", type: "text", required: true, validate_type: "required" },
            { label: "Description", name: "description", type: "text", required: true, validate_type: "required" },
            { label: "Cost of Good", name: "cog", type: "number", required: true, validate_type: "price" },
            { label: "Quantity", name: "quantity", type: "number", required: true, validate_type: "number" },
            { label: "Product Number", name: "product_number", type: "text", required: true, validate_type: "required" },
            {
                label: "Vendor",
                name: "vendor_id",
                type: "select",
                required: false,
                validate_type: "required",
                dynamicOptions: true // Custom flag to indicate this gets populated dynamically
            }
        ],
        table: "parts",
    },
    invoice: {
        data: [
            { label: "Part Name", name: "name", type: "text", required: true, validate_type: "required" },
            { label: "Description", name: "description", type: "text", required: true, validate_type: "required" },
            { label: "Cost of Good", name: "cog", type: "number", required: true, validate_type: "price" },
            { label: "Quantity", name: "quantity", type: "number", required: true, validate_type: "number" },
            { label: "Product Number", name: "product_number", type: "text", required: true, validate_type: "required" },
            { label: "Vendor", name: "vendor", type: "text", required: true, validate_type: "required" },
        ],
        table: "parts",
    },
    vendor: {
        data: [
            { label: "Vendor Name", name: "name", type: "text", required: true, validate_type: "name" },
            { label: "Email", name: "email", type: "email", required: true, validate_type: "email" },
            { label: "Website", name: "website", type: "text", required: true, validate_type: "required" },
        ],
        table: "parts",
    }
};

const AddEntity: React.FC<{ entityType: string }> = ({ entityType }) => {
    const { company_id } = useAuth();
    const fields = formSchemas[entityType]?.data || [];
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [vendorOptions, setVendorOptions] = useState([]);

    useEffect(() => {
        const fetchVendors = async () => {
            const { data, error } = await supabase.from("vendors").select("id, name").eq("company_id", company_id);
            if (!error) {
                setVendorOptions(data);
            }
        };
        if (entityType === 'part') fetchVendors();
    }, [entityType, company_id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: validateField(fields.find(f => f.name === name)?.validate_type, value, fields.find(f => f.name === name)?.required) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(null);
        const newErrors: Record<string, string | null> = {};
        fields.forEach(field => {
            newErrors[field.name] = validateField(field.validate_type, formData[field.name] || "", field.required);
        });
        if (Object.values(newErrors).some(error => error)) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        if (entityType !== 'user') {
            const { error } = await supabase.from(formSchemas[entityType].table).insert([{ ...formData, company_id }]);
            if (error) {
                setLoading(false);
                setErrors({ ...errors, form: `Error adding ${entityType}: ${error.message}` });
                return;
            }
        } else {
            const { email, password, role, name } = formData;
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setLoading(false);
                setErrors({ ...errors, form: `Error adding ${entityType}: ${error.message}` });
                return;
            }
            if (data.user) {
                const { error: profileError } = await supabase.from("profiles").insert([
                    { id: data.user.id, email: data.user.email, role, name, company_id }
                ]);
                if (profileError) {
                    setLoading(false);
                    setErrors({ ...errors, form: `Error adding ${entityType}: ${profileError.message}` });
                    return;
                }
            }
        }
        setLoading(false);
        setSuccess(`${entityType} added successfully!`);
        setFormData({});
        setErrors({});
    };

    return (
        <Box sx={{ maxWidth: 500, margin: "auto", p: 2 }}>
            <Typography variant="h5" sx={{ textAlign: "center", mb: 2 }}>
                Add {capitalizeFirstLetter(entityType)}
            </Typography>
            {errors.form && <Alert severity="error">{errors.form}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <form onSubmit={handleSubmit}>
                {fields.map((field) => (
                    <Box key={field.name} sx={{ mb: 2 }}>
                        {field.type === "select" ? (
                            <FormControl fullWidth error={Boolean(errors[field.name])}>
                                <InputLabel>{field.label}</InputLabel>
                                <Select
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                    required={field.required}
                                    label={field.label}
                                >
                                    {field.dynamicOptions && entityType === 'part'
                                        ? vendorOptions.map((vendor: any) => (
                                            <MenuItem key={vendor.id} value={vendor.id}>{vendor.name}</MenuItem>
                                        ))
                                        : field.options?.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                fullWidth
                                required={field.required}
                                label={field.label}
                                name={field.name}
                                type={field.type}
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                error={Boolean(errors[field.name])}
                                helperText={errors[field.name]}
                            />
                        )}
                    </Box>
                ))}
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Submit"}
                </Button>
            </form>
        </Box>
    );
};

export default AddEntity;
