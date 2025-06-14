'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getGuideBySlug } from '@/data/guides'
import type { Guide, GuideSection } from '@/data/guides'
import { useUser } from '@clerk/nextjs'

export default function DynamicGuidePage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { user } = useUser()
  
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/guides/${slug}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const comments = await response.json();
      if (guide) {
        setGuide({ ...guide, comments });
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/guides/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newComment,
          author: user.fullName || user.emailAddresses[0]?.emailAddress || 'Anonymous',
          authorId: user.id
        })
      });
      
      if (!response.ok) throw new Error('Failed to add comment');
      
      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (commentId: string, voteType: 'like' | 'dislike') => {
    if (!user) return;
    
    setIsVoting(true);
    try {
      const response = await fetch(`/api/guides/${slug}/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          voteType,
          userId: user.id
        })
      });
      
      if (!response.ok) throw new Error('Failed to update vote');
      
      await fetchComments();
    } catch (error) {
      console.error('Error updating vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    const loadGuide = async () => {
      try {
        // Zuerst versuchen, aus den statischen Guides zu laden
        const staticGuide = getGuideBySlug(slug)
        if (staticGuide) {
          setGuide(staticGuide)
          setLoading(false)
          return
        }

        // Dann versuchen, aus der API zu laden
        const response = await fetch(`/api/guides/${slug}`)
        if (response.ok) {
          const result = await response.json()
          setGuide(result.guide)
          setCanEdit(result.guide.canEdit || false)
        } else {
          setError('Guide nicht gefunden')
        }
      } catch (err) {
        console.error('Error loading guide:', err)
        setError('Fehler beim Laden des Guides')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadGuide()
    }
  }, [slug])

  const handleDelete = async () => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Guide löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/guides/${slug}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Guide erfolgreich gelöscht!')
        router.push('/')
      } else {
        const result = await response.json()
        alert(`Fehler beim Löschen: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting guide:', error)
      alert('Fehler beim Löschen des Guides')
    } finally {
      setIsDeleting(false)
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Anfänger':
        return 'text-green-400 bg-green-400/20 border-green-400/30'
      case 'Fortgeschritten':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      case 'Experte':
        return 'text-red-400 bg-red-400/20 border-red-400/30'
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30'
    }
  }

  const renderSection = (section: GuideSection) => {
    switch (section.type) {
      case 'text':
        return (
          <div 
            className="text-white/90 text-sm sm:text-base leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        )
      case 'code':
        return (
          <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-green-300 whitespace-pre-wrap">
              {section.content}
            </pre>
          </div>
        )
      case 'path':
        return (
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
            <code className="text-blue-300 font-mono text-sm">
              {section.content}
            </code>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80">Lade Guide...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !guide) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold text-white mb-4">
              {error || 'Guide nicht gefunden'}
            </h1>
            <Link href="/" className="glass-button text-white px-6 py-3 rounded-lg">
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zu den Guides
          </Link>
        </div>

        {/* Guide Header */}
        <div className="glass-card p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
            <div className="flex-1 mb-4 lg:mb-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-400/30">
                  {guide.category}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full border ${getDifficultyColor(guide.difficulty)}`}>
                  {guide.difficulty}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {guide.title}
              </h1>
              
              <p className="text-white/80 text-lg mb-6">
                {guide.description}
              </p>
            </div>

            {/* Bearbeitungs- und Löschbuttons */}
            {user && canEdit && (
              <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                <Link
                  href={`/guide-editor?edit=${slug}`}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Bearbeiten
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm font-medium rounded-lg transition-colors duration-300"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Löschen...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Löschen
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Guide Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-black/20 rounded-lg border border-white/10">
            {/* Author */}
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-2">Autor</h3>
              <div className="flex items-center">
                {guide.authorImage ? (
                  <img 
                    src={guide.authorImage} 
                    alt={guide.author}
                    className="w-8 h-8 rounded-full mr-3 border border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">
                      {guide.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{guide.author}</p>
                  {guide.authorRole && (
                    <p className="text-white/60 text-sm">{guide.authorRole}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reading Time */}
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-2">Lesezeit</h3>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-white/60 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white">{guide.readTime}</span>
              </div>
            </div>

            {/* Published Date */}
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-2">Veröffentlicht</h3>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-white/60 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white">
                  {new Date(guide.publishedAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>

            {/* Last Updated */}
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-2">Aktualisiert</h3>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-white/60 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-white">
                  {new Date(guide.updatedAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
          </div>

          {/* Operating Systems */}
          {guide.operatingSystem && guide.operatingSystem.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white/80 text-sm font-medium mb-3">Unterstützte Betriebssysteme</h3>
              <div className="flex flex-wrap gap-2">
                {guide.operatingSystem.map((os, index) => (
                  <span 
                    key={index}
                    className="px-3 py-2 bg-purple-500/20 text-purple-300 text-sm rounded-lg border border-purple-400/30 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    {os}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {guide.tags && guide.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white/80 text-sm font-medium mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {guide.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full hover:bg-white/20 transition-colors duration-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Guide Content */}
        <div className="glass-card p-6 sm:p-8 md:p-10 mb-8">
          <div className="space-y-6 sm:space-y-8">
            {guide.sections && guide.sections.length > 0 ? (
              guide.sections.map((section, index) => (
                <div key={section.id || index}>
                  {renderSection(section)}
                </div>
              ))
            ) : (
              <div className="text-white/60 text-center py-8">
                <p>Dieser Guide hat noch keinen Inhalt.</p>
              </div>
            )}
          </div>
        </div>

        {/* Like/Dislike Section */}
        <div className="glass-card p-6 sm:p-8 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <button 
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
                onClick={() => {
                  // Add like functionality here
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v3M4 7l2-1V4a1 1 0 011-1h5a1 1 0 011 1v3l2-1m-2 1l-2 1m2-1v2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <span>{guide.likes || 0}</span>
              </button>
              <button 
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
                onClick={() => {
                  // Add dislike functionality here
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.293A2.955 2.955 0 013 12.5V8.386a2.955 2.955 0 012.293-1.707L10 2m7 7h5m-5 4v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5m7-7H2" />
                </svg>
                <span>{guide.dislikes || 0}</span>
              </button>
            </div>
            <div className="text-white/60">
              {guide.likes - guide.dislikes} Gesamtbewertung
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Kommentare</h2>
          
          {/* New Comment Form */}
          <div className="mb-8">
            <form onSubmit={handleSubmitComment} className="flex flex-col space-y-4">
              <textarea
                placeholder="Dein Kommentar..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-transparent border border-white/20 rounded-lg p-4 text-white placeholder-white/50"
                rows={3}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className={`inline-flex items-center justify-center px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-300 ${
                  isSubmitting || !newComment.trim()
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Senden...
                  </>
                ) : (
                  'Kommentar hinzufügen'
                )}
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {loading ? (
              <div className="glass-card p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-3/4"></div>
                </div>
              </div>
            ) : guide?.comments?.length ? (
              guide.comments.map((comment) => (
                <div key={comment.id} className="glass-card p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-300 font-bold">
                            {comment.author.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{comment.author}</p>
                          <p className="text-white/60 text-sm">
                            {new Date(comment.createdAt).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      </div>
                      <p className="text-white/90 text-sm">{comment.content}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <button 
                        onClick={() => handleVote(comment.id, 'like')}
                        disabled={isVoting}
                        className={`flex items-center transition-colors ${
                          isVoting ? 'text-white/40 cursor-not-allowed' : 'text-white/70 hover:text-white'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v3M4 7l2-1V4a1 1 0 011-1h5a1 1 0 011 1v3l2-1m-2 1l-2 1m2-1v2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                        <span>{comment.likes}</span>
                      </button>
                      <button 
                        onClick={() => handleVote(comment.id, 'dislike')}
                        disabled={isVoting}
                        className={`flex items-center transition-colors ${
                          isVoting ? 'text-white/40 cursor-not-allowed' : 'text-white/70 hover:text-white'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.293A2.955 2.955 0 013 12.5V8.386a2.955 2.955 0 012.293-1.707L10 2m7 7h5m-5 4v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5m7-7H2" />
                        </svg>
                        <span>{comment.dislikes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-4">
                <p className="text-white/60 text-center">Keine Kommentare vorhanden.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}