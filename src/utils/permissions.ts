export const ROLE_PERMISSIONS: Record<string, string[]> = {
    Admin: ["view", "manageUsers", "adminSettings", "manageCustomers", "manageUsers", "manageParts", "manageInvoices","viewDashboard", "manageVendors"],
    Manager: ["view", "manageUsers"],
    Inventory: ["view", "manageUsers"],
    Accounting: ["view", "manageUsers", "manageCustomers","test"],
    Service: ["view", "manageUsers"],
    User: ["view"],
};

export const hasPermission = (role: string, permission: string) => {
    return ROLE_PERMISSIONS[role]?.includes(permission);
};
