import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../utils/api'
import ItemCard from '../components/items/ItemCard'

export default function HomePage() {
  const [recentItems, setRecentItems] = useState([])
  const [stats, setStats] = useState({ lost: 0, found: 0, resolved: 0 })

  useEffect(() => {
    api.get('/items?limit=6&status=active').then(r => setRecentItems(r.data.items || []))
    Promise.all([
      api.get('/items?type=lost&status=active&limit=1'),
      api.get('/items?type=found&status=active&limit=1'),
      api.get('/items?status=resolved&limit=1')
    ]).then(([l, f, r]) => setStats({ lost: l.data.total, found: f.data.total, resolved: r.data.total }))
  }, [])

  return (
    <div>
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6 font-medium">
            Cavite State University — Official Lost & Found
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Lost something on campus?<br />We can help you find it.
          </h1>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Post your lost or found items and connect with the CavSU community to reunite belongings with their owners.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/items?type=lost" className="bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors">
              Browse Lost Items
            </Link>
            <Link to="/post" className="bg-green-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-400 transition-colors">
              Post an Item
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Lost Items', value: stats.lost, color: 'bg-red-50 border-red-100 text-red-700' },
            { label: 'Found Items', value: stats.found, color: 'bg-green-50 border-green-100 text-green-700' },
            { label: 'Reunited', value: stats.resolved, color: 'bg-blue-50 border-blue-100 text-blue-700' },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-2xl border ${s.color} p-5 text-center shadow-sm`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm mt-1 font-medium opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Posts</h2>
          <Link to="/items" className="text-sm text-green-600 hover:underline">View all →</Link>
        </div>
        {recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentItems.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>No items posted yet. Be the first!</p>
          </div>
        )}
      </section>

      <section className="bg-green-50 border-t border-green-100 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📸', title: 'Post an item', desc: 'Upload a photo and describe the lost or found item with location details.' },
              { icon: '🔍', title: 'Search & match', desc: 'Browse the listings and search by category, type, or keyword.' },
              { icon: '💬', title: 'Chat & claim', desc: 'Message the poster directly and submit a claim to reunite with your item.' },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
