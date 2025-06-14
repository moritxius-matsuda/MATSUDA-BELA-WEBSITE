'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface GuideCommentsProps {
  guideSlug: string
}

interface Comment {
  id: string
  guideSlug: string
  userId: string
  userName: string
  userImage?: string
  content: string
  createdAt: string
  updatedAt: string
  likes: number
  dislikes: number
  userReaction?: 'like' | 'dislike' | null
}

export default function GuideComments({ guideSlug }: GuideCommentsProps) {
  const { user, isSignedIn } = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)

  // Kommentare laden
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/guides/${guideSlug}/comments`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setComments(data.comments)
          }
        }
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [guideSlug])

  // Neuen Kommentar hinzufügen
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      alert('Bitte melden Sie sich an, um zu kommentieren.')
      return
    }

    if (!newComment.trim()) {
      alert('Bitte geben Sie einen Kommentar ein.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/guides/${guideSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          userName: user?.fullName || user?.firstName || 'Anonymer Benutzer',
          userImage: user?.imageUrl,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setComments([data.comment, ...comments])
          setNewComment('')
          setShowCommentForm(false)
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Fehler beim Erstellen des Kommentars')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Fehler beim Erstellen des Kommentars')
    } finally {
      setSubmitting(false)
    }
  }

  // Kommentar bewerten
  const handleCommentReaction = async (commentId: string, reaction: 'like' | 'dislike') => {
    if (!isSignedIn) {
      alert('Bitte melden Sie sich an, um zu bewerten.')
      return
    }

    try {
      const comment = comments.find(c => c.id === commentId)
      if (!comment) return

      // Wenn bereits die gleiche Reaktion vorhanden ist, entferne sie
      const actualReaction = comment.userReaction === reaction ? 'remove' : reaction

      const response = await fetch(`/api/guides/${guideSlug}/comments/${commentId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reaction: actualReaction }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Aktualisiere den Kommentar in der Liste
          setComments(comments.map(c => 
            c.id === commentId 
              ? { 
                  ...c, 
                  likes: data.comment.likes,
                  dislikes: data.comment.dislikes,
                  userReaction: data.comment.userReaction
                }
              : c
          ))
        }
      }
    } catch (error) {
      console.error('Error reacting to comment:', error)
    }
  }

  // Zeitformat
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'vor wenigen Minuten'
    } else if (diffInHours < 24) {
      return `vor ${diffInHours} Stunde${diffInHours > 1 ? 'n' : ''}`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `vor ${diffInDays} Tag${diffInDays > 1 ? 'en' : ''}`
      } else {
        return date.toLocaleDateString('de-DE')
      }
    }
  }

  return (
    <div className="glass-card p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Kommentare ({comments.length})
        </h3>
        
        {isSignedIn && !showCommentForm && (
          <button
            onClick={() => setShowCommentForm(true)}
            className="glass-button px-4 py-2 text-white rounded-lg hover:bg-white/20 transition-colors duration-300"
          >
            Kommentar schreiben
          </button>
        )}
      </div>

      {/* Kommentar-Formular */}
      {showCommentForm && (
        <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-start gap-3 mb-4">
            {user?.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt={user.fullName || 'User'}
                className="w-10 h-10 rounded-full border border-white/20"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {(user?.fullName || user?.firstName || 'U').charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Schreiben Sie einen Kommentar..."
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 resize-none"
                rows={3}
                maxLength={1000}
                disabled={submitting}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-white/60">
                  {newComment.length}/1000 Zeichen
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCommentForm(false)
                      setNewComment('')
                    }}
                    className="px-3 py-1 text-sm text-white/70 hover:text-white transition-colors duration-300"
                    disabled={submitting}
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm rounded-lg transition-colors duration-300"
                  >
                    {submitting ? 'Wird gesendet...' : 'Kommentieren'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Kommentare Liste */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-4 bg-white/5 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/20 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-white/20 rounded w-full mb-1"></div>
                  <div className="h-3 bg-white/20 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-white/60 mb-4">Noch keine Kommentare vorhanden.</p>
          {isSignedIn ? (
            <button
              onClick={() => setShowCommentForm(true)}
              className="glass-button px-6 py-2 text-white rounded-lg hover:bg-white/20 transition-colors duration-300"
            >
              Ersten Kommentar schreiben
            </button>
          ) : (
            <p className="text-sm text-white/60">
              <a href="/sign-in" className="text-blue-400 hover:text-blue-300 underline">
                Melden Sie sich an
              </a>, um den ersten Kommentar zu schreiben.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                {comment.userImage ? (
                  <img 
                    src={comment.userImage} 
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full border border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {comment.userName.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  {/* User Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-white">{comment.userName}</span>
                    <span className="text-xs text-white/60">•</span>
                    <span className="text-xs text-white/60">{formatDate(comment.createdAt)}</span>
                  </div>

                  {/* Comment Content */}
                  <p className="text-white/90 mb-3 whitespace-pre-wrap">{comment.content}</p>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleCommentReaction(comment.id, 'like')}
                      disabled={!isSignedIn}
                      className={`flex items-center gap-1 text-sm transition-colors duration-300 ${
                        comment.userReaction === 'like'
                          ? 'text-green-400'
                          : 'text-white/60 hover:text-white'
                      } ${!isSignedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={!isSignedIn ? 'Anmelden zum Bewerten' : 'Hilfreich'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-4l-2-2m0 0l-2-2m2 2v6" />
                      </svg>
                      <span>{comment.likes}</span>
                    </button>

                    <button
                      onClick={() => handleCommentReaction(comment.id, 'dislike')}
                      disabled={!isSignedIn}
                      className={`flex items-center gap-1 text-sm transition-colors duration-300 ${
                        comment.userReaction === 'dislike'
                          ? 'text-red-400'
                          : 'text-white/60 hover:text-white'
                      } ${!isSignedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={!isSignedIn ? 'Anmelden zum Bewerten' : 'Nicht hilfreich'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L15 17V4m-3 4l2 2m0 0l2 2m-2-2v6" />
                      </svg>
                      <span>{comment.dislikes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Login Hinweis */}
      {!isSignedIn && comments.length > 0 && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
          <p className="text-sm text-white/80">
            <a href="/sign-in" className="text-blue-400 hover:text-blue-300 underline font-medium">
              Melden Sie sich an
            </a>, um Kommentare zu schreiben und zu bewerten.
          </p>
        </div>
      )}
    </div>
  )
}