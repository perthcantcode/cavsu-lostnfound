import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false) }
  const active = (path) => location.pathname === path ? 'text-green-600 font-semibold' : 'text-gray-600 hover:text-green-600'

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <div>
            <p className="font-bold text-green-700 leading-none text-sm">CavSU</p>
            <p className="text-xs text-gray-500 leading-none">Lost & Found</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/items" className={active('/items')}>Browse Items</Link>
          {user && <Link to="/post" className={active('/post')}>Post Item</Link>}
          {user && <Link to="/chat" className={active('/chat')}>Messages</Link>}
          {user && <Link to="/my-items" className={active('/my-items')}>My Posts</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="text-red-600 font-semibold">Admin</Link>}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-green-700 font-semibold text-xs">{user.name?.[0]?.toUpperCase()}</span>}
                </div>
                <span className="font-medium">{user.name?.split(' ')[0]}</span>
              </button>
              <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-xl shadow-lg py-2 w-44 hidden group-hover:block">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                <Link to="/my-items" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Posts</Link>
                <hr className="my-1 border-gray-100" />
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="text-sm text-gray-600 hover:text-green-600 px-3 py-1.5">Login</Link>
              <Link to="/register" className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700">Register</Link>
            </div>
          )}
        </div>

        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2 text-sm">
          <Link to="/items" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700">Browse Items</Link>
          {user && <Link to="/post" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700">Post Item</Link>}
          {user && <Link to="/chat" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700">Messages</Link>}
          {user && <Link to="/my-items" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700">My Posts</Link>}
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-red-600">Admin Panel</Link>}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700">Profile</Link>
              <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600">Logout</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center border border-gray-300 py-2 rounded-lg text-gray-700">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center bg-green-600 text-white py-2 rounded-lg">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
