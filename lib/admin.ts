// Admin-Konfiguration aus Umgebungsvariablen
const getAdminUserIds = (): string[] => {
  const adminIds = process.env.ADMIN_USER_IDS || ''
  return adminIds.split(',').map(id => id.trim()).filter(id => id.length > 0)
}

const getAdminEmails = (): string[] => {
  const adminEmails = process.env.ADMIN_EMAILS || ''
  return adminEmails.split(',').map(email => email.trim()).filter(email => email.length > 0)
}

export const ADMIN_USER_IDS = getAdminUserIds()
export const ADMIN_EMAILS = getAdminEmails()

// Prüft ob ein Benutzer Admin ist
export const isAdmin = (userId?: string | null, userEmail?: string | null): boolean => {
  if (!userId && !userEmail) return false
  
  // Prüfe User ID
  if (userId && ADMIN_USER_IDS.includes(userId)) {
    return true
  }
  
  // Prüfe E-Mail als Fallback
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
    return true
  }
  
  return false
}

// Prüft ob ein Benutzer berechtigt ist, einen Kommentar zu löschen
export const canDeleteComment = (
  currentUserId?: string | null, 
  currentUserEmail?: string | null,
  commentUserId?: string
): boolean => {
  // Admin kann alles löschen
  if (isAdmin(currentUserId, currentUserEmail)) {
    return true
  }
  
  // Benutzer kann nur eigene Kommentare löschen
  return currentUserId === commentUserId
}

// Prüft ob ein Benutzer berechtigt ist, einen Kommentar zu bearbeiten
export const canEditComment = (
  currentUserId?: string | null,
  commentUserId?: string
): boolean => {
  // Nur der Autor kann seinen eigenen Kommentar bearbeiten
  // (Admins können nicht bearbeiten, nur löschen)
  return currentUserId === commentUserId
}