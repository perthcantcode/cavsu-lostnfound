import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function MyItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/items/user/my-items').then(r => setItems(r.data)).finally(() => setLoading(false))
  }, [])

  const deleteItem = async (id) => {
    if (!confirm('Delete this item?')) return
    await api.delete(`/items/${id}`)
    setItems(items.filter(i => i._id !== id))
  }

  const markResolved = async (id) => {
    await api.put(`/items/${id}`, { status: 'resolved' })
    setItems(items.map(i => i._id === id ? { ...i, status: 'resolved' } : i))
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Posts</h1>
        <Link to="/post" className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700">+ New Post</Link>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="font-medium text-gray-600">No posts yet</p>
          <Link to="/post" className="mt-4 inline-block bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700">Post your first item</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {item.images?.[0] ? <img src={item.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{item.type}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-blue-100 text-blue-700' : item.status === 'claimed' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{item.status}</span>
                </div>
                <p className="font-semibold text-gray-800 text-sm truncate">{item.title}</p>
                <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()} · {item.views} views</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={`/items/${item._id}`} className="text-xs text-blue-600 hover:underline font-medium">View</Link>
                {item.status === 'active' && <button onClick={() => markResolved(item._id)} className="text-xs text-green-600 hover:underline font-medium">Mark resolved</button>}
                <button onClick={() => deleteItem(item._id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
