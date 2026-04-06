import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    if (!user) { if (socket) { socket.disconnect(); setSocket(null) } return }
    const s = io(SOCKET_URL, { transports: ['websocket'] })
    s.on('connect', () => { s.emit('user_online', user.id); setSocket(s) })
    s.on('online_users', setOnlineUsers)
    return () => s.disconnect()
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
