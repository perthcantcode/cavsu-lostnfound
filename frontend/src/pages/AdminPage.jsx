import { useEffect, useState } from 'react'
import api from '../utils/api'

const tabs = ['Overview', 'Users', 'Items', 'Claims']

export default function AdminPage() {
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/items'),
      api.get('/admin/claims'),
    ]).then(([s, u, i, c]) => {
      setStats(s.data); setUsers(u.data); setItems(i.data); setClaims(c.data)
    }).finally(() => setLoading(false))
  }, [])

  const toggleUser = async (id) => {
    const { data } = await api.put(`/admin/users/${id}/toggle`)
    setUsers(users.map(u => u._id === id ? { ...u, isActive: data.isActive } : u))
  }

  const deleteItem = async (id) => {
    if (!confirm('Delete this item?')) return
    await api.delete(`/admin/items/${id}`)
    setItems(items.filter(i => i._id !== id))
  }

  const resolveItem = async (id) => {
    await api.put(`/admin/items/${id}/resolve`)
    setItems(items.map(i => i._id === id ? { ...i, status: 'resolved' } : i))
  }

  const promoteUser = async (id, role) => {
    const { data } = await api.put(`/admin/users/${id}/role`, { role })
    setUsers(users.map(u => u._id === id ? data : u))
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">CavSU Lost & Found management</p>
        </div>
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Admin</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers, color: 'blue' },
          { label: 'Total Items', value: stats.totalItems, color: 'purple' },
          { label: 'Claims', value: stats.totalClaims, color: 'yellow' },
          { label: 'Lost Active', value: stats.lostItems, color: 'red' },
          { label: 'Found Active', value: stats.foundItems, color: 'green' },
          { label: 'Resolved', value: stats.resolvedItems, color: 'teal' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{s.value ?? '–'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-5 border-b border-gray-100 pb-0">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-xl transition-colors ${tab === t ? 'bg-white border border-b-white border-gray-100 text-green-700 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Recent items</h3>
            <div className="space-y-2">
              {items.slice(0, 5).map(item => (
                <div key={item._id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.type === 'lost' ? 'bg-red-400' : 'bg-green-400'}`} />
                    <span className="text-gray-700 truncate max-w-[180px]">{item.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${item.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Recent claims</h3>
            <div className="space-y-2">
              {claims.slice(0, 5).map(c => (
                <div key={c._id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate max-w-[180px]">{c.claimedBy?.name} → {c.item?.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : c.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Users' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Student ID</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.studentId}</td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-[160px]">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Suspended'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => toggleUser(u._id)} className={`text-xs font-medium ${u.isActive ? 'text-red-600 hover:underline' : 'text-green-600 hover:underline'}`}>
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                      {u.role === 'user' && <button onClick={() => promoteUser(u._id, 'admin')} className="text-xs text-purple-600 hover:underline font-medium">Make admin</button>}
                      {u.role === 'admin' && <button onClick={() => promoteUser(u._id, 'user')} className="text-xs text-gray-500 hover:underline font-medium">Remove admin</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Items' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Posted by</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate">{item.title}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{item.type}</span></td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{item.category}</td>
                  <td className="px-4 py-3 text-gray-500">{item.postedBy?.name}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{item.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {item.status === 'active' && <button onClick={() => resolveItem(item._id)} className="text-xs text-green-600 hover:underline font-medium">Resolve</button>}
                      <button onClick={() => deleteItem(item._id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Claims' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">Claimed by</th>
                <th className="px-4 py-3 text-left">Message</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {claims.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[140px] truncate">{c.item?.title}</td>
                  <td className="px-4 py-3 text-gray-600">{c.claimedBy?.name}<br /><span className="text-xs text-gray-400">{c.claimedBy?.studentId}</span></td>
                  <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{c.message}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : c.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
