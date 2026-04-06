import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', contactNumber: user?.contactNumber || '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"

  const save = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.put('/auth/profile', form)
      updateUser(data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch { alert('Failed to update profile') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">My Profile</h1>
      <div className="flex items-center gap-4 mb-8 p-5 bg-green-50 rounded-2xl border border-green-100">
        <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center text-2xl font-bold text-green-700">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-gray-800">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">Student ID: {user?.studentId}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{user?.role}</span>
        </div>
      </div>
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-5">Profile updated!</div>}
      <form onSubmit={save} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100">
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label><input value={form.name} onChange={set('name')} className={inp} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label><input value={form.department} onChange={set('department')} className={inp} placeholder="CITE, CBEA, etc." /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Contact number</label><input value={form.contactNumber} onChange={set('contactNumber')} className={inp} placeholder="09XXXXXXXXX" /></div>
        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60 text-sm">{loading ? 'Saving...' : 'Save changes'}</button>
      </form>
    </div>
  )
}
