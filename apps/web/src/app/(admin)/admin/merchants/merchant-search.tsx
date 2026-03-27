'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@winandwin/ui'

export function MerchantSearch({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = value ? `?search=${encodeURIComponent(value)}` : ''
    router.push(`/admin/merchants${params}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Search merchants by name..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="max-w-sm border-gray-700 bg-gray-900 text-gray-200 placeholder:text-gray-500"
      />
      <button
        type="submit"
        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
      >
        Search
      </button>
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue('')
            router.push('/admin/merchants')
          }}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 transition-colors"
        >
          Clear
        </button>
      )}
    </form>
  )
}
