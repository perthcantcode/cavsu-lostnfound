import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import ClaimModal from '../components/items/ClaimModal'

export default function ItemDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [showClaim, setShowClaim] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    api.get(`/items/${id}`).then(r => setItem(r.data)).catch(() => navigate('/items')).finally(() => setLoading(false))
  }, [id])

  const startChat = async () => {
    if (!user) return navigate('/login')
    setChatLoading(true)
    try {
      const { data } = await api.post('/chat/start', { itemId: item._id, ownerId: item.postedBy._id })
      navigate(`/chat/${data._id}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Could not start chat')
    } finally { setChatLoading(false) }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>
  if (!item) return null

  const isOwner = user?._id === item.postedBy?._id || user?.id === item.postedBy?._id
  const coords = item.location?.coordinates

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-video">
            {item.images?.length > 0 ? (
              <img src={item.images[imgIdx]} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">📦</div>
            )}
          </div>
          {item.images?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {item.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${imgIdx === i ? 'border-green-500' : 'border-transparent'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {item.type === 'lost' ? 'Lost' : 'Found'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">{item.category}</span>
            {item.status !== 'active' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white capitalize">{item.status}</span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.description}</p>

          <div className="space-y-2 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              {item.location?.description || 'CavSU Campus'}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {new Date(item.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {item.views} views
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {item.postedBy?.avatar ? <img src={item.postedBy.avatar} className="w-full h-full object-cover" /> : <span className="text-green-700 font-semibold">{item.postedBy?.name?.[0]}</span>}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{item.postedBy?.name}</p>
              <p className="text-xs text-gray-500">{item.postedBy?.studentId} • {item.postedBy?.department}</p>
            </div>
          </div>

          {!isOwner && item.status === 'active' && (
            <div className="flex gap-3">
              <button onClick={startChat} disabled={chatLoading}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 text-sm">
                {chatLoading ? 'Opening...' : '💬 Message Poster'}
              </button>
              <button onClick={() => { if (!user) navigate('/login'); else setShowClaim(true) }}
                className="flex-1 border border-green-600 text-green-700 py-2.5 rounded-xl font-semibold hover:bg-green-50 transition-colors text-sm">
                📋 Submit Claim
              </button>
            </div>
          )}

          {isOwner && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
              This is your post. You can edit or delete it from My Posts.
            </div>
          )}
        </div>
      </div>

      {coords?.lat && (
        <div className="mt-8">
          <h2 className="font-semibold text-gray-800 mb-3">Location on map</h2>
          <div className="rounded-2xl overflow-hidden h-56 border border-gray-200">
            <MapContainer center={[coords.lat, coords.lng]} zoom={17} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[coords.lat, coords.lng]} />
            </MapContainer>
          </div>
        </div>
      )}

      {showClaim && <ClaimModal itemId={item._id} onClose={() => setShowClaim(false)} />}
    </div>
  )
}
