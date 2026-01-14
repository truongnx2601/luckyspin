'use client'

import { useState } from 'react'

export default function SpinPage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function spin() {
    if (loading || !code.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Có lỗi xảy ra')
      } else {
        setResult(data.prize)
      }
    } catch {
      setError('Không thể kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center
      bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-100">

      {/* Card */}
      <div className="w-[380px] rounded-3xl p-10
        bg-white/70 backdrop-blur-xl
        border border-white
        shadow-[0_30px_60px_rgba(0,0,0,0.12)]
        text-center">

        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
          Vòng quay may mắn
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Nhập voucher để nhận phần thưởng
        </p>

        {!result && (
          <>
            <input
              className="w-full px-4 py-3 rounded-xl
                bg-white text-slate-800
                border border-slate-200
                focus:outline-none focus:ring-2 focus:ring-yellow-400
                placeholder:text-slate-400 mb-4"
              placeholder="Nhập mã voucher"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <button
              onClick={spin}
              disabled={loading || !code.trim()}
              className="w-full py-3 rounded-xl font-bold text-slate-900
                bg-gradient-to-r from-yellow-300 to-yellow-400
                shadow-md hover:scale-[1.02] transition
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang quay...' : 'QUAY NGAY'}
            </button>

            {error && (
              <p className="mt-4 text-sm text-red-500">
                {error}
              </p>
            )}
          </>
        )}

        {result && (
          <div className="mt-6">
            <p className="text-lg text-slate-500">
              Chúc mừng bạn nhận được
            </p>

            <p className="mt-3 text-4xl font-extrabold
              text-yellow-500 drop-shadow-sm
              animate-pulse">
              {result}
            </p>

            <button
              onClick={() => {
                setResult(null)
                setCode('')
                setError(null)
              }}
              className="mt-8 text-sm text-slate-500
                hover:text-slate-800 underline"
            >
              Quay lại
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
