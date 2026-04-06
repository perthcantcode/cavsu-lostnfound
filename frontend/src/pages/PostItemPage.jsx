import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import MapPicker from '../components/common/MapPicker'

const CATEGORIES = ['electronics', 'clothing', 'accessories', 'books', 'documents', 'keys', 'bags', 'other']

export default function PostItemPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ type: 'lost', title: '', description: '', category: 'other', locationDesc: '', dateLostFound: '' })
  const [coords, setCoords] = useState({ lat: 14.4791, lng: 120.8980 })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('lat', coords.lat)
      fd.append('lng', coords.lng)
      images.forEach(img => fd.append('images', img))
      const { data } = await api.post('/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      navigate(`/items/${data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post item')
    } finally { setLoading(false) }
  }

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Post an Item</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-3">
          {['lost', 'found'].map(t => (
            <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-colors capitalize ${form.type === t ? (t === 'lost' ? 'border-red-500 bg-red-50 text-red-700' : 'border-green-500 bg-green-50 text-green-700') : 'border-gray-200 text-gray-500'}`}>
              {t === 'lost' ? '😟 I Lost Something' : '😊 I Found Something'}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Item title</label>
          <input type="text" required value={form.title} onChange={set('title')} className={inp} placeholder="e.g. Black Samsung phone" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
          <select value={form.category} onChange={set('category')} className={inp}>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea required rows={4} value={form.description} onChange={set('description')} className={inp + ' resize-none'}
            placeholder="Describe the item in detail — color, brand, distinguishing marks..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date lost/found</label>
          <input type="date" value={form.dateLostFound} onChange={set('dateLostFound')} className={inp} max={new Date().toISOString().split('T')[0]} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Location description</label>
          <input type="text" value={form.locationDesc} onChange={set('locationDesc')} className={inp} placeholder="e.g. Near DIT/CEIT building, 2nd floor" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Pin location on map <span className="font-normal text-gray-400">(click to set)</span></label>
          <MapPicker value={coords} onChange={setCoords} />
          <p className="text-xs text-gray-400 mt-1.5">Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Photos <span className="font-normal text-gray-400">(up to 5)</span></label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-green-400 transition-colors" onClick={() => document.getElementById('img-upload').click()}>
            <input id="img-upload" type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
            {previews.length > 0 ? (
              <div className="flex gap-2 flex-wrap justify-center">
                {previews.map((p, i) => <img key={i} src={p} className="w-20 h-20 object-cover rounded-xl" />)}
              </div>
            ) : (
              <>
                <p className="text-3xl mb-2">📸</p>
                <p className="text-sm text-gray-500">Click to upload photos</p>
              </>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-60">
          {loading ? 'Posting...' : 'Post Item'}
        </button>
      </form>
    </div>
  )
}
