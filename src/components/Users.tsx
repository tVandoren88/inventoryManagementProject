import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Assuming you have this file to initialize Supabase
import { Box, Container, Typography, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Alert } from '@mui/material';
import DataTable from './DataTable';
import { useAuth } from '../context/AuthContext';
import { GridRenderEditCellParams } from '@mui/x-data-grid';

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]); // State to hold users and their roles
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // State to hold error message
  const { hasPermission } = useAuth();
  const dropdownOptions = [
    { label: "Admin", value: "Admin" },
    { label: "User", value: "User" },
    { label: "Service", value: "Service" },
    { label: "Inactive", value: "Inactive" },
  ];
  const columns = [
    { field: "id", dbField: "id", headerName: "ID", width: 90, editable:false },
    { field: 'name', headerName: 'Name', width: 250, editable: true },
    { field: 'email', headerName: 'Email', width: 250, editable: true },
    {
      field: 'role',
      dbfield: 'role',
      headerName: 'Role',
      width: 150,
      editable: true, // Make the role column editable
      renderEditCell: (params: GridRenderEditCellParams) => {
        const { id, field, value, api } = params;

        return (
          <Select
            value={value || ""}
            onChange={(event) => {
              api.setEditCellValue({ id, field, value: event.target.value });
              api.stopRowEditMode({ id });
            }}
            fullWidth
          >
            {dropdownOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
  ];

  // Fetch users and roles from user_profiles view on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch user details (email, role, etc.) from the user_profiles view
        const { data, error: fetchError } = await supabase
          .from('profiles') // Replace with the name of your view
          .select('*');

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        setUsers(data || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId);
  };

  // Handle role change
  const handleRoleChange =  async (params: any):Promise<boolean> =>  {
    console.log(params)
    const userId = params.id;  // Extract userId from the row
    const user = getUserById(userId)
    const newRole = user.role;
    console.log(newRole)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }

      // Update state with the new role
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      return true;
    } catch (error: any) {
      console.error(error);
      setError(error.message);
      return false;
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: '20px' }}>
        User Roles Management
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box>
          <DataTable
                tableName="profiles"
                columns={columns}
                defaultRowData={{
                    company: "",
                    email: "",
                    role:""
                }}
                editPermissions = {hasPermission(["manageUsers"])}
                sortColumn='name'
            />
        </Box>
      )}
    </Container>
  );
};

export default Users;
