import { Box } from "@mui/material";
import DataTable from "./DataTable"; // Adjust the import path if needed
import { useAuth } from "../context/AuthContext";
import { validateField } from "../utils/validation";

const CustomerTable: React.FC = () => {
    const { hasPermission } = useAuth();

    const columns = [
        { field: "id", dbField: "id", headerName: "ID", width: 90, editable:false },
        { field: "company", dbField: "company", headerName: "Company", width: 150, editable: hasPermission(["manageCustomers"]), validate: (value:string) => validateField('name',value, true) },
        { field: "email", dbField: "email", headerName: "Email", width: 200, editable: hasPermission(["manageCustomers"]), validate: (value:string) => validateField('email',value, true) },
        { field: "phone", dbField: "phone", headerName: "Company Phone", width: 150, editable: hasPermission(["manageCustomers"]), validate: (value:string) => validateField('phone',value, true) },
        { field: "address", dbField: "address", headerName: "Company Address", width: 150, editable: hasPermission(["manageCustomers"]), validate: (value:string) => validateField('required',value, true) },
        { field: "poc_name", dbField: "poc_name", headerName: "Point of Contact Name", width: 150, editable: hasPermission(["manageCustomers"]), validate: (value:string) => validateField('name',value, false) },
        { field: "poc_email", dbField: "poc_email", headerName: "POC Email", width: 150, editable: hasPermission(["manageCustomers"]), validate: (value:string) => validateField('email',value, false) },
        { field: "billing_name", dbField: "billing_name", headerName: "Billing Name", width: 150, editable: hasPermission(["manageCustomers"]), validate: (value:string) => validateField('name',value, false) },
        { field: "billing_email", dbField: "billing_email", headerName: "Billing Email", width: 150, editable: hasPermission(["manageCustomers"]), validate: (value:string) => validateField('email',value, false)},
    ];

    return (
        <Box sx={{ width: "100%", alignItems: "stretch", p: 2 }}>

            <DataTable
                tableName="customers"
                columns={columns}
                defaultRowData={{
                    company: "",
                    email: "",
                    phone: "",
                    address: "",
                    poc_name: "",
                    poc_email: "",
                    billing_name: "",
                    billing_email: "",
                }}
                editPermissions = {hasPermission(["manageCustomers"])}
                sortColumn="company"
            />
        </Box>
    );
};

export default CustomerTable;
