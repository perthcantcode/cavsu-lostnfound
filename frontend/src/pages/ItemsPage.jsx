import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import ItemCard from '../components/items/ItemCard'

const CATEGORIES = ['all', 'electronics', 'clothing', 'accessories', 'books', 'documents', 'keys', 'bags', 'other']

export default function ItemsPage() {
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const type = params.get('type') || ''
  const category = params.get('category') || ''
  const search = params.get('search') || ''
  const page = parseInt(params.get('page') || '1')

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams()
    if (type) q.set('type', type)
    if (category && category !== 'all') q.set('category', category)
    if (search) q.set('search', search)
    q.set('page', page)
    q.set('limit', '12')
    api.get(`/items?${q}`).then(r => {
      setItems(r.data.items || [])
      setTotal(r.data.total || 0)
      setPages(r.data.pages || 1)
    }).finally(() => setLoading(false))
  }, [type, category, search, page])

  const set = (k, v) => { const p = new URLSearchParams(params); p.set(k, v); p.set('page', '1'); setParams(p) }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex-1">Browse Items <span className="text-base font-normal text-gray-400 ml-2">{total} results</span></h1>
        <div className="relative">
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search items..." defaultValue={search}
            onKeyDown={e => e.key === 'Enter' && set('search', e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {['', 'lost', 'found'].map(t => (
          <button key={t} onClick={() => set('type', t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${type === t ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t === '' ? 'All' : t === 'lost' ? 'Lost' : 'Found'}
          </button>
        ))}
        <div className="w-px bg-gray-200 mx-1 self-stretch" />
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => set('category', c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${(category || 'all') === c ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(pages)].map((_, i) => (
                <button key={i} onClick={() => set('page', i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-medium text-gray-600">No items found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  )
}
