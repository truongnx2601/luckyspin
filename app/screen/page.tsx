'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ScreenPage() {
  const { data } = useSWR('/api/screen', fetcher, {
    refreshInterval: 2000,
  })

  const latest = data?.latest
  const stats = data?.stats ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-100 p-10">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* ===== TITLE ===== */}
        <h1 className="text-6xl font-extrabold text-center text-slate-800 tracking-wide">
          KẾT QUẢ QUAY THƯỞNG
        </h1>

        {/* ===== LATEST WINNER ===== */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem]
          shadow-[0_40px_80px_rgba(0,0,0,0.15)]
          border border-white p-14">

          {latest ? (
            <div className="grid grid-cols-2 gap-10 text-slate-800">
              <div className="space-y-4 text-2xl">
                <p><b>Mã NV:</b> {latest.employeeCode}</p>
                <p><b>Họ tên:</b> {latest.fullName}</p>
                <p><b>Trung tâm:</b> {latest.center}</p>
                <p><b>Voucher:</b> {latest.voucherCode}</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center animate-pulse">
                  <p className="text-3xl text-slate-500 mb-4">
                    Phần thưởng
                  </p>
                  <p className="text-6xl font-extrabold text-yellow-500">
                    {latest.prizeName}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-4xl text-center text-slate-400">
              Đang chờ lượt quay tiếp theo…
            </p>
          )}
        </div>

        {/* ===== STATISTICS ===== */}
        <div className="bg-white rounded-3xl shadow-md p-10">
          <h2 className="text-3xl font-bold text-slate-700 mb-6">
            Thống kê giải thưởng
          </h2>

          <table className="w-full text-xl border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600">
                <th className="p-4 text-left">Giải</th>
                <th className="p-4 text-center">Tổng</th>
                <th className="p-4 text-center">Đã trúng</th>
                <th className="p-4 text-center">Còn lại</th>
              </tr>
            </thead>

            <tbody>
              {stats.map((p: {
                prizeName: string
                total: number
                used: number
                remaining: number
              }) => (
                <tr key={p.prizeName} className="border-t">
                  <td className="p-4 font-semibold">{p.prizeName}</td>
                  <td className="p-4 text-center">{p.total}</td>
                  <td className="p-4 text-center text-green-600">
                    {p.used}
                  </td>
                  <td className="p-4 text-center text-red-600">
                    {p.remaining}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
