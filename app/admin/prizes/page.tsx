'use client'

import useSWR from 'swr'
import { useEffect, useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function PrizeAdmin() {
  /* ===== LOAD CAMPAIGNS ===== */
  const { data: campaigns } = useSWR('/api/admin/campaigns', fetcher)

  const [selectedCampaign, setSelectedCampaign] = useState('')

  /* ===== LOAD PRIZES BY CAMPAIGN ===== */
  const { data: prizes, mutate } = useSWR(
    selectedCampaign
      ? `/api/admin/prizes?campaignId=${selectedCampaign}`
      : null,
    fetcher
  )

  /* ===== FORM STATE ===== */
  const [name, setName] = useState('')
  const [total, setTotal] = useState('')
  const [weight, setWeight] = useState('1')

  const [verified, setVerified] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!verified) return
  }, [verified])

  /* ===== ADD PRIZE ===== */
  async function addPrize() {
    const totalNum = Number(total)
    const weightNum = Number(weight)

    if (!selectedCampaign) {
      alert('Vui lòng chọn campaign')
      return
    }

    if (
      !name.trim() ||
      !Number.isInteger(totalNum) ||
      totalNum <= 0 ||
      !Number.isInteger(weightNum) ||
      weightNum <= 0
    ) {
      alert('Vui lòng nhập thông tin hợp lệ')
      return
    }

    const ok = confirm(
      `Thêm giải "${name}" (${totalNum} phần, weight ${weightNum})?`
    )
    if (!ok) return

    const res = await fetch('/api/admin/prizes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: selectedCampaign,
        name,
        total: totalNum,
        weight: weightNum,
      }),
    })

    if (!res.ok) {
      alert('Thêm giải thất bại')
      return
    }

    setName('')
    setTotal('')
    setWeight('1')
    mutate()
  }

  /* ===== TOGGLE ACTIVE ===== */
  async function toggleActive(p: any) {
    const ok = confirm(
      `Bạn có chắc muốn ${p.isActive ? 'TẮT' : 'BẬT'} giải "${p.name}"?`
    )
    if (!ok) return

    await fetch(`/api/admin/prizes/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    })

    mutate()
  }

  /* ===== VERIFY ===== */
  async function verify() {
    setError('')

    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      setError('Sai username hoặc password')
      return
    }

    setVerified(true)
  }

  /* ===== LOGIN ===== */
  if (!verified) {
    return (
      <div className="fixed inset-0 flex items-center justify-center
        bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-100">
        <div className="w-96 rounded-3xl p-8 bg-white/80 backdrop-blur-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6">
            Admin Verification
          </h2>

          <input
            className="w-full mb-4 px-4 py-3 rounded-xl border"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="w-full mb-4 px-4 py-3 rounded-xl border"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-500 mb-3 text-center">{error}</p>
          )}

          <button
            onClick={verify}
            className="w-full py-3 rounded-xl text-white font-semibold
              bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            Xác nhận
          </button>
        </div>
      </div>
    )
  }

  /* ===== ADMIN UI ===== */
  return (
    <div className="fixed inset-0 flex items-center justify-center
        bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-100">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-extrabold mb-8">
          Quản lý giải thưởng
        </h1>

        {/* ===== ADD PRIZE ===== */}
        <div className="bg-white rounded-3xl shadow p-6 mb-10">
          <h2 className="text-xl font-bold mb-4">
            Thêm giải thưởng
          </h2>

          <div className="grid grid-cols-4 gap-4">
            {/* ===== SELECT CAMPAIGN ===== */}
            <select
              className="col-span-4 px-4 py-3 rounded-xl border"
              value={selectedCampaign}
              onChange={e => setSelectedCampaign(e.target.value)}
            >
              <option value="">-- Chọn campaign --</option>
              {campaigns?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Tên giải thưởng"
              className="col-span-2 px-4 py-3 rounded-xl border"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Số lượng"
              className="px-4 py-3 rounded-xl border"
              value={total}
              onChange={e => setTotal(e.target.value)}
              min={1}
            />

            <input
              type="number"
              placeholder="Weight"
              className="px-4 py-3 rounded-xl border"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              min={1}
            />
          </div>

          <button
            onClick={addPrize}
            className="mt-5 px-6 py-3 rounded-xl text-white font-semibold
              bg-indigo-600 hover:bg-indigo-700"
          >
            Thêm giải
          </button>
        </div>

        {/* ===== PRIZE LIST ===== */}
        {selectedCampaign && (
          <div className="space-y-4">
            {prizes?.map((p: any) => (
              <div
                key={p.id}
                className="flex items-center justify-between
                  bg-white p-5 rounded-2xl shadow border"
              >
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-slate-500">
                    Còn {p.remaining}/{p.total} · Weight {p.weight}
                  </p>
                </div>

                <button
                  onClick={() => toggleActive(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold
                    ${p.isActive
                      ? 'bg-gray-200'
                      : 'bg-indigo-600 text-white'}
                  `}
                >
                  {p.isActive ? 'Tắt' : 'Bật'}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
