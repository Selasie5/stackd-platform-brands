import { useState } from 'react'
import { Send } from 'lucide-react'

export function RevisionNoteInput({
  onSubmit,
  loading,
}: {
  onSubmit: (note: string) => void
  loading?: boolean
}) {
  const [note, setNote] = useState('')

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-zinc-700">
        Revision instructions
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Describe what needs to be changed..."
        rows={3}
        className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-900/20"
      />
      <button
        type="button"
        disabled={!note.trim() || loading}
        onClick={() => { onSubmit(note); setNote('') }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
        Send revision request
      </button>
    </div>
  )
}
