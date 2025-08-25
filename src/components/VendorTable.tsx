import { Box } from "@mui/material";
import DataTable from "./DataTable"; // Adjust the import path if needed
import { useAuth } from "../context/AuthContext";
import { validateField } from "../utils/validation";

const CustomerTable: React.FC = () => {
    const { hasPermission } = useAuth();

    const columns = [
        { field: "id", dbField: "id", headerName: "ID", width: 90, editable:false },
        { field: "name", dbField: "name", headerName: "Vendor Name", width: 150, editable: hasPermission(["manageVendors"]), validate: (value:string) => validateField('name',value, true) },
        { field: "email", dbField: "email", headerName: "Email", width: 200, editable: hasPermission(["manageVendors"]), validate: (value:string) => validateField('email',value, true) },
        { field: "website", dbField: "website", headerName: "Website", width: 150, editable: hasPermission(["manageVendors"]), validate: (value:string) => validateField('required',value, true) },
        ];

    return (
        <Box sx={{ flexGrow: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", p: 2 }}>

            <DataTable
                tableName="vendors"
                columns={columns}
                defaultRowData={{
                    name: "",
                    email: "",
                    website: "",
                }}
                editPermissions = {hasPermission(["manageVendors"])}
                sortColumn="name"
            />
        </Box>
    );
};

export default CustomerTable;
