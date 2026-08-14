import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ auth, users, filters, flash }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // Form Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'mahasiswa',
        nim: '',
        nip: '',
        no_hp: '',
        status: true,
    });

    // Handling Flash Messages with SweetAlert
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: flash.success,
                timer: 2000,
                showConfirmButton: false,
            });
        }
        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: flash.error,
            });
        }
    }, [flash]);

    // Filter Search & Role Handle
    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route('admin.users.index'),
            { search: search, role: selectedRole },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setSelectedRole('');
        router.get(route('admin.users.index'), {}, { preserveState: true, replace: true });
    };

    // Modal Open/Close Controls
    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditMode(false);
        setEditId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        clearErrors();
        setEditMode(true);
        setEditId(user.id);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            nim: user.nim || '',
            nip: user.nip || '',
            no_hp: user.no_hp || '',
            status: Boolean(user.status),
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    // Submit Handler Form (Tambah / Edit)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            put(route('admin.users.update', editId), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    // Delete User Handler
    const handleDelete = (user) => {
        Swal.fire({
            title: 'Hapus User?',
            text: `Apakah Anda yakin ingin menghapus user "${user.name}"? Data tidak dapat dikembalikan!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.users.destroy', user.id));
            }
        });
    };

    // Toggle Status User Handler
    const handleToggleStatus = (user) => {
        const nextStatus = user.status ? 'Menonaktifkan' : 'Mengaktifkan';
        Swal.fire({
            title: `${nextStatus} Akun?`,
            text: `Anda akan ${nextStatus.toLowerCase()} akun ${user.name}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: user.status ? '#e11d48' : '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Lanjutkan!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admin.users.toggle-status', user.id));
            }
        });
    };

    // Role Badge Styling Helper
    const getRoleBadge = (role) => {
        const badges = {
            admin: 'bg-purple-100 text-purple-800 border-purple-200',
            kepala_laboran: 'bg-blue-100 text-blue-800 border-blue-200',
            laboran: 'bg-teal-100 text-teal-800 border-teal-200',
            dosen: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            mahasiswa: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
        return badges[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen User & Role</h2>}>
            <Head title="Manajemen User" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Table & Action Bar */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Daftar Pengguna Sistem</h3>
                            <p className="text-sm text-gray-500">Kelola akun, alokasi role, NIM/NIP, serta status aktivasi user.</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition self-start lg:self-auto"
                        >
                            + Tambah User Baru
                        </button>
                    </div>

                    {/* Filter & Search Bar */}
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        <input
                            type="text"
                            className="rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Cari Nama, Email, NIM, NIP..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 capitalize"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="">Semua Role</option>
                            <option value="admin">Admin</option>
                            <option value="kepala_laboran">Kepala Laboran</option>
                            <option value="laboran">Laboran</option>
                            <option value="dosen">Dosen</option>
                            <option value="mahasiswa">Mahasiswa</option>
                        </select>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition"
                            >
                                Filter
                            </button>
                            {(filters.search || filters.role) && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Table View */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">NIM / NIP</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No HP</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="font-semibold text-gray-800">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border uppercase ${getRoleBadge(user.role)}`}>
                                                    {user.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                                {user.nim ? `NIM: ${user.nim}` : user.nip ? `NIP: ${user.nip}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                                {user.no_hp || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                        user.status
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                                    }`}
                                                >
                                                    {user.status ? 'Aktif' : 'Nonaktif'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center space-x-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-md font-medium text-xs transition"
                                                >
                                                    Edit
                                                </button>
                                                {user.id !== auth.user.id && (
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md font-medium text-xs transition"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                                            Tidak ada data pengguna yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.links && users.links.length > 3 && (
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                Menampilkan <span className="font-semibold">{users.from || 0}</span> sampai{' '}
                                <span className="font-semibold">{users.to || 0}</span> dari{' '}
                                <span className="font-semibold">{users.total}</span> user
                            </div>
                            <div className="inline-flex space-x-1">
                                {users.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 text-xs rounded-md border ${
                                            link.active
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                        }`}
                                        preserveState
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Box Form (Tambah/Edit User) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl relative">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            {editMode ? 'Edit Data User' : 'Tambah User Baru'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                    Password {editMode && <span className="text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span>}
                                </label>
                                <input
                                    type="password"
                                    className="w-full rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required={!editMode}
                                />
                                {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Role / Hak Akses</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 capitalize"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="kepala_laboran">Kepala Laboran</option>
                                        <option value="laboran">Laboran</option>
                                        <option value="dosen">Dosen</option>
                                        <option value="mahasiswa">Mahasiswa</option>
                                    </select>
                                    {errors.role && <p className="text-xs text-rose-500 mt-1">{errors.role}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Status</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value === 'true')}
                                    >
                                        <option value="true">Aktif</option>
                                        <option value="false">Nonaktif</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">NIM (Mahasiswa)</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Opsional"
                                        value={data.nim}
                                        onChange={(e) => setData('nim', e.target.value)}
                                    />
                                    {errors.nim && <p className="text-xs text-rose-500 mt-1">{errors.nim}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">NIP (Dosen/Laboran)</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Opsional"
                                        value={data.nip}
                                        onChange={(e) => setData('nip', e.target.value)}
                                    />
                                    {errors.nip && <p className="text-xs text-rose-500 mt-1">{errors.nip}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">No HP</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="08xxxxxxxxxx"
                                    value={data.no_hp}
                                    onChange={(e) => setData('no_hp', e.target.value)}
                                />
                                {errors.no_hp && <p className="text-xs text-rose-500 mt-1">{errors.no_hp}</p>}
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}