'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@winandwin/ui'

interface ContactRequest {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string | null
  business_type: string | null
  message: string | null
  status: string
  created_at: string
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-emerald-900/30', text: 'text-emerald-400', label: 'New' },
  contacted: { bg: 'bg-blue-900/30', text: 'text-blue-400', label: 'Contacted' },
  converted: { bg: 'bg-purple-900/30', text: 'text-purple-400', label: 'Converted' },
  rejected: { bg: 'bg-slate-800', text: 'text-slate-400', label: 'Rejected' },
}

const STATUS_OPTIONS = ['new', 'contacted', 'converted', 'rejected'] as const

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadContacts()
  }, [])

  async function loadContacts() {
    try {
      const res = await fetch('/api/contact/list')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setContacts(data.contacts ?? [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch('/api/contact/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')

      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      )
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Contact Requests</h1>
        <div className="flex items-center gap-2">
          {error && (
            <span className="rounded-full bg-yellow-900/50 px-2.5 py-0.5 text-xs font-medium text-yellow-300">
              Error loading
            </span>
          )}
          <span className="rounded-full bg-indigo-900/50 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
            {contacts.length} total
          </span>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-4 py-3 font-medium text-slate-400">Date</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Business</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Contact</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Email</th>
                  <th className="px-4 py-3 font-medium text-slate-400 hidden md:table-cell">Phone</th>
                  <th className="px-4 py-3 font-medium text-slate-400 hidden lg:table-cell">Type</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-slate-800" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-28 animate-pulse rounded bg-slate-800" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-slate-800" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-slate-800" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-20 animate-pulse rounded bg-slate-800" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-16 animate-pulse rounded bg-slate-800" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-slate-800" /></td>
                    </tr>
                  ))
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">{'\uD83D\uDCEC'}</span>
                        <p className="text-sm text-slate-500">No contact requests yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => {
                    const statusStyle = (STATUS_STYLES[c.status] ?? STATUS_STYLES['new'])!
                    const isExpanded = expandedId === c.id

                    return (
                      <>
                        <tr
                          key={c.id}
                          className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        >
                          <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                            {new Date(c.created_at).toLocaleDateString()}{' '}
                            <span className="text-slate-600">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-200">{c.business_name}</td>
                          <td className="px-4 py-3 text-slate-300">{c.contact_name}</td>
                          <td className="px-4 py-3">
                            <a href={`mailto:${c.email}`} className="text-indigo-400 hover:text-indigo-300 transition-colors" onClick={(e) => e.stopPropagation()}>
                              {c.email}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{c.phone || '-'}</td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {c.business_type ? (
                              <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 capitalize">
                                {c.business_type}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={c.status}
                              onChange={(e) => {
                                e.stopPropagation()
                                updateStatus(c.id, e.target.value)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-0 cursor-pointer ${statusStyle.bg} ${statusStyle.text}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{STATUS_STYLES[s]?.label ?? s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {isExpanded && c.message && (
                          <tr key={`${c.id}-msg`} className="border-b border-slate-800/50">
                            <td colSpan={7} className="px-4 py-3 bg-slate-800/20">
                              <div className="text-xs font-medium text-slate-500 mb-1">Message:</div>
                              <div className="text-sm text-slate-300 whitespace-pre-wrap">{c.message}</div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
