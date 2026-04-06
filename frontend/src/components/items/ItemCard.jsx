import { Link } from 'react-router-dom'

const CATEGORY_ICONS = {
  electronics: '💻', clothing: '👕', accessories: '⌚', books: '📚',
  documents: '📄', keys: '🔑', bags: '🎒', other: '📦'
}

export default function ItemCard({ item }) {
  const isLost = item.type === 'lost'
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date)
    const d = Math.floor(diff / 86400000)
    if (d === 0) return 'Today'
    if (d === 1) return 'Yesterday'
    if (d < 7) return `${d} days ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <Link to={`/items/${item._id}`} className="group block bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {item.images?.length > 0 ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {CATEGORY_ICONS[item.category] || '📦'}
          </div>
        )}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${isLost ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {isLost ? 'Lost' : 'Found'}
        </div>
        {item.status !== 'active' && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white capitalize">
            {item.status}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate group-hover:text-green-700 transition-colors">{item.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {item.location?.description || 'CavSU Campus'}
          </span>
          <span>{timeAgo(item.createdAt)}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
            {item.postedBy?.avatar ? <img src={item.postedBy.avatar} className="w-full h-full object-cover" /> : <span className="text-green-700 font-semibold text-xs">{item.postedBy?.name?.[0]}</span>}
          </div>
          <span>{item.postedBy?.name}</span>
        </div>
      </div>
    </Link>
  )
}
