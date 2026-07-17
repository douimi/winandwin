'use client'

import { Inbox } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@winandwin/ui'
import { useAdmin } from '../../admin-lang-context'

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

// Presentational styles are static; labels are looked up at render time
// from the admin text bundle so status pills switch on FR/EN.
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  contacted: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  converted: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
  rejected: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
}

const STATUS_OPTIONS = ['new', 'contacted', 'converted', 'rejected'] as const

export default function AdminContactsPage() {
  const { txt } = useAdmin()
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const statusLabels: Record<(typeof STATUS_OPTIONS)[number], string> = {
    new: txt.contactsStatusNew,
    contacted: txt.contactsStatusContacted,
    converted: txt.contactsStatusConverted,
    rejected: txt.contactsStatusRejected,
  }

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{txt.contactsTitle}</h1>
        <div className="flex items-center gap-2">
          {error && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              {txt.contactsErrorLoad}
            </span>
          )}
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {contacts.length} {txt.contactsTotalSuffix}
          </span>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">{txt.contactsColDate}</th>
                  <th className="px-4 py-3 font-semibold">{txt.contactsColBusiness}</th>
                  <th className="px-4 py-3 font-semibold">{txt.contactsColContact}</th>
                  <th className="px-4 py-3 font-semibold">{txt.contactsColEmail}</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">{txt.contactsColPhone}</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">{txt.contactsColType}</th>
                  <th className="px-4 py-3 font-semibold">{txt.contactsColStatus}</th>
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
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                          <Inbox className="h-6 w-6" />
                        </div>
                        <p className="text-sm text-muted-foreground">{txt.contactsEmpty}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => {
                    const statusStyle = STATUS_STYLES[c.status] ?? STATUS_STYLES['new']!
                    const isExpanded = expandedId === c.id

                    return (
                      <>
                        <tr
                          key={c.id}
                          className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
                          onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString()}{' '}
                            <span className="text-muted-foreground/70">
                              {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">{c.business_name}</td>
                          <td className="px-4 py-3 text-foreground/80">{c.contact_name}</td>
                          <td className="px-4 py-3">
                            <a
                              href={`mailto:${c.email}`}
                              className="text-primary transition-colors hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {c.email}
                            </a>
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{c.phone || '-'}</td>
                          <td className="hidden px-4 py-3 lg:table-cell">
                            {c.business_type ? (
                              <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
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
                                <option key={s} value={s}>{statusLabels[s]}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {isExpanded && c.message && (
                          <tr key={`${c.id}-msg`} className="border-b border-gray-100">
                            <td colSpan={7} className="px-4 py-3 bg-gray-50">
                              <div className="text-xs font-medium text-gray-400 mb-1">{txt.contactsMessageLabel}</div>
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
