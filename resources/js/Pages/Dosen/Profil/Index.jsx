import React, { useState } from 'react';
import DosenLayout from '@/Layouts/DosenLayout';
import { Head, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ user }) {
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Form Hooks Inertia - Update Profile (menggunakan NIP)
    const formProfile = useForm({
        name: user.name || '',
        email: user.email || '',
        nip: user.nip !== '-' ? user.nip : '',
        no_hp: user.no_hp !== '-' ? user.no_hp : '',
        foto: null,
    });

    const formPassword = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const openEditProfileModal = () => {
        formProfile.setData({
            name: user.name || '',
            email: user.email || '',
            nip: user.nip !== '-' ? user.nip : '',
            no_hp: user.no_hp !== '-' ? user.no_hp : '',
            foto: null,
        });
        formProfile.clearErrors();
        setIsProfileModalOpen(true);
    };

    const submitProfile = (e) => {
        e.preventDefault();
        formProfile.post(route('dosen.profil.update'), {
            onSuccess: () => {
                setIsProfileModalOpen(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Data profil berhasil diperbarui.',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
        });
    };

    const openEditPasswordModal = () => {
        formPassword.reset();
        formPassword.clearErrors();
        setIsPasswordModalOpen(true);
    };

    const submitPassword = (e) => {
        e.preventDefault();
        formPassword.post(route('dosen.profil.password.update'), {
            onSuccess: () => {
                setIsPasswordModalOpen(false);
                formPassword.reset();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Password akun Anda berhasil diubah.',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
        });
    };

    return (
        <DosenLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Profil Saya</h2>}>
            <Head title="Profil Pengguna" />

            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                    <div className="bg-indigo-600 h-32 w-full"></div>
                    <div className="px-6 pb-6 relative">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-6 gap-4">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                                <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-md">
                                    {user.foto ? (
                                        <img src={user.foto} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-3xl font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="text-center sm:text-left">
                                    <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                                    <p className="text-sm text-gray-500">Dosen | Bergabung sejak {user.created_at}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={openEditProfileModal}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition"
                                >
                                    ✏️ Edit Profil
                                </button>
                                <button
                                    onClick={openEditPasswordModal}
                                    className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition"
                                >
                                    🔑 Ubah Password
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">NIP (Nomor Induk Pegawai)</label>
                                <p className="text-base font-medium text-gray-800">{user.nip}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Alamat Email</label>
                                <p className="text-base font-medium text-gray-800">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nomor HP/WA</label>
                                <p className="text-base font-medium text-gray-800">{user.no_hp}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status Akun</label>
                                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-200">
                                    Aktif
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL FORM EDIT PROFIL */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-lg rounded-lg p-6 shadow-xl">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Ubah Data Pribadi</h3>
                        <form onSubmit={submitProfile} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formProfile.data.name}
                                    onChange={(e) => formProfile.setData('name', e.target.value)}
                                    required
                                />
                                {formProfile.errors.name && <div className="text-red-500 text-xs mt-1">{formProfile.errors.name}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">NIP</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formProfile.data.nip}
                                    onChange={(e) => formProfile.setData('nip', e.target.value)}
                                />
                                {formProfile.errors.nip && <div className="text-red-500 text-xs mt-1">{formProfile.errors.nip}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formProfile.data.email}
                                    onChange={(e) => formProfile.setData('email', e.target.value)}
                                    required
                                />
                                {formProfile.errors.email && <div className="text-red-500 text-xs mt-1">{formProfile.errors.email}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor HP/WA</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formProfile.data.no_hp}
                                    onChange={(e) => formProfile.setData('no_hp', e.target.value)}
                                />
                                {formProfile.errors.no_hp && <div className="text-red-500 text-xs mt-1">{formProfile.errors.no_hp}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Foto Profil (Kosongkan jika tidak diganti)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full border border-gray-300 rounded p-1.5 text-sm"
                                    onChange={(e) => formProfile.setData('foto', e.target.files[0])}
                                />
                                {formProfile.errors.foto && <div className="text-red-500 text-xs mt-1">{formProfile.errors.foto}</div>}
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsProfileModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formProfile.processing}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                                >
                                    {formProfile.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL FORM UBAH PASSWORD */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Ubah Password Akun</h3>
                        <form onSubmit={submitPassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Password Saat Ini</label>
                                <input
                                    type="password"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formPassword.data.current_password}
                                    onChange={(e) => formPassword.setData('current_password', e.target.value)}
                                    required
                                />
                                {formPassword.errors.current_password && (
                                    <div className="text-red-500 text-xs mt-1">{formPassword.errors.current_password}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Password Baru</label>
                                <input
                                    type="password"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formPassword.data.password}
                                    onChange={(e) => formPassword.setData('password', e.target.value)}
                                    required
                                />
                                {formPassword.errors.password && (
                                    <div className="text-red-500 text-xs mt-1">{formPassword.errors.password}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formPassword.data.password_confirmation}
                                    onChange={(e) => formPassword.setData('password_confirmation', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formPassword.processing}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                                >
                                    {formPassword.processing ? 'Memproses...' : 'Ubah Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DosenLayout>
    );
}