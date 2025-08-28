'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/students', label: 'Students', icon: '👥' },
    { href: '/admin/cases', label: 'Cases', icon: '📋' },
    { href: '/admin/users', label: 'Users', icon: '👤' }
  ]

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🏥</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SmartClinic</h1>
              <p className="text-sm text-gray-600">Admin Portal</p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
