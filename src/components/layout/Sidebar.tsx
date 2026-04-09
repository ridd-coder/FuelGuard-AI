'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  icon: string
  label: string
  badge?: number
}

interface SidebarProps {
  role: 'user' | 'admin' | 'pump'
}

const navsByRole: Record<string, NavItem[]> = {
  user: [
    { href: '/dashboard/user', icon: '🏠', label: 'Overview' },
    { href: '/dashboard/user/map', icon: '🗺️', label: 'Fuel Map' },
    { href: '/dashboard/user/book', icon: '📅', label: 'Book Slot' },
    { href: '/dashboard/user/credits', icon: '💳', label: 'My Credits' },
    { href: '/dashboard/user/alerts', icon: '🔔', label: 'Alerts', badge: 3 },
    { href: '/dashboard/user/whatsapp', icon: '📱', label: 'WhatsApp' },
  ],
  admin: [
    { href: '/dashboard/admin', icon: '📊', label: 'Command Center' },
    { href: '/dashboard/admin/heatmap', icon: '🌡️', label: 'Live Heatmap' },
    { href: '/dashboard/admin/alerts', icon: '🚨', label: 'Alert Feed', badge: 5 },
    { href: '/dashboard/admin/distribution', icon: '🚛', label: 'Distribution' },
    { href: '/dashboard/admin/blockchain', icon: '🔗', label: 'Blockchain Ledger' },
    { href: '/dashboard/analytics', icon: '📈', label: 'Analytics' },
  ],
  pump: [
    { href: '/dashboard/pump', icon: '⛽', label: 'My Station' },
    { href: '/dashboard/pump/stock', icon: '📦', label: 'Stock Update' },
    { href: '/dashboard/pump/queue', icon: '🚗', label: 'Queue Manager' },
    { href: '/dashboard/pump/validate', icon: '✅', label: 'QR Validator' },
    { href: '/dashboard/pump/bookings', icon: '📋', label: 'Bookings' },
  ],
}

const roleLabels: Record<string, string> = {
  user: 'Citizen',
  admin: 'Authority',
  pump: 'Pump Operator',
}

const roleNames: Record<string, string> = {
  user: 'Riddhiman Dutta',
  admin: 'Admin Officer',
  pump: 'Suresh Singh',
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const navItems = navsByRole[role] || navsByRole.user

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⛽</div>
        <div className="logo-text">
          <span className="logo-title">FuelGuard AI</span>
          <span className="logo-sub">Crisis Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Navigation</span>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </Link>
        ))}

        <span className="nav-section-label" style={{ marginTop: '8px' }}>Dashboards</span>
        <Link href="/dashboard/user" className={`nav-item ${role === 'user' ? 'active' : ''}`}>
          <span className="nav-icon">👤</span>
          <span>Citizen</span>
        </Link>
        <Link href="/dashboard/admin" className={`nav-item ${role === 'admin' ? 'active' : ''}`}>
          <span className="nav-icon">🏛️</span>
          <span>Authority</span>
        </Link>
        <Link href="/dashboard/pump" className={`nav-item ${role === 'pump' ? 'active' : ''}`}>
          <span className="nav-icon">⛽</span>
          <span>Pump Operator</span>
        </Link>
        <Link href="/dashboard/analytics" className={`nav-item ${pathname?.startsWith('/dashboard/analytics') ? 'active' : ''}`}>
          <span className="nav-icon">📊</span>
          <span>Analytics</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{roleNames[role][0]}</div>
          <div className="user-info">
            <div className="user-name">{roleNames[role]}</div>
            <div className="user-role">{roleLabels[role]}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
