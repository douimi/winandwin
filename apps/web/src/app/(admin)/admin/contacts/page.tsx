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

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  new: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', label: 'New' },
  contacted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', label: 'Contacted' },
  converted: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', label: 'Converted' },
  rejected: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-300', label: 'Rejected' },
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
        <h1 className="text-2xl font-bold text-gray-900">Contact Requests</h1>
        <div className="flex items-center gap-2">
          {error && (
            <span className="rounded-full border border-yellow-300 bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
              Error loading
            </span>
          )}
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {contacts.length} total
          </span>
        </div>
      </div>

      <Card className="border border-gray-200 bg-white shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left bg-gray-50">
                  <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Business</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Contact</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Phone</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Type</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-gray-100" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-28 animate-pulse rounded bg-gray-100" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-100" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-gray-100" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-20 animate-pulse rounded bg-gray-100" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-16 animate-pulse rounded bg-gray-100" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-gray-100" /></td>
                    </tr>
                  ))
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">{'\uD83D\uDCEC'}</span>
                        <p className="text-sm text-gray-500">No contact requests yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((c, idx) => {
                    const statusStyle = STATUS_STYLES[c.status] ?? STATUS_STYLES['new']!
                    const isExpanded = expandedId === c.id

                    return (
                      <>
                        <tr
                          key={c.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                          onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        >
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                            {new Date(c.created_at).toLocaleDateString()}{' '}
                            <span className="text-gray-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{c.business_name}</td>
                          <td className="px-4 py-3 text-gray-700">{c.contact_name}</td>
                          <td className="px-4 py-3">
                            <a href={`mailto:${c.email}`} className="text-indigo-600 hover:text-indigo-700 transition-colors" onClick={(e) => e.stopPropagation()}>
                              {c.email}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c.phone || '-'}</td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {c.business_type ? (
                              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600 capitalize">
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
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{STATUS_STYLES[s]?.label ?? s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {isExpanded && c.message && (
                          <tr key={`${c.id}-msg`} className="border-b border-gray-100">
                            <td colSpan={7} className="px-4 py-3 bg-gray-50">
                              <div className="text-xs font-medium text-gray-400 mb-1">Message:</div>
                              <div className="text-sm text-gray-700 whitespace-pre-wrap">{c.message}</div>
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
