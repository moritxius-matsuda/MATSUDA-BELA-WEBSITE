'use client'

import { useState } from 'react'
import { useSession } from '@clerk/nextjs'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Like, Dislike, MessageSquare } from 'lucide-react'

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
  likes: number
  dislikes: number
}

interface GuideCommentsProps {
  guideId: string
}

export default function GuideComments({ guideId }: GuideCommentsProps) {
  const { session } = useSession()
  const { toast } = useToast()
  const [newComment, setNewComment] = useState('')

  const { data: comments = [], refetch } = useQuery({
    queryKey: ['comments', guideId],
    queryFn: async () => {
      const response = await fetch(`/api/guides/${guideId}/comments`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      return response.json()
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/guides/${guideId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!response.ok) throw new Error('Failed to add comment')
      return response.json()
    },
    onSuccess: () => {
      refetch()
      setNewComment('')
      toast({
        title: 'Erfolgreich',
        description: 'Dein Kommentar wurde hinzugefügt!',
      })
    },
  })

  const updateVoteMutation = useMutation({
    mutationFn: async ({ commentId, voteType }: { commentId: string; voteType: 'like' | 'dislike' }) => {
      const response = await fetch(`/api/guides/${guideId}/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      })
      if (!response.ok) throw new Error('Failed to update vote')
      return response.json()
    },
    onSuccess: () => refetch(),
  })

  if (!session) {
    return (
      <div className="p-4 border rounded-lg bg-white/5">
        <p className="text-white/70">Bitte melde dich an, um Kommentare zu schreiben.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Kommentare</h3>
      
      {/* New Comment Form */}
      <div className="bg-white/5 p-4 rounded-lg">
        <div className="space-y-2">
          <Textarea
            placeholder="Dein Kommentar..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full"
          />
          <Button
            onClick={() => addCommentMutation.mutate(newComment)}
            disabled={!newComment.trim() || addCommentMutation.isPending}
          >
            Kommentar hinzufügen
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {comments.map((comment: Comment) => (
        <div key={comment.id} className="bg-white/5 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white font-medium">{comment.author}</p>
              <p className="text-white/70 text-sm">{comment.content}</p>
              <p className="text-white/40 text-xs mt-1">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateVoteMutation.mutate({ commentId: comment.id, voteType: 'like' })}
              >
                <Like className="h-4 w-4" />
                <span className="ml-2">{comment.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateVoteMutation.mutate({ commentId: comment.id, voteType: 'dislike' })}
              >
                <Dislike className="h-4 w-4" />
                <span className="ml-2">{comment.dislikes}</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
