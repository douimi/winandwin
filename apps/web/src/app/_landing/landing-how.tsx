'use client'

import { CheckCircle2, QrCode, Wand2, type LucideIcon } from 'lucide-react'
import { useScrollReveal } from './hooks'
import { useLanding } from './lang-context'

interface Step {
  Icon: LucideIcon
  iconClass: string
  title: string
  desc: string
  practical: string
}

export function LandingHow() {
  const { txt } = useLanding()
  const reveal = useScrollReveal()

  const steps: Step[] = [
    { Icon: Wand2, iconClass: 'bg-primary/10 text-primary', title: txt.step1, desc: txt.step1Desc, practical: txt.step1Practical },
    { Icon: QrCode, iconClass: 'bg-violet-50 text-violet-700', title: txt.step2, desc: txt.step2Desc, practical: txt.step2Practical },
    { Icon: CheckCircle2, iconClass: 'bg-emerald-50 text-emerald-700', title: txt.step3, desc: txt.step3Desc, practical: txt.step3Practical },
  ]

  return (
    <section id="how-it-works" className="bg-muted/40 py-24 sm:py-32">
      <div ref={reveal.ref} className={`mx-auto max-w-5xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {txt.howItWorks}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.howItWorksSubtitle}</p>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.Icon
              return (
                <div key={step.title} className="flex flex-col items-center text-center">
                  <div className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl shadow-sm ${step.iconClass}`}>
                    <Icon className="h-9 w-9" />
                  </div>
                  <div className="mt-4 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-foreground px-2 text-xs font-semibold text-background">
                    Step {i + 1}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                  <p className="mt-3 max-w-xs rounded-lg bg-card px-3 py-2 text-xs italic text-muted-foreground shadow-xs ring-1 ring-border">
                    « {step.practical} »
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
