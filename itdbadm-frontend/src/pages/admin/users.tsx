// pages/admin/users.tsx
import { useState, useEffect } from "react";
import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Edit, Trash2, Search, Users } from "lucide-react";
import { apiClient } from "@/lib/api";

interface User {
    user_id: number;
    username: string;
    email: string;
    role_type: string;
    currency_id: number;
    is_deleted: boolean;
    order_count: number;
    booking_count: number;
}

interface UsersResponse {
    users: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

const roleOptions = [
    { label: "Admin", value: "1" },
    { label: "Staff", value: "2" },
    { label: "Customer", value: "3" },
    { label: "Band Manager", value: "4" },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data: UsersResponse = await apiClient.get(`/admin/users?page=${pagination.page}&limit=${pagination.limit}`);
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;

        try {
            await apiClient.put(`/admin/users/${editingUser.user_id}`, {
                username: editingUser.username,
                email: editingUser.email,
                role_id: parseInt(editingUser.role_type),
            });
            setIsEditModalOpen(false);
            setEditingUser(null);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await apiClient.delete(`/admin/users/${userToDelete.user_id}`);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DefaultLayout>
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Users size={32} className="text-primary" />
                        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                    </div>
                    <p className="text-default-600">Manage system users and their permissions</p>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6">
                    <CardBody>
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <Input
                                placeholder="Search users by username or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                startContent={<Search size={18} className="text-default-400" />}
                                className="max-w-md"
                            />
                            <div className="text-default-600">
                                Total: {pagination.total} users
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">All Users</h3>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Users table">
                            <TableHeader>
                                <TableColumn>USER</TableColumn>
                                <TableColumn>ROLE</TableColumn>
                                <TableColumn>ORDERS</TableColumn>
                                <TableColumn>BOOKINGS</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody
                                items={filteredUsers}
                                isLoading={loading}
                                loadingContent="Loading users..."
                            >
                                {(user) => (
                                    <TableRow key={user.user_id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold">{user.username}</p>
                                                <p className="text-sm text-default-600">{user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role_type === 'Admin' ? 'bg-danger/20 text-danger' :
                                                    user.role_type === 'BandManager' ? 'bg-primary/20 text-primary' :
                                                        'bg-default/20 text-default-600'
                                                }`}>
                                                {user.role_type}
                                            </span>
                                        </TableCell>
                                        <TableCell>{user.order_count}</TableCell>
                                        <TableCell>{user.booking_count}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_deleted ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'
                                                }`}>
                                                {user.is_deleted ? 'Deleted' : 'Active'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    color="primary"
                                                    onPress={() => handleEditUser(user)}
                                                    isIconOnly
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                {!user.is_deleted && (
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        onPress={() => {
                                                            setUserToDelete(user);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        isIconOnly
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {pagination.total_pages > 1 && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    total={pagination.total_pages}
                                    page={pagination.page}
                                    onChange={(page) => setPagination(prev => ({ ...prev, page }))}
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Edit User Modal */}
                <Modal isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <ModalContent>
                        <ModalHeader>Edit User</ModalHeader>
                        <ModalBody>
                            {editingUser && (
                                <div className="space-y-4">
                                    <Input
                                        label="Username"
                                        value={editingUser.username}
                                        onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    />
                                    <Select
                                        label="Role"
                                        selectedKeys={[editingUser.role_type]}
                                        onChange={(e) => setEditingUser({ ...editingUser, role_type: e.target.value })}
                                    >
                                        {roleOptions.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={() => setIsEditModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={handleSaveUser}>
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal isOpen={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <ModalContent>
                        <ModalHeader>Delete User</ModalHeader>
                        <ModalBody>
                            <p>Are you sure you want to delete user <strong>{userToDelete?.username}</strong>?</p>
                            <p className="text-sm text-default-600">
                                This will soft delete the user and prevent them from logging in.
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button color="danger" onPress={handleDeleteUser}>
                                Delete User
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </DefaultLayout>
    );
}