import { error } from "console"

export const validationRules = {
    name: {
        pattern: /^[A-Za-z\s-]+$/,
        errorMessage: "Invalid name format",
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessage: "Invalid email format",
    },
    phone: {
        pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        errorMessage: "Invalid phone number",
    },
    price: {
        pattern: /^\d+(?:[.,]\d+)*$/,
        errorMessage: "Invalid price"
    },
    number: {
        pattern: /^\d+$/,
        errorMessage: "Invalid contains more than numbers"
    },
    required: {
        errorMessage: "This field is required",
    }
} as const;

export const validateField = (name: string, value: string, required: boolean = false): string | null => {
    // Check required field
    if (required && !value) {
        return validationRules.required.errorMessage;
    }
    if(value){
        // Check if there's a validation rule for this field
        const rule = validationRules[name as keyof typeof validationRules];

        // Ensure the rule has a pattern before testing
        if (rule && "pattern" in rule && !rule.pattern.test(value)) {
            return rule.errorMessage;
        }
    }
    return null; // No validation errors
};
