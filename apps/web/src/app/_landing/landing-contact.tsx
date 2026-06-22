'use client'

import { Button, Card, CardContent, Input, Label } from '@winandwin/ui'
import { CheckCircle2, Loader2, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useScrollReveal } from './hooks'
import type { LandingText } from './text'

interface Props {
  txt: LandingText
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export function LandingContact({ txt }: Props) {
  const reveal = useScrollReveal()
  const [status, setStatus] = useState<FormStatus>('idle')
  const [form, setForm] = useState({
    businessName: '',
    name: '',
    email: '',
    phone: '',
    businessType: '',
    message: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          contactName: form.name,
          email: form.email,
          phone: form.phone,
          businessType: form.businessType,
          message: form.message,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="bg-muted/40 py-24 sm:py-32">
      <div ref={reveal.ref} className={`mx-auto max-w-2xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {txt.getStarted}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.getStartedSub}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <MapPin className="h-3.5 w-3.5" />
            {txt.basedIn}
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6 sm:p-8">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{txt.thankYou}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{txt.confirmEmail}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="businessName">{txt.businessName} *</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      required
                      value={form.businessName}
                      onChange={handleChange}
                      placeholder="e.g. Café Atlas"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">{txt.yourName} *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Amine El Idrissi"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{txt.email} *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="amine@cafe.ma"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">
                      {txt.phone} <span className="text-muted-foreground">{txt.phoneSuffix}</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="businessType">{txt.businessType} *</Label>
                  <select
                    id="businessType"
                    name="businessType"
                    required
                    value={form.businessType}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    <option value="">{txt.selectBusinessType}</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="bar">Bar</option>
                    <option value="retail">Retail</option>
                    <option value="salon">Salon</option>
                    <option value="gym">Gym</option>
                    <option value="hotel">Hotel</option>
                    <option value="riad">Riad</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message">
                    {txt.message} <span className="text-muted-foreground">{txt.messageSuffix}</span>
                  </Label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder={txt.messagePlaceholder}
                    className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                </div>

                {status === 'error' && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {txt.errorMsg}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-semibold"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {txt.sending}
                    </>
                  ) : (
                    txt.sendBtn
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
