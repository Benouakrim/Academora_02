import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

type Props = {
  isOpen: boolean
  onClose: () => void
  initialNote: string | null | undefined
  onSave: (text: string) => Promise<void> | void
}

export default function EditNoteDialog({ isOpen, onClose, initialNote, onSave }: Props) {
  const [text, setText] = useState(initialNote ?? '')

  useEffect(() => {
    setText(initialNote ?? '')
  }, [initialNote, isOpen])

  const handleSave = async () => {
    await onSave(text)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>Add a private note about this university.</DialogDescription>
        </DialogHeader>
        <div className="mt-3">
          <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your note..." />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
