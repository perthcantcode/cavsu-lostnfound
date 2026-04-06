import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

export default function ChatPage() {
  const { chatId } = useParams()
  const { user } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(null)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  useEffect(() => {
    api.get('/chat/my-chats').then(r => setChats(r.data))
  }, [])

  useEffect(() => {
    if (!chatId) return
    api.get(`/chat/${chatId}`).then(r => {
      setActiveChat(r.data)
      setMessages(r.data.messages || [])
      socket?.emit('join_room', chatId)
    })
  }, [chatId, socket])

  useEffect(() => {
    if (!socket) return
    socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]))
    socket.on('receive_location', (data) => setMessages(prev => [...prev, data.message]))
    socket.on('user_typing', (data) => setTyping(data.name))
    socket.on('user_stop_typing', () => setTyping(null))
    return () => {
      socket.off('receive_message')
      socket.off('receive_location')
      socket.off('user_typing')
      socket.off('user_stop_typing')
    }
  }, [socket])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleTyping = () => {
    socket?.emit('typing', { roomId: chatId, userId: user.id || user._id, name: user.name })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socket?.emit('stop_typing', { roomId: chatId, userId: user.id || user._id })
    }, 1500)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() || !chatId) return
    setSending(true)
    try {
      const { data } = await api.post(`/chat/${chatId}/message`, { content: text, type: 'text' })
      socket?.emit('send_message', { roomId: chatId, ...data })
      setText('')
    } catch { alert('Failed to send') } finally { setSending(false) }
  }

  const shareLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      try {
        const { data } = await api.post(`/chat/${chatId}/message`, { content: '📍 Location shared', type: 'location', location: loc })
        socket?.emit('share_location', { roomId: chatId, message: data })
      } catch { alert('Failed to share location') }
    }, () => alert('Could not get your location'))
  }

  const myId = user?.id || user?._id
  const other = activeChat?.participants?.find(p => (p._id || p) !== myId)

  if (!chatId) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Messages</h1>
        {chats.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">💬</p>
            <p className="font-medium text-gray-600">No conversations yet</p>
            <p className="text-sm mt-1">Browse items and message a poster to get started</p>
            <Link to="/items" className="mt-4 inline-block bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700">Browse Items</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map(chat => {
              const other = chat.participants?.find(p => (p._id || p).toString() !== myId?.toString())
              return (
                <button key={chat._id} onClick={() => navigate(`/chat/${chat._id}`)}
                  className="w-full text-left flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all">
                  <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {other?.avatar ? <img src={other.avatar} className="w-full h-full object-cover" /> : <span className="text-green-700 font-semibold">{other?.name?.[0]}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800 text-sm">{other?.name}</p>
                      <span className="text-xs text-gray-400">{chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleDateString() : ''}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{chat.item?.title}</p>
                    <p className="text-xs text-gray-400 truncate">{chat.lastMessage || 'Start the conversation'}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 h-[calc(100vh-4rem)] flex gap-4">
      <div className="hidden md:flex flex-col w-72 bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map(chat => {
            const o = chat.participants?.find(p => (p._id || p).toString() !== myId?.toString())
            return (
              <button key={chat._id} onClick={() => navigate(`/chat/${chat._id}`)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-colors ${chat._id === chatId ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'}`}>
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {o?.avatar ? <img src={o.avatar} className="w-full h-full object-cover" /> : <span className="text-green-700 font-semibold text-xs">{o?.name?.[0]}</span>}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 text-xs truncate">{o?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{chat.item?.title}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
        {activeChat && (
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <button onClick={() => navigate('/chat')} className="md:hidden text-gray-400 mr-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
              {other?.avatar ? <img src={other.avatar} className="w-full h-full object-cover" /> : <span className="text-green-700 font-semibold text-sm">{other?.name?.[0]}</span>}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{other?.name}</p>
              <Link to={`/items/${activeChat.item?._id}`} className="text-xs text-green-600 hover:underline">{activeChat.item?.title}</Link>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => {
            const isMine = (msg.sender?._id || msg.sender) === myId
            return (
              <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {msg.type === 'location' && msg.location ? (
                    <div className={`rounded-2xl overflow-hidden border ${isMine ? 'border-green-200' : 'border-gray-200'}`}>
                      <div className="h-40 w-56">
                        <MapContainer center={[msg.location.lat, msg.location.lng]} zoom={16} className="h-full w-full" zoomControl={false}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[msg.location.lat, msg.location.lng]} />
                        </MapContainer>
                      </div>
                      <div className={`px-3 py-2 text-xs ${isMine ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>📍 Location shared</div>
                    </div>
                  ) : (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-green-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                      {msg.content}
                    </div>
                  )}
                  <span className="text-xs text-gray-400 px-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            )
          })}
          {typing && <p className="text-xs text-gray-400 italic">{typing} is typing...</p>}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
          <button type="button" onClick={shareLocation} title="Share location"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-green-100 text-gray-500 hover:text-green-700 transition-colors flex-shrink-0">
            📍
          </button>
          <input value={text} onChange={e => { setText(e.target.value); handleTyping() }} placeholder="Type a message..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <button type="submit" disabled={sending || !text.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </div>
  )
}
