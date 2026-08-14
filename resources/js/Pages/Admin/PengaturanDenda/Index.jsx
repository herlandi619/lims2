import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout'; // 👈 Sesuaikan path file AdminLayout Anda

export default function Index({ pengaturan }) {
    const { flash } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        denda_per_hari: pengaturan?.denda_per_hari || 0,
        denda_rusak_ringan: pengaturan?.denda_rusak_ringan || 0,
        denda_rusak_berat: pengaturan?.denda_rusak_berat || 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.pengaturan-denda.update'));
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
                ⚙️ Pengaturan Tarif Denda
            </h2>

            {flash?.success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                    {flash.success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Denda Per Hari */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Denda Keterlambatan (Per Hari)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Rp</span>
                        </div>
                        <input
                            type="number"
                            value={data.denda_per_hari}
                            onChange={(e) => setData('denda_per_hari', e.target.value)}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="5000"
                        />
                    </div>
                    {errors.denda_per_hari && <p className="text-red-500 text-xs mt-1">{errors.denda_per_hari}</p>}
                </div>

                {/* Denda Rusak Ringan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Denda Kerusakan Ringan
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Rp</span>
                        </div>
                        <input
                            type="number"
                            value={data.denda_rusak_ringan}
                            onChange={(e) => setData('denda_rusak_ringan', e.target.value)}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="25000"
                        />
                    </div>
                    {errors.denda_rusak_ringan && <p className="text-red-500 text-xs mt-1">{errors.denda_rusak_ringan}</p>}
                </div>

                {/* Denda Rusak Berat */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Denda Kerusakan Berat / Hilang
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Rp</span>
                        </div>
                        <input
                            type="number"
                            value={data.denda_rusak_berat}
                            onChange={(e) => setData('denda_rusak_berat', e.target.value)}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="50000"
                        />
                    </div>
                    {errors.denda_rusak_berat && <p className="text-red-500 text-xs mt-1">{errors.denda_rusak_berat}</p>}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// 👈 Menerapkan Persistent Layout untuk Inertia.js
Index.layout = (page) => <AdminLayout header="Pengaturan Denda">{page}</AdminLayout>;