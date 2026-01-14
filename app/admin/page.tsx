'use client'
import { useEffect, useState } from 'react'

type Campaign = {
  id: string
  name: string
  isActive: boolean
}

export default function AdminPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignId, setCampaignId] = useState('')
  const [prizes, setPrizes] = useState<any[]>([])

  const [verified, setVerified] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  /* ===== LOAD CAMPAIGNS AFTER VERIFY ===== */
  useEffect(() => {
    if (!verified) return

    fetch('/api/admin/campaigns')
      .then(res => res.json())
      .then(data => {
        setCampaigns(data)
        if (data.length) setCampaignId(data[0].id)
      })
  }, [verified])

  /* ===== LOAD PRIZES ===== */
  useEffect(() => {
    if (!verified || !campaignId) return

    fetch(`/api/admin/prizes?campaignId=${campaignId}`)
      .then(res => res.json())
      .then(setPrizes)
  }, [verified, campaignId])

  async function reset() {
    const ok = confirm('Bạn chắc chắn muốn RESET campaign này?')
    if (!ok) return

    const res = await fetch('/api/admin/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId }),
    })

    if (!res.ok) {
      alert('Reset thất bại')
      return
    }

    alert('Reset xong')
    location.reload()
  }

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

        <div className="w-96 rounded-3xl p-8 bg-white/80 backdrop-blur-xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6">
            Admin Verification
          </h2>

          <input
            className="w-full mb-3 px-4 py-3 rounded-xl border"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="w-full mb-3 px-4 py-3 rounded-xl border"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-500 mb-3 text-center">
              {error}
            </p>
          )}

          <button
            onClick={verify}
            className="w-full py-3 rounded-xl text-white font-semibold
              bg-indigo-600 hover:bg-indigo-700"
          >
            Xác nhận
          </button>
        </div>
      </div>
    )
  }

  /* ===== DASHBOARD ===== */
  return (
    <div className="fixed inset-0 flex items-center justify-center
        bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-100">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Admin Event Dashboard
        </h1>

        {/* SELECT CAMPAIGN */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Chọn Campaign
          </label>
          <select
            value={campaignId}
            onChange={e => setCampaignId(e.target.value)}
            className="px-4 py-3 rounded-xl border w-full"
          >
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.isActive ? '(Active)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* PRIZES */}
        <div className="bg-white rounded-3xl p-6 shadow mb-8">
          <h2 className="text-xl font-bold mb-4">
            Danh sách phần thưởng
          </h2>

          <ul className="space-y-3">
            {prizes.map(p => (
              <li
                key={p.id}
                className="flex justify-between items-center
                  border rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-slate-500">
                    Còn {p.remaining}/{p.total} · Weight {p.weight}
                  </p>
                </div>

                <button
                  onClick={async () => {
                    await fetch(`/api/admin/prizes/${p.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ isActive: !p.isActive }),
                    })

                    const res = await fetch(
                      `/api/admin/prizes?campaignId=${campaignId}`
                    )
                    setPrizes(await res.json())
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold
                    ${
                      p.isActive
                        ? 'bg-gray-200'
                        : 'bg-indigo-600 text-white'
                    }`}
                >
                  {p.isActive ? 'Tắt' : 'Bật'}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* RESET */}
        <div className="bg-white p-6 rounded-3xl border border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Danger Zone
          </h2>

          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl text-white bg-red-600"
          >
            RESET CAMPAIGN
          </button>
        </div>

      </div>
    </div>
  )
}
