
const AVATAR_COLORS = [
  'bg-primary',
  'bg-secondary',
  'bg-accent',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
]

export function getUserInitials(username) {
  if (!username || typeof username !== 'string') return '?'
  return username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getUserColor(userId, allUsers = []) {
  const index = allUsers.findIndex((u) => u.id === userId) % AVATAR_COLORS.length
  return AVATAR_COLORS[index] || AVATAR_COLORS[0]
}
