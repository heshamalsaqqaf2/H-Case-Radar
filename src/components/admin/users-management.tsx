"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAssignRole,
  useRemoveRole,
  useRoles,
  useUsersWithRoles,
} from "@/lib/authorization/hooks/admin/use-users";

export function UsersManagement() {
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useUsersWithRoles();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const assignRoleMutation = useAssignRole();
  const removeRoleMutation = useRemoveRole();

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      await assignRoleMutation.mutateAsync({
        userId: selectedUser,
        roleId: selectedRole,
      });
      setSelectedUser("");
      setSelectedRole("");
    } catch (error) {
      console.error("Failed to assign role:", error);
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      await removeRoleMutation.mutateAsync({
        userId,
        roleId,
      });
    } catch (error) {
      console.error("Failed to remove role:", error);
    }
  };

  if (usersLoading || rolesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (usersError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <h3 className="font-bold">Error Loading Users</h3>
            <p>{usersError.message}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-2"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assign Role Card */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Role to User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end flex-col md:flex-row">
            <div className="flex-1 space-y-2 w-full">
              <label htmlFor="user" className="text-sm font-medium">
                Select User
              </label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2 w-full">
              <label htmlFor="role" className="text-sm font-medium">
                Select Role
              </label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAssignRole}
              disabled={
                !selectedUser || !selectedRole || assignRoleMutation.isPending
              }
              className="w-full md:w-auto"
            >
              {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role: any) => (
                              <Badge
                                key={role.id}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {role.name}
                                <Button
                                  onClick={() =>
                                    handleRemoveRole(user.id, role.id)
                                  }
                                  disabled={removeRoleMutation.isPending}
                                  className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground rounded flex items-center justify-center text-xs"
                                >
                                  ×
                                </Button>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No roles
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No users found in the system.</p>
              <p className="text-sm mt-2">
                Make sure you have users in your database.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
