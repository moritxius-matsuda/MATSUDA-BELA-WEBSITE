// In-Memory Storage für Demo-Zwecke
// In Produktion würde man eine echte Datenbank verwenden

export interface Comment {
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
  userReactions: { [userId: string]: 'like' | 'dislike' }
  parentId?: string // Für Antworten auf andere Kommentare
  replies?: Comment[] // Verschachtelte Antworten
  replyCount: number // Anzahl der Antworten
}

export interface GuideRating {
  guideSlug: string
  totalLikes: number
  totalDislikes: number
  userReactions: { [userId: string]: 'like' | 'dislike' }
  createdAt: string
  updatedAt: string
}

// Globale Storage-Objekte
export const commentsStorage: { [guideSlug: string]: Comment[] } = {}
export const ratingsStorage: { [guideSlug: string]: GuideRating } = {}

// Hilfsfunktionen
export const getComments = (guideSlug: string): Comment[] => {
  const allComments = commentsStorage[guideSlug] || []
  
  // Organisiere Kommentare in einer Hierarchie
  const topLevelComments = allComments.filter(c => !c.parentId)
  const replies = allComments.filter(c => c.parentId)
  
  // Füge Antworten zu ihren Eltern-Kommentaren hinzu
  topLevelComments.forEach(comment => {
    comment.replies = replies.filter(r => r.parentId === comment.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    comment.replyCount = comment.replies.length
  })
  
  return topLevelComments
}

export const addComment = (guideSlug: string, comment: Comment): void => {
  if (!commentsStorage[guideSlug]) {
    commentsStorage[guideSlug] = []
  }
  commentsStorage[guideSlug].push(comment)
}

export const getComment = (guideSlug: string, commentId: string): Comment | undefined => {
  const comments = commentsStorage[guideSlug] || []
  return comments.find(c => c.id === commentId)
}

export const getAllComments = (guideSlug: string): Comment[] => {
  return commentsStorage[guideSlug] || []
}

export const updateComment = (guideSlug: string, commentId: string, updates: Partial<Comment>): boolean => {
  const comments = commentsStorage[guideSlug] || []
  const commentIndex = comments.findIndex(c => c.id === commentId)
  
  if (commentIndex === -1) return false
  
  commentsStorage[guideSlug][commentIndex] = {
    ...commentsStorage[guideSlug][commentIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  return true
}

export const getRating = (guideSlug: string): GuideRating => {
  return ratingsStorage[guideSlug] || {
    guideSlug,
    totalLikes: 0,
    totalDislikes: 0,
    userReactions: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export const updateRating = (guideSlug: string, updates: Partial<GuideRating>): void => {
  if (!ratingsStorage[guideSlug]) {
    ratingsStorage[guideSlug] = getRating(guideSlug)
  }
  
  ratingsStorage[guideSlug] = {
    ...ratingsStorage[guideSlug],
    ...updates,
    updatedAt: new Date().toISOString()
  }
}