import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { api } from '../config/api'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Input } from '../components/ui/input'
import {
  MessageCircle,
  Send,
  Users,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  FileArchive,
  File,
  Download,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Bell,
  MoreHorizontal,
  ArrowLeft,
  Bookmark,
  Video,
  Music,
  Link2,
  Reply,
  Quote,
  Trash2,
  Smile,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  BarChart2,
  Megaphone,
  Plus,
  Pin,
  PinOff,
  Star,
  Settings,
  User,
  Pencil,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet'
import {
  format as formatDate,
  formatDistanceToNow,
  startOfDay,
  startOfMonth,
  startOfWeek,
  addDays,
  addMonths,
  subMonths,
  isToday,
  isYesterday,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '../lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
  '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '✨',
  '🔥', '⭐', '🌟', '💫', '✅', '❌', '❗', '❓', '‼️', '💯', '🎉', '🎊', '🙏', '👏', '💪', '🚀', '👍', '😎', '🥳', '😊',
]

const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || ''
const GIPHY_BASE = 'https://api.giphy.com/v1'

const STORAGE_KEY = 'kosta_daily_messages'
const CHAT_SETTINGS_KEY = 'kosta_daily_chat_settings'
const MAX_FILES_PER_MESSAGE = 5

const CHAT_COLOR_PRESETS = [
  { name: 'Синий', value: 'hsl(var(--primary))' },
  { name: 'Зелёный', value: '#22c55e' },
  { name: 'Фиолетовый', value: '#8b5cf6' },
  { name: 'Розовый', value: '#ec4899' },
  { name: 'Оранжевый', value: '#f97316' },
  { name: 'Бирюзовый', value: '#14b8a6' },
  { name: 'Красный', value: '#ef4444' },
  { name: 'Индиго', value: '#6366f1' },
  { name: 'Изумрудный', value: '#10b981' },
  { name: 'Небесный', value: '#0ea5e9' },
  { name: 'Роза', value: '#f43f5e' },
  { name: 'Янтарный', value: '#eab308' },
]

const CHAT_GRADIENT_PRESETS = [
  { name: 'Синий → Фиолетовый', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Розовый закат', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Океан', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Зелёный сад', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Огонь', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Фиолетовый сон', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { name: 'Тёмная ночь', value: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)' },
  { name: 'Манго', value: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)' },
  { name: 'Лаванда', value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { name: 'Изумруд', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Космос', value: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)' },
  { name: 'Персик', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
]

const CHAT_ALL_PRESETS = [...CHAT_COLOR_PRESETS, ...CHAT_GRADIENT_PRESETS]
const isGradient = (v) => typeof v === 'string' && v.includes('gradient')

function loadChatSettings() {
  try {
    const raw = localStorage.getItem(CHAT_SETTINGS_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return typeof data === 'object' && data !== null ? data : {}
  } catch {
    return {}
  }
}

function saveChatSettings(settingsMap) {
  try {
    localStorage.setItem(CHAT_SETTINGS_KEY, JSON.stringify(settingsMap))
  } catch {}
}

const REACTION_EMOJIS = ['👍', '👎', '❤️', '😂', '😮', '😢', '🔥', '👏']

function getDateLabel(date) {
  const d = startOfDay(date)
  if (isToday(d)) return 'Сегодня'
  if (isYesterday(d)) return 'Вчера'
  const str = formatDate(d, 'd MMMM yyyy', { locale: ru })
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function groupMessagesByDate(messages) {
  const map = {}
  messages.forEach((m) => {
    const d = startOfDay(new Date(m.createdAt))
    const key = formatDate(d, 'yyyy-MM-dd')
    if (!map[key]) map[key] = { date: d, dateKey: key, messages: [] }
    map[key].messages.push(m)
  })
  return Object.values(map).sort((a, b) => a.date - b.date)
}

function getFileIcon(type, name = '') {
  const t = (type || '').toLowerCase()
  const n = (name || '').toLowerCase()
  if (t.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(n)) return ImageIcon
  if (t.includes('pdf') || n.endsWith('.pdf')) return FileText
  if (t.includes('zip') || t.includes('archive') || /\.(zip|rar|7z)$/i.test(n)) return FileArchive
  return File
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi

function extractUrlsFromText(text) {
  if (!text || typeof text !== 'string') return []
  const matches = text.match(URL_REGEX) || []
  return [...new Set(matches)]
}

function getFileCategory(att) {
  const name = (att.name || '').toLowerCase()
  const type = (att.type || '').toLowerCase()
  if (name.endsWith('.pdf') || type.includes('pdf')) return 'pdf'
  if (name.endsWith('.doc') || name.endsWith('.docx') || type.includes('word') || type.includes('msword') || type.includes('document')) return 'docx'
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || type.includes('sheet') || type.includes('excel')) return 'xlsx'
  if (name.endsWith('.txt') || type.includes('text/plain')) return 'txt'
  return 'other'
}

const FILE_CATEGORY_LABELS = {
  pdf: 'PDF',
  docx: 'Документы Word',
  xlsx: 'Таблицы Excel',
  txt: 'Текстовые файлы',
  other: 'Другие файлы',
}

const MENTION_REGEX = /@([a-zA-Z0-9_.]+)/g

function renderTextWithLinks(text, className = '', isOwnMessage = false) {
  if (!text || typeof text !== 'string') return null
  const parts = []
  let lastIndex = 0
  let match
  const re = new RegExp(URL_REGEX.source, 'gi')
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'link', value: match[0] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }
  if (parts.length === 0) {
    parts.push({ type: 'text', value: text })
  }
  const linkClass = isOwnMessage
    ? 'text-white underline underline-offset-2 decoration-2 decoration-white/80 break-all hover:decoration-white'
    : 'text-blue-600 dark:text-blue-400 underline underline-offset-2 decoration-2 break-all hover:opacity-80'
  const mentionClass = isOwnMessage
    ? 'text-amber-200 font-medium'
    : 'text-primary font-medium'
  const renderPart = (p, i) => {
    if (p.type === 'link') {
      return (
        <a key={i} href={p.value} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {p.value}
        </a>
      )
    }
    if (p.type === 'mention') {
      return (
        <span key={i} className={mentionClass}>@{p.value}</span>
      )
    }
    const textParts = []
    let ti = 0
    const mentionRe = new RegExp(MENTION_REGEX.source, 'g')
    let m
    let lastTi = 0
    while ((m = mentionRe.exec(p.value)) !== null) {
      if (m.index > lastTi) {
        textParts.push({ type: 'text', value: p.value.slice(lastTi, m.index) })
      }
      textParts.push({ type: 'mention', value: m[1] })
      lastTi = m.index + m[0].length
    }
    if (lastTi < p.value.length) {
      textParts.push({ type: 'text', value: p.value.slice(lastTi) })
    }
    if (textParts.length === 0) {
      textParts.push({ type: 'text', value: p.value })
    }
    return (
      <span key={i}>
        {textParts.map((tp, j) =>
          tp.type === 'mention' ? (
            <span key={j} className={mentionClass}>@{tp.value}</span>
          ) : (
            <span key={j}>{tp.value}</span>
          )
        )}
      </span>
    )
  }
  return (
    <span className={className}>
      {parts.map(renderPart)}
    </span>
  )
}

function normalizeMessage(m) {
  const attachments = m.attachments ?? m.files ?? []
  const out = {
    id: m.id,
    authorId: m.author_id ?? m.authorId,
    authorName: m.author_username ?? m.authorName ?? 'Пользователь',
    text: m.text ?? '',
    attachments: Array.isArray(attachments)
      ? attachments.map((a) => ({
          name: a.name ?? a.file_name ?? 'Файл',
          dataUrl: a.data_url ?? a.url ?? a.dataUrl,
          type: a.type ?? a.mime_type ?? '',
          size: a.size ?? 0,
        }))
      : [],
    createdAt: m.created_at ?? m.createdAt,
    replyToId: m.reply_to_id ?? m.replyToId ?? null,
    replyToAuthorName: m.reply_to_author_name ?? m.replyToAuthorName ?? null,
    replyToText: m.reply_to_text ?? m.replyToText ?? null,
    isQuoteReply: m.is_quote_reply ?? m.isQuoteReply ?? false,
    type: m.type ?? null,
    poll: m.poll ?? null,
    notification: m.notification ?? null,
    reactions: Array.isArray(m.reactions)
      ? m.reactions.map((r) => ({ emoji: r.emoji || '👍', userIds: Array.isArray(r.userIds) ? r.userIds : [] }))
      : [],
    recipientId: m.recipient_id ?? m.recipientId ?? null,
  }
  return out
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    const list = Array.isArray(data) ? data : (data.messages || [])
    return list.map(normalizeMessage).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } catch {
    return []
  }
}

function saveToStorage(messages) {
  try {
    const toSave = messages.map((m) => ({
      id: m.id,
      author_id: m.authorId,
      author_username: m.authorName,
      text: m.text,
      attachments: m.attachments ?? [],
      created_at: m.createdAt,
      reply_to_id: m.replyToId ?? null,
      reply_to_author_name: m.replyToAuthorName ?? null,
      reply_to_text: m.replyToText ?? null,
      is_quote_reply: m.isQuoteReply ?? false,
      type: m.type ?? null,
      poll: m.poll ?? null,
      notification: m.notification ?? null,
      reactions: (m.reactions || []).map((r) => ({ emoji: r.emoji, userIds: r.userIds || [] })),
      recipient_id: m.recipientId ?? null,
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {}
}

export const KostaDaily = () => {
  const { user, getAllUsers } = useAuth()
  const { theme } = useTheme()
  const [chatInfoOpen, setChatInfoOpen] = useState(false)
  const [chatInfoTab, setChatInfoTab] = useState('chat') // 'chat' | 'notifications' | 'participants' | 'more'
  const [mediaView, setMediaView] = useState(null) // null | 'favorites' | 'photos' | 'videos' | 'files' | 'audio' | 'links'
  const [mediaFileCategory, setMediaFileCategory] = useState(null) // null | 'pdf' | 'docx' | 'xlsx' | 'txt' | 'other' — при mediaView === 'files'
  const [notificationsMuted, setNotificationsMuted] = useState(() => {
    try {
      return localStorage.getItem('kosta_daily_notifications_muted') === '1'
    } catch {
      return false
    }
  })
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [pendingFiles, setPendingFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(false)
  const messagesEndRef = useRef(null)
  const listRef = useRef(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [emojiPickerTab, setEmojiPickerTab] = useState('emoji') // 'emoji' | 'animated' | 'gif'
  const [gifSearch, setGifSearch] = useState('')
  const [gifSearchInput, setGifSearchInput] = useState('')
  const [gifResults, setGifResults] = useState([])
  const [gifLoading, setGifLoading] = useState(false)
  const gifSearchTimeoutRef = useRef(null)
  const [imageModal, setImageModal] = useState({ open: false, src: '', name: '' })
  const [imageZoom, setImageZoom] = useState(0.8)
  const [imageRotation, setImageRotation] = useState(0)
  const [replyTo, setReplyTo] = useState(null) // { id, authorName, text } | null
  const [isQuoteReply, setIsQuoteReply] = useState(false)
  const [contextMenu, setContextMenu] = useState(null) // { x, y, msg } | null
  const [deletingMessageId, setDeletingMessageId] = useState(null) // id сообщения в процессе анимации удаления
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()))
  const dateSectionRefs = useRef({})
  const [pollDialogOpen, setPollDialogOpen] = useState(false)
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false)
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [pollMultiple, setPollMultiple] = useState(false)
  const [notifTitle, setNotifTitle] = useState('')
  const [notifText, setNotifText] = useState('')
  const [notifImageUrl, setNotifImageUrl] = useState('')
  const notifImageInputRef = useRef(null)
  const [reactionPickerOpenId, setReactionPickerOpenId] = useState(null)
  const [directChatUserId, setDirectChatUserId] = useState(null) // null = общий чат, иначе id пользователя для личной переписки
  const [userListContextMenu, setUserListContextMenu] = useState(null) // { x, y, user } | null
  const [pinnedUserIds, setPinnedUserIds] = useState(() => {
    try {
      const raw = localStorage.getItem('kosta_daily_pinned_users')
      if (!raw) return []
      const arr = JSON.parse(raw)
      return Array.isArray(arr) ? arr : []
    } catch { return [] }
  })
  const [chatSettingsMap, setChatSettingsMap] = useState(loadChatSettings)
  const [chatSettingsDialogOpen, setChatSettingsDialogOpen] = useState(false)
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionStartPos, setMentionStartPos] = useState(0)
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0)
  const mentionListRef = useRef(null)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('')
  const [profileColor, setProfileColor] = useState(CHAT_ALL_PRESETS[0].value)
  const [profileDisplayName, setProfileDisplayName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileShowBio, setProfileShowBio] = useState(true)
  const [userListSheetOpen, setUserListSheetOpen] = useState(false)
  const chatSettingsFileInputRef = useRef(null)

  useEffect(() => {
    if (chatSettingsDialogOpen && user?.id) {
      const s = chatSettingsMap[user.id] || {}
      setProfileAvatarUrl(s.avatarUrl ?? '')
      setProfileColor(s.color ?? CHAT_ALL_PRESETS[0].value)
      setProfileDisplayName(s.displayName ?? '')
      setProfileBio(s.bio ?? '')
      setProfileShowBio(s.showBio !== false)
    }
  }, [chatSettingsDialogOpen, user?.id, chatSettingsMap])

  const saveChatProfileSettings = useCallback(() => {
    if (!user?.id) return
    const next = { ...chatSettingsMap }
    next[user.id] = {
      avatarUrl: profileAvatarUrl || undefined,
      color: profileColor,
      displayName: profileDisplayName.trim() || undefined,
      bio: profileBio.trim() || undefined,
      showBio: profileShowBio,
    }
    setChatSettingsMap(next)
    saveChatSettings(next)
    setChatSettingsDialogOpen(false)
  }, [user?.id, chatSettingsMap, profileAvatarUrl, profileColor, profileDisplayName, profileBio, profileShowBio])

  const openImageModal = useCallback((src, name) => {
    setImageModal({ open: true, src, name })
    setImageZoom(0.8)
    setImageRotation(0)
  }, [])

  const closeImageModal = useCallback(() => {
    setImageModal((prev) => ({ ...prev, open: false }))
    setImageZoom(0.8)
    setImageRotation(0)
  }, [])

  const handleImageDownload = useCallback(() => {
    if (!imageModal.src) return
    const a = document.createElement('a')
    a.href = imageModal.src
    a.download = imageModal.name || 'image.jpg'
    a.click()
  }, [imageModal.src, imageModal.name])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const loadMessages = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getKostaDailyMessages({ limit: 100 })
      const list = Array.isArray(data) ? data : (data?.messages ?? data?.items ?? [])
      const normalized = list.map(normalizeMessage).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      setMessages(normalized)
      setApiAvailable(true)
    } catch {
      const stored = loadFromStorage()
      setMessages(stored)
      setApiAvailable(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const [filesLoading, setFilesLoading] = useState(false)
  const handleFileSelect = (e) => {
    const chosen = Array.from(e.target.files || [])
    if (chosen.length === 0) return
    const valid = chosen.slice(0, Math.max(0, MAX_FILES_PER_MESSAGE - pendingFiles.length))
    if (valid.length === 0) return

    const newPending = valid.map((file) => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl: null,
      loading: true,
    }))
    setPendingFiles((prev) => [...prev, ...newPending])
    setFilesLoading(true)

    const toRead = newPending.map((p) =>
      new Promise((resolve) => {
        const r = new FileReader()
        r.onload = () => resolve({ ...p, dataUrl: r.result, loading: false })
        r.readAsDataURL(p.file)
      })
    )
    Promise.all(toRead).then((read) => {
      setPendingFiles((prev) => {
        const start = prev.length - read.length
        const next = [...prev]
        read.forEach((r, i) => {
          next[start + i] = r
        })
        return next
      })
      setFilesLoading(false)
    })
    e.target.value = ''
  }

  const removePendingFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    const text = inputValue.trim()
    const hasFiles = pendingFiles.some((p) => p.dataUrl)
    if ((!text && !hasFiles) || !user) return

    const attachments = pendingFiles
      .filter((p) => p.dataUrl)
      .map((p) => ({
        name: p.name,
        dataUrl: p.dataUrl,
        type: p.type,
        size: p.size,
      }))

    const tempId = `temp-${Date.now()}`
    const newMsg = {
      id: tempId,
      authorId: user.id,
      authorName: user.username,
      text: text || '',
      attachments,
      createdAt: new Date().toISOString(),
      replyToId: replyTo?.id ?? null,
      replyToAuthorName: replyTo?.authorName ?? null,
      replyToText: replyTo?.text ?? null,
      isQuoteReply: isQuoteReply,
      recipientId: directChatUserId ?? null,
    }

    setMessages((prev) => [...prev, newMsg])
    setInputValue('')
    setPendingFiles([])
    setReplyTo(null)
    setIsQuoteReply(false)
    setSending(true)

    if (apiAvailable) {
      try {
        const created = await api.sendKostaDailyMessage(text || ' ', attachments)
        const normalized = normalizeMessage(created)
        if (attachments.length > 0 && (!normalized.attachments || normalized.attachments.length === 0)) {
          normalized.attachments = attachments
        }
        setMessages((prev) => prev.map((m) => (m.id === tempId ? normalized : m)))
      } catch {
        setApiAvailable(false)
        const stored = loadFromStorage()
        saveToStorage([...stored, newMsg])
      }
    } else {
      const stored = loadFromStorage()
      saveToStorage([...stored, newMsg])
    }
    setSending(false)
    scrollToBottom()
  }

  useEffect(() => {
    if (!mentionOpen || !mentionListRef.current) return
    const list = mentionListRef.current
    const btn = list.querySelector(`[data-mention-index="${mentionSelectedIndex}"]`)
    btn?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [mentionOpen, mentionSelectedIndex])

  const insertMention = useCallback((username) => {
    const pos = mentionStartPos + 1 + mentionQuery.length
    const newValue = inputValue.slice(0, mentionStartPos) + '@' + username + ' ' + inputValue.slice(pos)
    setInputValue(newValue)
    setMentionOpen(false)
    setTimeout(() => {
      textareaRef.current?.focus()
      const caret = mentionStartPos + username.length + 2
      textareaRef.current?.setSelectionRange(caret, caret)
    }, 0)
  }, [inputValue, mentionStartPos, mentionQuery])

  const handleKeyDown = (e) => {
    if (mentionOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionSelectedIndex((i) => Math.min(i + 1, mentionFilteredUsers.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionSelectedIndex((i) => Math.max(0, i - 1))
        return
      }
      if (e.key === 'Enter' && mentionFilteredUsers.length > 0) {
        e.preventDefault()
        const u = mentionFilteredUsers[mentionSelectedIndex] ?? mentionFilteredUsers[0]
        if (u?.username) insertMention(u.username)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setMentionOpen(false)
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleContextMenu = (e, msg) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, msg })
  }

  const insertEmoji = useCallback((emoji) => {
    const ta = textareaRef.current
    if (ta) {
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newValue = inputValue.slice(0, start) + emoji + inputValue.slice(end)
      setInputValue(newValue)
      setEmojiPickerOpen(false)
      setTimeout(() => {
        ta.focus()
        const pos = start + emoji.length
        ta.setSelectionRange(pos, pos)
      }, 0)
    } else {
      setInputValue((v) => v + emoji)
      setEmojiPickerOpen(false)
    }
  }, [inputValue])

  const sendGifOrStickerImmediately = useCallback(async (gifUrl) => {
    if (!user || !gifUrl) return
    setEmojiPickerOpen(false)
    const attachments = [{ name: 'GIF', dataUrl: gifUrl, type: 'image/gif', size: 0 }]
    const tempId = `temp-${Date.now()}`
    const newMsg = {
      id: tempId,
      authorId: user.id,
      authorName: user.username,
      text: '',
      attachments,
      createdAt: new Date().toISOString(),
      replyToId: null,
      replyToAuthorName: null,
      replyToText: null,
      isQuoteReply: false,
      recipientId: directChatUserId ?? null,
    }
    setMessages((prev) => [...prev, newMsg])
    setSending(true)
    if (apiAvailable) {
      try {
        const created = await api.sendKostaDailyMessage(' ', attachments)
        const normalized = normalizeMessage(created)
        if (!normalized.attachments?.length) normalized.attachments = attachments
        setMessages((prev) => prev.map((m) => (m.id === tempId ? normalized : m)))
      } catch {
        setApiAvailable(false)
        const stored = loadFromStorage()
        saveToStorage([...stored, newMsg])
      }
    } else {
      const stored = loadFromStorage()
      saveToStorage([...stored, newMsg])
    }
    setSending(false)
    scrollToBottom()
  }, [user, apiAvailable, directChatUserId, scrollToBottom])

  const addGifToMessage = useCallback((gifUrl) => {
    sendGifOrStickerImmediately(gifUrl)
  }, [sendGifOrStickerImmediately])

  const handleCreatePoll = useCallback(() => {
    const question = pollQuestion.trim()
    const opts = pollOptions.map((t) => t.trim()).filter(Boolean)
    if (!user || !question || opts.length < 2) return
    const newMsg = {
      id: `poll-${Date.now()}`,
      authorId: user.id,
      authorName: user.username,
      text: '',
      attachments: [],
      createdAt: new Date().toISOString(),
      type: 'poll',
      recipientId: directChatUserId ?? null,
      poll: {
        question,
        multiple: pollMultiple,
        options: opts.map((text, i) => ({ id: `opt-${i}`, text, votes: 0, voterIds: [] })),
      },
    }
    setMessages((prev) => [...prev, newMsg])
    const stored = loadFromStorage()
    saveToStorage([...stored, newMsg])
    setPollDialogOpen(false)
    setPollQuestion('')
    setPollOptions(['', ''])
    setPollMultiple(false)
    setCreateMenuOpen(false)
    scrollToBottom()
  }, [user, pollQuestion, pollOptions, pollMultiple, directChatUserId, scrollToBottom])

  const handleCreateNotification = useCallback(() => {
    const title = notifTitle.trim()
    const text = notifText.trim()
    if (!user || !text) return
    const newMsg = {
      id: `notif-${Date.now()}`,
      authorId: user.id,
      authorName: user.username,
      text: '',
      attachments: [],
      createdAt: new Date().toISOString(),
      type: 'notification',
      recipientId: directChatUserId ?? null,
      notification: { title: title || null, text, imageUrl: notifImageUrl || null },
    }
    setMessages((prev) => [...prev, newMsg])
    const stored = loadFromStorage()
    saveToStorage([...stored, newMsg])
    setNotificationDialogOpen(false)
    setNotifTitle('')
    setNotifText('')
    setNotifImageUrl('')
    setCreateMenuOpen(false)
    scrollToBottom()
  }, [user, notifTitle, notifText, notifImageUrl, directChatUserId, scrollToBottom])

  const handleVotePoll = useCallback((msgId, optionId) => {
    const uid = user?.id
    if (!uid) return
    setMessages((prev) => {
      const next = prev.map((m) => {
        if (m.id !== msgId || m.type !== 'poll' || !m.poll) return m
        const opt = m.poll.options.find((o) => o.id === optionId)
        if (!opt) return m
        const newOptions = m.poll.options.map((o) => {
          let ids = [...(o.voterIds || [])]
          if (o.id === optionId) {
            if (ids.includes(uid)) ids = ids.filter((id) => id !== uid)
            else ids = m.poll.multiple ? [...ids, uid] : [...ids, uid]
          } else if (!m.poll.multiple) ids = ids.filter((id) => id !== uid)
          return { ...o, voterIds: ids, votes: ids.length }
        })
        return { ...m, poll: { ...m.poll, options: newOptions } }
      })
      saveToStorage(next)
      return next
    })
  }, [user?.id])

  const handleToggleReaction = useCallback((msgId, emoji) => {
    const uid = user?.id
    if (!uid) return
    setMessages((prev) => {
      const next = prev.map((m) => {
        if (m.id !== msgId) return m
        const reactions = [...(m.reactions || [])]
        const idx = reactions.findIndex((r) => r.emoji === emoji)
        if (idx >= 0) {
          const userIds = [...(reactions[idx].userIds || [])]
          const i = userIds.indexOf(uid)
          if (i >= 0) userIds.splice(i, 1)
          else userIds.push(uid)
          if (userIds.length === 0) reactions.splice(idx, 1)
          else reactions[idx] = { ...reactions[idx], userIds }
        } else {
          reactions.push({ emoji, userIds: [uid] })
        }
        return { ...m, reactions }
      })
      saveToStorage(next)
      return next
    })
  }, [user?.id])

  useEffect(() => {
    if (!emojiPickerOpen || !GIPHY_API_KEY) {
      if (!GIPHY_API_KEY && (emojiPickerTab === 'gif' || emojiPickerTab === 'animated')) setGifResults([])
      return
    }
    if (emojiPickerTab === 'emoji') return

    const fetchGifs = async () => {
      setGifLoading(true)
      try {
        const endpoint = emojiPickerTab === 'animated'
          ? `${GIPHY_BASE}/stickers/trending?api_key=${GIPHY_API_KEY}&limit=24`
          : gifSearch.trim()
            ? `${GIPHY_BASE}/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(gifSearch.trim())}&limit=24`
            : `${GIPHY_BASE}/gifs/trending?api_key=${GIPHY_API_KEY}&limit=24`
        const res = await fetch(endpoint)
        const json = await res.json()
        const list = (json.data || []).map((g) => ({
          id: g.id,
          url: g.images?.fixed_height_small?.url || g.images?.downsized_medium?.url || g.images?.original?.url,
          title: g.title || '',
        })).filter((g) => g.url)
        setGifResults(list)
      } catch {
        setGifResults([])
      } finally {
        setGifLoading(false)
      }
    }

    if (emojiPickerTab === 'animated') {
      fetchGifs()
      return
    }
    if (gifSearchTimeoutRef.current) clearTimeout(gifSearchTimeoutRef.current)
    gifSearchTimeoutRef.current = setTimeout(fetchGifs, 400)
    return () => { if (gifSearchTimeoutRef.current) clearTimeout(gifSearchTimeoutRef.current) }
  }, [emojiPickerOpen, emojiPickerTab, GIPHY_API_KEY, gifSearch])

  const onEmojiPickerOpenChange = (open) => {
    setEmojiPickerOpen(open)
    if (!open) {
      setEmojiPickerTab('emoji')
      setGifSearch('')
      setGifSearchInput('')
      setGifResults([])
    }
  }

  const handleDeleteMessage = useCallback((msg) => {
    if (!msg?.id) return
    setContextMenu(null)
    setDeletingMessageId(msg.id)
    const duration = 300
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
      const stored = loadFromStorage().filter((m) => m.id !== msg.id)
      saveToStorage(stored)
      setDeletingMessageId(null)
    }, duration)
  }, [])

  const visibleMessages = useMemo(() => {
    if (!directChatUserId) return messages.filter((m) => !m.recipientId)
    return messages.filter(
      (m) =>
        (m.authorId === user?.id && m.recipientId === directChatUserId) ||
        (m.authorId === directChatUserId && m.recipientId === user?.id)
    )
  }, [messages, directChatUserId, user?.id])

  const messageGroupsByDate = useMemo(() => groupMessagesByDate(visibleMessages), [visibleMessages])

  const openCalendarAtDate = useCallback((date) => {
    setCalendarMonth(startOfMonth(date))
    setCalendarOpen(true)
  }, [])

  const goToDateAndCloseCalendar = useCallback((date) => {
    const key = formatDate(startOfDay(date), 'yyyy-MM-dd')
    dateSectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setCalendarOpen(false)
  }, [])

  const canSend = (inputValue.trim() || pendingFiles.some((p) => p.dataUrl)) && !sending

  const allUsers = useMemo(() => getAllUsers?.() || [], [getAllUsers])
  const mentionFilteredUsers = useMemo(() => {
    if (!mentionOpen || !mentionQuery.trim()) return allUsers.slice(0, 8)
    const q = mentionQuery.toLowerCase().trim()
    return allUsers
      .filter((u) => (u.username || '').toLowerCase().startsWith(q))
      .slice(0, 8)
  }, [allUsers, mentionOpen, mentionQuery])
  const getUserById = useCallback((id) => allUsers.find((u) => String(u.id) === String(id)), [allUsers])
  const getRoleText = useCallback((role) => {
    switch (role) {
      case 'admin': return 'Администратор'
      case 'it': return 'IT Отдел'
      case 'user': return 'Пользователь'
      default: return role || '—'
    }
  }, [])

  const calendarGridStart = useMemo(
    () => startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 1 }),
    [calendarMonth]
  )
  const calendarDays = useMemo(
    () => eachDayOfInterval({ start: calendarGridStart, end: addDays(calendarGridStart, 41) }),
    [calendarGridStart]
  )
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  const otherUsers = useMemo(
    () => allUsers.filter((u) => String(u.id) !== String(user?.id)),
    [allUsers, user?.id]
  )
  const sortedOtherUsers = useMemo(() => {
    const pinned = pinnedUserIds
      .map((id) => otherUsers.find((u) => String(u.id) === id))
      .filter(Boolean)
    const rest = otherUsers.filter((u) => !pinnedUserIds.includes(String(u.id)))
    return [...pinned, ...rest]
  }, [otherUsers, pinnedUserIds])

  const togglePinUser = useCallback((userId) => {
    const id = String(userId)
    setPinnedUserIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try {
        localStorage.setItem('kosta_daily_pinned_users', JSON.stringify(next))
      } catch {}
      return next
    })
    setUserListContextMenu(null)
  }, [])

  const directChatUser = directChatUserId ? getUserById(directChatUserId) : null
  const chatTitle = directChatUserId ? (directChatUser?.username ?? 'Пользователь') : 'Kosta Daily'
  const chatSubtitle = directChatUserId ? 'Личная переписка' : 'Групповой чат для всех пользователей системы'

  return (
    <div className="h-full flex min-h-0 bg-background">
      <aside
        className={cn(
          'flex-shrink-0 flex flex-col border-r overflow-hidden border-border bg-card transition-[width] duration-200',
          'hidden md:flex md:w-[72px] lg:w-[260px]'
        )}
      >
        <div className="h-14 md:h-[77px] shrink-0 flex flex-col justify-center px-3 lg:px-6 border-b border-border">
          <button
            type="button"
            onClick={() => setDirectChatUserId(null)}
            className={cn(
              'w-full flex items-center gap-2 rounded-lg px-2 py-1.5 sm:px-2.5 text-left transition-colors',
              !directChatUserId ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-muted-foreground'
            )}
          >
            <div className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
              !directChatUserId ? 'bg-primary/30' : 'bg-muted'
            )}>
              <MessageCircle className="h-4 w-4 shrink-0" />
            </div>
            <span className="hidden lg:inline text-sm font-medium truncate">Общий чат</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3 lg:px-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:block mb-2">Написать пользователю</p>
          <div className="space-y-0.5">
            {sortedOtherUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-2 hidden sm:block">Нет других пользователей</p>
            ) : null}
            {sortedOtherUsers.map((u) => {
              const isSelected = directChatUserId === String(u.id)
              const isPinned = pinnedUserIds.includes(String(u.id))
              const isAdmin = u.role === 'admin'
              const name = chatSettingsMap[u.id]?.displayName || u.username || 'Пользователь'
              const avatarUrl = chatSettingsMap[u.id]?.avatarUrl
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setDirectChatUserId(String(u.id))}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setUserListContextMenu({ x: e.clientX, y: e.clientY, user: u })
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 rounded-xl px-2 py-2 sm:px-3 text-left transition-colors',
                    isSelected
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                  title={name}
                >
                  <div className={cn(
                    'flex h-9 w-9 shrink-0 rounded-full overflow-hidden items-center justify-center text-xs font-semibold',
                    !avatarUrl && (isSelected ? 'bg-primary/30 text-primary-foreground' : 'bg-muted text-foreground')
                  )}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (name || '?').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
                    <span className="truncate">{name}</span>
                    {isAdmin && (
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0 flex-shrink-0" aria-hidden title="Администратор" />
                    )}
                  </span>
                  {isPinned && (
                    <Pin className="h-3.5 w-3.5 shrink-0 text-muted-foreground hidden sm:block" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Контекстное меню списка пользователей */}
      {userListContextMenu && (
        <>
          <div
            className="fixed inset-0 z-[99]"
            onClick={() => setUserListContextMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); setUserListContextMenu(null); }}
          />
          <div
            className="fixed z-[100] rounded-lg shadow-lg py-1 min-w-[200px] bg-card border border-border"
            style={{ left: userListContextMenu.x, top: userListContextMenu.y }}
          >
            <button
              type="button"
              onClick={() => {
                setDirectChatUserId(String(userListContextMenu.user.id))
                setUserListContextMenu(null)
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                'hover:bg-muted text-foreground'
              )}
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              Написать
            </button>
            <div className="h-px my-1 bg-border" />
            <button
              type="button"
              onClick={() => togglePinUser(userListContextMenu.user.id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                'hover:bg-muted text-foreground'
              )}
            >
              {pinnedUserIds.includes(String(userListContextMenu.user.id)) ? (
                <>
                  <PinOff className="h-4 w-4 shrink-0" />
                  Открепить пользователя
                </>
              ) : (
                <>
                  <Pin className="h-4 w-4 shrink-0" />
                  Закрепить пользователя
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Мобильный Sheet: список чатов */}
      <Sheet open={userListSheetOpen} onOpenChange={setUserListSheetOpen}>
        <SheetContent side="left" className="w-[280px] sm:w-[300px] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-left">Чаты</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <button
              type="button"
              onClick={() => { setDirectChatUserId(null); setUserListSheetOpen(false); }}
              className={cn(
                'w-full flex items-center gap-2 rounded-lg px-4 py-3 text-left transition-colors m-2',
                !directChatUserId ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-foreground'
              )}
            >
              <MessageCircle className="h-5 w-5 shrink-0" />
              <span className="font-medium">Общий чат</span>
            </button>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-2 pb-1">Написать пользователю</p>
            <div className="space-y-0.5 px-2 pb-4">
              {sortedOtherUsers.map((u) => {
                const isSelected = directChatUserId === String(u.id)
                const name = chatSettingsMap[u.id]?.displayName || u.username || 'Пользователь'
                const avatarUrl = chatSettingsMap[u.id]?.avatarUrl
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { setDirectChatUserId(String(u.id)); setUserListSheetOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      isSelected ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 rounded-full overflow-hidden items-center justify-center text-xs font-semibold',
                      !avatarUrl && (isSelected ? 'bg-primary/30 text-primary-foreground' : 'bg-muted text-foreground')
                    )}>
                      {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : (name || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="truncate">{name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Основная область: заголовок + сообщения + ввод */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
      <header className="flex-shrink-0 border-b border-border h-14 md:h-[77px] py-2 px-3 sm:px-4 md:px-6 flex items-center bg-card/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3 w-full min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 shrink-0 rounded-xl"
            onClick={() => setUserListSheetOpen(true)}
            aria-label="Открыть список чатов"
          >
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Button>
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <button
            type="button"
            onClick={() => !directChatUserId && (setChatInfoTab('chat'), setMediaView(null), setChatInfoOpen(true))}
            className="flex-1 min-w-0 text-left hover:opacity-90 transition-opacity rounded-lg -m-2 p-2"
          >
            <h1 className="text-xl font-bold tracking-tight text-foreground truncate">{chatTitle}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Users className="h-3.5 w-3.5 flex-shrink-0" />
              {chatSubtitle}
            </p>
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0 rounded-xl"
            onClick={() => setChatSettingsDialogOpen(true)}
            title="Настройки профиля в чате"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className={cn(
                  'h-10 w-10 rounded-full border-2 border-t-primary border-border animate-spin'
                )}
              />
              <p className="text-sm text-muted-foreground">Загрузка сообщений...</p>
            </div>
          ) : visibleMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircle
                className="h-14 w-14 mb-4 opacity-40 text-muted-foreground"
              />
              <p className="text-muted-foreground font-medium">Пока нет сообщений</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Напишите сообщение или прикрепите файл
              </p>
            </div>
          ) : (
            <>
              {messageGroupsByDate.map((group) => (
                <div
                  key={group.dateKey}
                  ref={(el) => { dateSectionRefs.current[group.dateKey] = el }}
                  className="scroll-mt-4 pt-2"
                >
                  <button
                    type="button"
                    onClick={() => openCalendarAtDate(group.date)}
                    className={cn(
                      'w-full py-2.5 text-center text-sm font-medium rounded-xl transition-colors mb-3 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
                    {getDateLabel(group.date)}
                  </button>
                  <ul className="space-y-5 pb-4">
                    {group.messages.map((msg) => {
                      const isOwn = msg.authorId === user?.id
                      const hasAttachments = msg.attachments?.length > 0
                      const hasText = (msg.text || '').trim().length > 0
                      const authorSettings = chatSettingsMap[msg.authorId]
                      const displayName = authorSettings?.displayName ?? msg.authorName ?? '?'
                      const authorAvatarUrl = authorSettings?.avatarUrl
                      const ownColor = isOwn ? (chatSettingsMap[user?.id]?.color) : null
                      return (
                        <li
                    key={msg.id}
                    className={cn(
                      'group flex gap-3 transition-all duration-300 ease-out',
                      isOwn && 'flex-row-reverse',
                      deletingMessageId === msg.id
                        ? 'opacity-0 scale-90 pointer-events-none'
                        : 'animate-in fade-in duration-200'
                    )}
                    onContextMenu={(e) => handleContextMenu(e, msg)}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'flex h-10 w-10 flex-shrink-0 rounded-full overflow-hidden items-center justify-center text-sm font-semibold shadow-md cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                            !authorAvatarUrl && (isOwn && ownColor
                              ? 'text-white'
                              : isOwn
                                ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
                                : 'bg-muted text-foreground')
                          )}
                          style={!authorAvatarUrl && isOwn && ownColor ? { background: ownColor } : undefined}
                          aria-label={`Профиль: ${displayName}`}
                        >
                          {authorAvatarUrl ? (
                            <img src={authorAvatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (displayName || '?').slice(0, 2).toUpperCase()
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isOwn ? 'end' : 'start'} side="top" className="p-0 w-64 overflow-hidden">
                        {(() => {
                          const profileUser = getUserById(msg.authorId)
                          const name = displayName || (profileUser?.username ?? msg.authorName ?? 'Пользователь')
                          const role = profileUser?.role
                          const email = profileUser?.email
                          const createdAt = profileUser?.createdAt
                          const blocked = profileUser?.blocked
                          return (
                            <div className="p-4 bg-card">
                              <div className="flex items-center gap-3 mb-3">
                                <div
                                  className={cn(
                                    'flex h-12 w-12 flex-shrink-0 rounded-full overflow-hidden items-center justify-center text-base font-semibold',
                                    !authorAvatarUrl && 'bg-muted text-foreground'
                                  )}
                                >
                                  {authorAvatarUrl ? (
                                    <img src={authorAvatarUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    (name || '?').slice(0, 2).toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-foreground truncate">{name}</p>
                                  {role != null && (
                                    <p className="text-xs text-muted-foreground">{getRoleText(role)}</p>
                                  )}
                                  {blocked && (
                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-destructive/20 text-destructive">
                                      Заблокирован
                                    </span>
                                  )}
                                </div>
                              </div>
                              {email && (
                                <p className="text-sm text-muted-foreground truncate mb-1" title={email}>
                                  {email}
                                </p>
                              )}
                              {authorSettings?.bio && authorSettings?.showBio !== false && (
                                <p className="text-sm text-muted-foreground mt-1 mb-1 line-clamp-2" title={authorSettings.bio}>
                                  О себе: {authorSettings.bio}
                                </p>
                              )}
                              {createdAt && !isNaN(new Date(createdAt).getTime()) && (
                                <p className="text-xs text-muted-foreground">
                                  В системе с {formatDate(new Date(createdAt), 'd.MM.yyyy', { locale: ru })}
                                </p>
                              )}
                              {!profileUser && (
                                <p className="text-xs text-muted-foreground italic mt-1">Данные только из чата</p>
                              )}
                            </div>
                          )
                        })()}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div
                      className={cn(
                        'flex flex-col min-w-0 max-w-[80%] sm:max-w-[65%] md:max-w-[50%]',
                        isOwn && 'items-end'
                      )}
                    >
                      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          {displayName}
                          {getUserById(msg.authorId)?.role === 'admin' && (
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" aria-label="Администратор" title="Администратор" />
                          )}
                        </span>
                        <span className="text-[11px] text-muted-foreground/70">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: ru })}
                        </span>
                        <span className="flex-1" />
                        <span className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                            title="Ответить"
                            onClick={() => { setReplyTo({ id: msg.id, authorName: displayName, text: msg.text || '' }); setIsQuoteReply(false); }}
                          >
                            <Reply className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                            title="Ответить цитатой"
                            onClick={() => { setReplyTo({ id: msg.id, authorName: displayName, text: msg.text || '' }); setIsQuoteReply(true); }}
                          >
                            <Quote className="h-3.5 w-3.5" />
                          </Button>
                        </span>
                      </div>
                      <div
                        className={cn(
                          'rounded-2xl shadow-lg border transition-all duration-200',
                          'backdrop-blur-sm',
                          isOwn && !ownColor
                            ? 'rounded-br-md bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/20'
                            : isOwn && ownColor
                              ? 'rounded-br-md text-white border-white/20'
                              : 'rounded-bl-md bg-card/95 text-foreground border-border'
                        )}
                        style={isOwn && ownColor ? { background: ownColor } : undefined}
                      >
                        {msg.type === 'poll' && msg.poll && (
                          <div className={cn('p-4', isOwn ? 'text-white' : '')}>
                            <p className="font-medium mb-3 flex items-center gap-2">
                              <BarChart2 className="h-4 w-4 shrink-0 opacity-80" />
                              {msg.poll.question}
                            </p>
                            <div className="space-y-1.5">
                              {msg.poll.options.map((opt) => {
                                const total = msg.poll.options.reduce((s, o) => s + (o.votes || 0), 0)
                                const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0
                                const voted = (opt.voterIds || []).includes(user?.id)
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleVotePoll(msg.id, opt.id)}
                                    className={cn(
                                      'w-full text-left rounded-lg px-3 py-2 text-sm transition-colors flex items-center justify-between gap-2',
                                      isOwn
                                        ? voted ? 'bg-white/25' : 'bg-white/10 hover:bg-white/20'
                                        : voted ? 'bg-primary/20' : 'bg-muted hover:bg-muted/80'
                                    )}
                                  >
                                    <span className="truncate">{opt.text}</span>
                                    <span className="shrink-0 text-xs opacity-80">{opt.votes} ({pct}%)</span>
                                  </button>
                                )
                              })}
                            </div>
                            {msg.poll.multiple && (
                              <p className="text-xs opacity-70 mt-2">Можно выбрать несколько вариантов</p>
                            )}
                          </div>
                        )}
                        {msg.type === 'notification' && msg.notification && (
                          <div className={cn('p-4', isOwn ? 'text-white' : '')}>
                            {msg.notification.imageUrl && (
                              <div className="rounded-xl overflow-hidden mb-3">
                                <img
                                  src={msg.notification.imageUrl}
                                  alt=""
                                  className="w-full max-h-48 object-cover cursor-pointer"
                                  onClick={() => openImageModal(msg.notification.imageUrl, '')}
                                />
                              </div>
                            )}
                            {msg.notification.title && (
                              <p className="font-semibold mb-1">{msg.notification.title}</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.notification.text}</p>
                          </div>
                        )}
                        {(!msg.type || (msg.type !== 'poll' && msg.type !== 'notification')) && (
                          <>
                        {(msg.replyToId || msg.replyToAuthorName) && (
                          <div
                            className={cn(
                              'mx-3 mt-2 mb-1 rounded-lg border-l-2 py-1.5 px-2 text-xs',
                              isOwn
                                ? 'border-white/50 bg-white/10 text-white/90'
                                : 'border-border bg-muted/80 text-muted-foreground'
                            )}
                          >
                            <span className="font-medium">В ответ пользователю {msg.replyToAuthorName || '?'}</span>
                            {(msg.replyToText || '').trim() && (
                              <p className="mt-0.5 truncate">{msg.replyToText.trim().slice(0, 80)}{msg.replyToText.trim().length > 80 ? '…' : ''}</p>
                            )}
                          </div>
                        )}
                        {msg.isQuoteReply && (msg.replyToText || '').trim() && (
                          <blockquote
                            className={cn(
                              'mx-3 mt-1 mb-2 rounded-lg border-l-2 py-2 px-3 text-sm italic',
                              isOwn
                                ? 'border-white/60 bg-white/15 text-white/95'
                                : 'border-border bg-muted text-foreground'
                            )}
                          >
                            {(msg.replyToText || '').trim()}
                          </blockquote>
                        )}
                        {hasAttachments && (
                          <div
                            className={cn(
                              'p-2 space-y-2',
                              hasText &&
                              (isOwn ? 'border-b border-white/20' : 'border-b border-border/50')
                            )}
                          >
                            {msg.attachments.map((att, idx) => {
                              const Icon = getFileIcon(att.type, att.name)
                              const isImage = (att.type || '').startsWith('image/') && att.dataUrl
                              return (
                                <div
                                  key={idx}
                                  className={cn(
                                    'rounded-xl overflow-hidden transition-all hover:opacity-90',
                                    !isOwn && 'bg-muted/80'
                                  )}
                                >
                                  {isImage ? (
                                    <button
                                      type="button"
                                      onClick={() => openImageModal(att.dataUrl, att.name)}
                                      className="block w-full text-left cursor-pointer"
                                    >
                                      <img
                                        src={att.dataUrl}
                                        alt={att.name}
                                        className="max-w-full max-h-64 object-cover rounded-lg"
                                      />
                                      <p className="px-2 py-1 text-xs truncate" title={att.name}>
                                        {att.name}
                                      </p>
                                    </button>
                                  ) : (
                                    <a
                                      href={att.dataUrl}
                                      download={att.name}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={cn(
                                        'flex items-center gap-3 p-3 rounded-lg',
                                        isOwn ? 'hover:bg-white/10' : 'hover:bg-black/5'
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                          isOwn ? 'bg-white/20' : 'bg-muted'
                                        )}
                                      >
                                        <Icon className="h-5 w-5" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">{att.name}</p>
                                        {att.size > 0 && (
                                          <p className="text-xs opacity-80">{formatFileSize(att.size)}</p>
                                        )}
                                      </div>
                                      <Download className="h-4 w-4 shrink-0 opacity-70" />
                                    </a>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {hasText && (
                          <div className="px-4 py-3">
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                              {renderTextWithLinks(msg.text, '', isOwn)}
                            </p>
                          </div>
                        )}
                        {!hasText && !hasAttachments && (
                          <div className="px-4 py-2 text-sm opacity-70">Сообщение удалено</div>
                        )}
                          </>
                        )}
                        {/* Реакции */}
                        <div
                          className={cn(
                            'flex flex-wrap items-center gap-1 px-3 pb-2 pt-2',
                            (msg.reactions || []).length > 0 && (isOwn ? 'border-t border-white/20' : 'border-t border-border/50')
                          )}
                        >
                          {(msg.reactions || []).map((r, i) => {
                            const userIds = r.userIds || []
                            const count = userIds.length
                            const isMyReaction = userIds.includes(user?.id)
                            return (
                              <button
                                key={`${r.emoji}-${i}`}
                                type="button"
                                onClick={() => handleToggleReaction(msg.id, r.emoji)}
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm transition-colors',
                                  isMyReaction
                                    ? isOwn
                                      ? 'bg-white/25 text-white'
                                      : 'bg-primary/20 text-primary'
                                    : isOwn
                                      ? 'bg-white/10 hover:bg-white/20 text-white'
                                      : 'bg-muted hover:bg-muted/80 text-foreground'
                                )}
                                title={count ? `${count} ${count === 1 ? 'реакция' : 'реакций'}` : 'Добавить реакцию'}
                              >
                                <span>{r.emoji}</span>
                                {count > 0 && <span className="text-xs">{count}</span>}
                              </button>
                            )
                          })}
                          <DropdownMenu open={reactionPickerOpenId === msg.id} onOpenChange={(open) => setReactionPickerOpenId(open ? msg.id : null)}>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className={cn(
                                  'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                                  isOwn ? 'text-white/70 hover:bg-white/20 hover:text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                                aria-label="Добавить реакцию"
                              >
                                <Smile className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" side="top" className="p-1.5">
                              <div className="flex flex-wrap gap-0.5 max-w-[160px]">
                                {REACTION_EMOJIS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    className="h-8 w-8 flex items-center justify-center rounded-lg text-lg hover:bg-muted transition-colors"
                                    onClick={() => {
                                      handleToggleReaction(msg.id, emoji)
                                      setReactionPickerOpenId(null)
                                    }}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Pending files */}
      {pendingFiles.length > 0 && (
        <div
          className={cn(
            'flex-shrink-0 border-t px-4 py-2 md:px-6',
            'border-border bg-muted/30'
          )}
        >
          <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
            {pendingFiles.map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border transition-all duration-200',
                  'bg-card border-border shadow-sm',
                  p.loading && 'animate-pulse'
                )}
              >
                {p.loading ? (
                  <div
                    className={cn(
                      'h-8 w-8 rounded flex items-center justify-center flex-shrink-0',
                      'bg-muted'
                    )}
                  >
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full border-2 border-t-primary animate-spin',
                        'border-border'
                      )}
                    />
                  </div>
                ) : getFileIcon(p.type, p.name) === ImageIcon && p.dataUrl ? (
                  <img
                    src={p.dataUrl}
                    alt=""
                    className="h-8 w-8 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className="max-w-[140px] truncate" title={p.name}>
                  {p.name}
                </span>
                {!p.loading && (
                  <button
                    type="button"
                    onClick={() => removePendingFile(i)}
                    className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex-shrink-0"
                    aria-label="Удалить файл"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {filesLoading && (
            <p className="max-w-4xl mx-auto text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-t-primary animate-spin" />
              Загрузка файлов...
            </p>
          )}
        </div>
      )}

      {/* Input */}
      <div
        className={cn(
          'flex-shrink-0 border-t px-3 py-3 sm:px-4 sm:py-4 md:px-6',
          'border-border bg-card/90 backdrop-blur-xl'
        )}
      >
        {replyTo && (
          <div
            className={cn(
              'max-w-4xl mx-auto mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
              'bg-primary/20 text-primary-foreground'
            )}
          >
            <Reply className="h-4 w-4 shrink-0 opacity-80" />
            <span className="truncate flex-1 min-w-0">
              Ответ {isQuoteReply ? 'цитатой' : ''} на сообщение от <strong>{replyTo.authorName}</strong>: «{(replyTo.text || '').trim().slice(0, 60)}{(replyTo.text || '').trim().length > 60 ? '…' : ''}»
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full text-inherit hover:bg-white/20"
              onClick={() => { setReplyTo(null); setIsQuoteReply(false); }}
              aria-label="Отменить ответ"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="max-w-4xl mx-auto flex gap-2 items-end min-w-0">
          <DropdownMenu open={createMenuOpen} onOpenChange={setCreateMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-2xl flex-shrink-0 flex items-center justify-center p-0"
                disabled={sending}
                title="Опрос или уведомление"
              >
                <Plus className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className="sr-only">Опрос или уведомление</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="min-w-[180px]">
              <button
                type="button"
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left rounded-sm',
                  'hover:bg-muted text-foreground'
                )}
                onClick={() => { setPollDialogOpen(true); setCreateMenuOpen(false); }}
              >
                <BarChart2 className="h-4 w-4 shrink-0" />
                Создать опрос
              </button>
              <button
                type="button"
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left rounded-sm',
                  'hover:bg-muted text-foreground'
                )}
                onClick={() => { setNotificationDialogOpen(true); setCreateMenuOpen(false); }}
              >
                <Megaphone className="h-4 w-4 shrink-0" />
                Уведомление для коллег
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-2xl flex-shrink-0 flex items-center justify-center p-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || pendingFiles.length >= MAX_FILES_PER_MESSAGE}
            title="Прикрепить файл"
          >
            <Paperclip className="h-5 w-5 shrink-0" strokeWidth={2} />
            <span className="sr-only">Прикрепить файл</span>
          </Button>
          <DropdownMenu open={emojiPickerOpen} onOpenChange={onEmojiPickerOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-2xl flex-shrink-0 flex items-center justify-center p-0"
                disabled={sending}
                title="Смайлики и GIF"
              >
                <Smile className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className="sr-only">Смайлики и GIF</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              className={cn(
                'w-[320px] p-0 max-h-[320px] overflow-hidden flex flex-col',
                'bg-card border-border'
              )}
            >
              <div className="flex border-b shrink-0 border-border">
                <button
                  type="button"
                  onClick={() => setEmojiPickerTab('emoji')}
                  className={cn(
                    'flex-1 py-2 text-xs font-medium transition-colors',
                    emojiPickerTab === 'emoji' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Эмодзи
                </button>
                <button
                  type="button"
                  onClick={() => setEmojiPickerTab('animated')}
                  className={cn(
                    'flex-1 py-2 text-xs font-medium transition-colors',
                    emojiPickerTab === 'animated' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Анимированные
                </button>
                <button
                  type="button"
                  onClick={() => setEmojiPickerTab('gif')}
                  className={cn(
                    'flex-1 py-2 text-xs font-medium transition-colors',
                    emojiPickerTab === 'gif' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  GIF
                </button>
              </div>
              <div className="p-2 overflow-y-auto flex-1 min-h-0">
                {emojiPickerTab === 'emoji' && (
                  <div className="grid grid-cols-8 gap-0.5">
                    {EMOJI_LIST.map((emoji, i) => (
                      <button
                        key={i}
                        type="button"
                        className={cn(
                          'h-8 w-8 flex items-center justify-center rounded-lg text-lg transition-colors hover:scale-110',
                          'hover:bg-muted'
                        )}
                        onClick={() => insertEmoji(emoji)}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                {(emojiPickerTab === 'gif' || emojiPickerTab === 'animated') && (
                  <>
                    {!GIPHY_API_KEY ? (
                      <p className="text-xs text-muted-foreground py-4 text-center px-2">
                        Добавьте <code className="bg-muted px-1 rounded">VITE_GIPHY_API_KEY</code> в .env для загрузки GIF и анимированных смайликов. Ключ можно получить на{' '}
                        <a href="https://developers.giphy.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">developers.giphy.com</a>
                      </p>
                    ) : (
                      <>
                        {emojiPickerTab === 'gif' && (
                          <div className="mb-2">
                            <Input
                              placeholder="Поиск GIF..."
                              value={gifSearchInput}
                              onChange={(e) => {
                                setGifSearchInput(e.target.value)
                                setGifSearch(e.target.value)
                              }}
                              className="h-8 text-xs bg-muted border-border"
                            />
                          </div>
                        )}
                        {gifLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="h-6 w-6 rounded-full border-2 border-t-primary border-border animate-spin" />
                          </div>
                        ) : gifResults.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-4 text-center">Ничего не найдено</p>
                        ) : (
                          <div className="grid grid-cols-4 gap-1">
                            {gifResults.map((g) => (
                              <button
                                key={g.id}
                                type="button"
                                className="aspect-square rounded-lg overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                                onClick={() => addGifToMessage(g.url)}
                                title={g.title}
                              >
                                <img src={g.url} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex-1 min-w-0 relative flex">
            <Textarea
              ref={textareaRef}
              placeholder="Сообщение или прикрепите файл... (напишите @ для упоминания)"
              value={inputValue}
              onChange={(e) => {
                const value = e.target.value
                const pos = e.target.selectionStart ?? value.length
                setInputValue(value)
                const before = value.slice(0, pos)
                const lastAt = before.lastIndexOf('@')
                if (lastAt !== -1) {
                  const afterAt = before.slice(lastAt + 1)
                  if (!/[\s\n]/.test(afterAt)) {
                    setMentionStartPos(lastAt)
                    setMentionQuery(afterAt)
                    setMentionOpen(true)
                    setMentionSelectedIndex(0)
                    return
                  }
                }
                setMentionOpen(false)
              }}
              onKeyDown={handleKeyDown}
              disabled={sending}
              rows={1}
              className={cn(
                'h-11 min-h-11 max-h-32 resize-none py-2.5 px-4 rounded-2xl text-base flex-1 leading-tight pr-4',
                'bg-muted border-border placeholder:text-muted-foreground focus-visible:ring-primary/50'
              )}
            />
            {mentionOpen && mentionFilteredUsers.length > 0 && (
              <div
                ref={mentionListRef}
                className={cn(
                  'absolute left-0 right-0 bottom-full mb-1 rounded-xl border shadow-lg overflow-hidden z-50 max-h-48 overflow-y-auto',
                  'bg-card border-border'
                )}
              >
                <p className="px-3 py-2 text-xs text-muted-foreground border-b border-border">Выберите пользователя</p>
                {mentionFilteredUsers.map((u, i) => (
                  <button
                    key={u.id}
                    data-mention-index={i}
                    type="button"
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors',
                      i === mentionSelectedIndex
                        ? 'bg-primary/30 text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => u?.username && insertMention(u.username)}
                  >
                    <span className={cn(
                      'flex h-7 w-7 flex-shrink-0 rounded-full items-center justify-center text-xs font-medium',
                      'bg-muted'
                    )}>
                      {(chatSettingsMap[u.id]?.displayName || u.username || '?').slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate font-medium">{chatSettingsMap[u.id]?.displayName || u.username || '—'}</span>
                    {getUserById(u.id)?.role === 'admin' && (
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="icon"
            className="h-11 w-11 rounded-2xl flex-shrink-0 flex items-center justify-center p-0 shadow-md"
          >
            <Send className="h-5 w-5 shrink-0" strokeWidth={2} />
            <span className="sr-only">Отправить</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2 max-w-4xl mx-auto px-2 sm:px-0 break-words">
          Enter — отправить · Shift+Enter — новая строка · До {MAX_FILES_PER_MESSAGE} файлов без ограничения по размеру
        </p>
      </div>

      </div>

      {/* Меню информации о чате — по клику на название */}
      <Sheet open={chatInfoOpen} onOpenChange={setChatInfoOpen}>
        <SheetContent
          side="right"
          className={cn(
            'w-full sm:max-w-md p-0 flex flex-col overflow-hidden [&>button]:hidden',
            'bg-background border-border'
          )}
        >
          {/* Верхняя часть — как в профиле */}
          <div
            className={cn(
              'flex-shrink-0 pt-6 pb-8 px-4',
              'bg-primary/20'
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground"
                onClick={() => setChatInfoOpen(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground"
                onClick={() => setChatInfoOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  'flex h-20 w-20 items-center justify-center rounded-full mb-3 border-2',
                  'bg-primary/30 border-primary/50 text-primary'
                )}
              >
                <MessageCircle className="h-10 w-10" />
              </div>
              <SheetTitle className="text-xl font-bold text-foreground">Kosta Daily</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Групповой чат для всех пользователей системы
              </p>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                variant={chatInfoTab === 'chat' ? 'default' : 'secondary'}
                className="flex-1 gap-2 rounded-xl"
                onClick={() => setChatInfoTab('chat')}
              >
                <MessageCircle className="h-4 w-4" />
                Чат
              </Button>
              <Button
                variant={chatInfoTab === 'notifications' ? 'default' : 'secondary'}
                className="flex-1 gap-2 rounded-xl"
                onClick={() => setChatInfoTab('notifications')}
              >
                <Bell className="h-4 w-4" />
                Уведомления
              </Button>
              <Button
                variant={chatInfoTab === 'participants' ? 'default' : 'secondary'}
                className="flex-1 gap-2 rounded-xl"
                onClick={() => setChatInfoTab('participants')}
              >
                <Users className="h-4 w-4" />
                Участники
              </Button>
              <Button
                variant={chatInfoTab === 'more' ? 'default' : 'secondary'}
                size="icon"
                className="rounded-xl flex-shrink-0"
                onClick={() => setChatInfoTab('more')}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Контент в зависимости от вкладки */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {chatInfoTab === 'chat' && (
              <>
                {mediaView ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 -ml-2 mb-2"
                      onClick={() => { setMediaView(null); setMediaFileCategory(null); }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Назад
                    </Button>
                    {mediaView === 'favorites' && (
                      <div className={cn('rounded-lg p-4 text-center', 'bg-muted/50')}>
                        <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-foreground">В избранном пусто</p>
                        <p className="text-xs text-muted-foreground mt-1">Сохраняйте сообщения в избранное из контекстного меню</p>
                      </div>
                    )}
                    {mediaView === 'photos' && (() => {
                      const photos = messages.flatMap((m) =>
                        (m.attachments || []).filter((a) => (a.type || '').startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(a.name || '')).map((a) => ({ ...a, authorName: m.authorName }))
                      )
                      return photos.length === 0 ? (
                        <div className={cn('rounded-lg p-4 text-center', 'bg-muted/50')}>
                          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Нет фотографий</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {photos.map((att, i) => (
                            <button
                              key={i}
                              type="button"
                              className="aspect-square rounded-lg overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                              onClick={() => { setChatInfoOpen(false); openImageModal(att.dataUrl, att.name); }}
                            >
                              <img src={att.dataUrl} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )
                    })()}
                    {mediaView === 'videos' && (
                      <div className={cn('rounded-lg p-4 text-center', 'bg-muted/50')}>
                        <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Нет видео</p>
                      </div>
                    )}
                    {mediaView === 'files' && (() => {
                      const allFiles = messages.flatMap((m) =>
                        (m.attachments || [])
                          .filter((a) => !(a.type || '').startsWith('image/'))
                          .map((a) => ({ ...a, authorName: m.authorName, category: getFileCategory(a) }))
                      )
                      const files = mediaFileCategory
                        ? allFiles.filter((a) => a.category === mediaFileCategory)
                        : allFiles
                      const categoryLabel = mediaFileCategory ? FILE_CATEGORY_LABELS[mediaFileCategory] : 'Файлы'
                      return files.length === 0 ? (
                        <div className={cn('rounded-lg p-4 text-center', 'bg-muted/50')}>
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Нет файлов{mediaFileCategory ? ` (${categoryLabel})` : ''}</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {files.map((att, i) => (
                            <a
                              key={i}
                              href={att.dataUrl}
                              download={att.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                                'bg-muted/50 hover:bg-muted'
                              )}
                            >
                              {(() => {
                                const Icon = getFileIcon(att.type, att.name)
                                return <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                              })()}
                              <span className="text-sm truncate flex-1 min-w-0">{att.name}</span>
                              <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </a>
                          ))}
                        </div>
                      )
                    })()}
                    {mediaView === 'audio' && (
                      <div className={cn('rounded-lg p-4 text-center', 'bg-muted/50')}>
                        <Music className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Нет аудиофайлов</p>
                      </div>
                    )}
                    {mediaView === 'links' && (() => {
                      const allUrls = messages.flatMap((m) => extractUrlsFromText(m.text))
                      const uniqueUrls = [...new Set(allUrls)]
                      return uniqueUrls.length === 0 ? (
                        <div className={cn('rounded-lg p-4 text-center', 'bg-muted/50')}>
                          <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Нет ссылок</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {uniqueUrls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg transition-colors text-left break-all text-primary underline',
                                'bg-muted/50 hover:bg-muted'
                              )}
                            >
                              <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="min-w-0">{url}</span>
                            </a>
                          ))}
                        </div>
                      )
                    })()}
                  </>
                ) : (
                  <>
                    <div className={cn('rounded-lg p-4', 'bg-muted/50')}>
                      <p className="text-sm font-medium text-foreground">О чате</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Общий чат для обмена сообщениями и файлами между всеми пользователями системы.
                      </p>
                    </div>
                    <div className={cn('rounded-lg p-4', 'bg-muted/50')}>
                      <p className="text-sm font-medium text-foreground mb-2">Медиа и файлы</p>
                      <div className="space-y-0 text-sm">
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                          onClick={() => setMediaView('favorites')}
                        >
                          <Bookmark className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>0 сообщений в Избранном</span>
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                          onClick={() => setMediaView('photos')}
                        >
                          <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>{messages.reduce((acc, m) => acc + (m.attachments || []).filter((a) => (a.type || '').startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(a.name || '')).length, 0)} фотографий</span>
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                          onClick={() => setMediaView('videos')}
                        >
                          <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>0 видео</span>
                        </button>
                        {(() => {
                          const fileCountByCategory = { pdf: 0, docx: 0, xlsx: 0, txt: 0, other: 0 }
                          messages.forEach((m) => {
                            (m.attachments || [])
                              .filter((a) => !(a.type || '').startsWith('image/'))
                              .forEach((a) => {
                                const cat = getFileCategory(a)
                                if (fileCountByCategory[cat] !== undefined) fileCountByCategory[cat]++
                                else fileCountByCategory.other++
                              })
                          })
                          const fileCategories = ['pdf', 'docx', 'xlsx', 'txt', 'other']
                          return fileCategories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              className="flex w-full items-center gap-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                              onClick={() => { setMediaView('files'); setMediaFileCategory(cat); }}
                            >
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span>{fileCountByCategory[cat] || 0} — {FILE_CATEGORY_LABELS[cat]}</span>
                            </button>
                          ))
                        })()}
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                          onClick={() => setMediaView('audio')}
                        >
                          <Music className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>0 аудиофайлов</span>
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                          onClick={() => setMediaView('links')}
                        >
                          <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>{messages.reduce((acc, m) => acc + extractUrlsFromText(m.text).length, 0)} ссылок</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {chatInfoTab === 'notifications' && (
              <div className={cn('rounded-lg p-4', 'bg-muted/50')}>
                <p className="text-sm font-medium text-foreground mb-3">Уведомления</p>
                <label className="flex items-center justify-between gap-3 py-2 cursor-pointer">
                  <span className="text-sm">Звук уведомлений</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!notificationsMuted}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors',
                      notificationsMuted ? 'bg-muted border-input' : 'bg-primary border-primary'
                    )}
                    onClick={() => {
                      setNotificationsMuted((v) => {
                        const next = !v
                        try {
                          localStorage.setItem('kosta_daily_notifications_muted', next ? '1' : '0')
                        } catch {}
                        return next
                      })
                    }}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow transition-transform translate-y-0.5',
                        notificationsMuted ? 'translate-x-0.5' : 'translate-x-5'
                      )}
                    />
                  </button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  {notificationsMuted ? 'Звук отключён' : 'Звук включён для новых сообщений'}
                </p>
              </div>
            )}

            {chatInfoTab === 'participants' && (
              <div className={cn('rounded-lg p-4', 'bg-muted/50')}>
                <p className="text-sm font-medium text-foreground mb-3">Участники</p>
                <div className="space-y-0">
                  {(getAllUsers?.() || []).map((u) => {
                    const displayNameU = chatSettingsMap[u.id]?.displayName || u.username
                    const avatarUrlU = chatSettingsMap[u.id]?.avatarUrl
                    return (
                      <button
                        key={u.id}
                        type="button"
                        className="flex w-full items-center gap-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0"
                        onClick={() => setChatInfoOpen(false)}
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 rounded-full overflow-hidden items-center justify-center text-xs font-medium',
                            !avatarUrlU && 'bg-muted text-muted-foreground'
                          )}
                        >
                          {avatarUrlU ? (
                            <img src={avatarUrlU} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (displayNameU || '?').slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{displayNameU || '—'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {chatInfoTab === 'more' && (
              <div className={cn('rounded-lg p-4', 'bg-muted/50')}>
                <p className="text-sm font-medium text-foreground mb-3">Ещё</p>
                <div className="space-y-0">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left text-sm"
                    onClick={() => {
                      setChatInfoOpen(false)
                      setChatSettingsDialogOpen(true)
                    }}
                  >
                    <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
                    Настройки профиля в чате
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left text-sm"
                    onClick={() => setChatInfoOpen(false)}
                  >
                    <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    Вернуться в чат
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left text-sm text-muted-foreground"
                    onClick={() => setChatInfoOpen(false)}
                  >
                    Экспорт чата (скоро)
                  </button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Настройки профиля в чате — современное меню в стиле мессенджера */}
      <Dialog open={chatSettingsDialogOpen} onOpenChange={setChatSettingsDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh] [&>button]:hidden bg-background">
          {/* Верхняя панель: назад + сохранить */}
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b border-border bg-muted/30">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-xl text-foreground"
              onClick={() => setChatSettingsDialogOpen(false)}
              aria-label="Назад"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium text-foreground">Профиль в чате</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl gap-1.5 text-primary font-medium"
              onClick={saveChatProfileSettings}
            >
              <Pencil className="h-4 w-4" />
              Сохранить
            </Button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-4">
            {/* Блок с аватаром и именем */}
            <div
              className={cn(
                'relative pt-8 pb-6 px-4 text-center bg-muted/40'
              )}
            >
              <input
                ref={chatSettingsFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => setProfileAvatarUrl(reader.result || '')
                  reader.readAsDataURL(file)
                  e.target.value = ''
                }}
              />
              <button
                type="button"
                onClick={() => chatSettingsFileInputRef.current?.click()}
                className={cn(
                  'mx-auto flex h-24 w-24 rounded-full overflow-hidden items-center justify-center text-2xl font-semibold border-2 border-border/50 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                  !profileAvatarUrl && !profileColor && 'bg-muted text-muted-foreground'
                )}
                style={profileColor && !profileAvatarUrl ? { background: profileColor, color: 'white', borderColor: 'transparent' } : undefined}
              >
                {profileAvatarUrl ? (
                  <img src={profileAvatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (user?.username || '?').slice(0, 2).toUpperCase()
                )}
              </button>
              <p className="mt-3 text-lg font-semibold text-foreground truncate max-w-[280px] mx-auto">
                {profileDisplayName || user?.username || 'Имя не указано'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Как вас видят в чате
              </p>
            </div>

            {/* Блоки информации */}
            <div className="px-4 py-4 pb-6 space-y-1">
              <div className={cn(
                'rounded-xl px-4 py-3.5',
                'bg-muted/30'
              )}>
                <p className="text-xs text-muted-foreground mb-1.5">Имя пользователя</p>
                <Input
                  value={profileDisplayName}
                  onChange={(e) => setProfileDisplayName(e.target.value)}
                  placeholder={user?.username ? `@${user.username}` : 'Как вас видят в чате'}
                  className="h-9 border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div className={cn(
                'rounded-xl px-4 py-3.5',
                'bg-muted/30'
              )}>
                <p className="text-xs text-muted-foreground mb-2">Цвет сообщений — плоские</p>
                <div className="flex flex-wrap gap-2">
                  {CHAT_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      title={preset.name}
                      onClick={() => setProfileColor(preset.value)}
                      className={cn(
                        'h-9 w-9 rounded-full border-2 transition-all hover:scale-110 flex-shrink-0',
                        profileColor === preset.value ? 'border-foreground ring-2 ring-offset-2 ring-offset-background ring-foreground/30 scale-110' : 'border-transparent'
                      )}
                      style={isGradient(preset.value) ? { background: preset.value } : { backgroundColor: preset.value }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 mb-2">Градиенты</p>
                <div className="flex flex-wrap gap-2">
                  {CHAT_GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      title={preset.name}
                      onClick={() => setProfileColor(preset.value)}
                      className={cn(
                        'h-9 w-9 rounded-full border-2 transition-all hover:scale-110 flex-shrink-0',
                        profileColor === preset.value ? 'border-foreground ring-2 ring-offset-2 ring-offset-background ring-foreground/30 scale-110' : 'border-transparent'
                      )}
                      style={{ background: preset.value }}
                    />
                  ))}
                </div>
              </div>

              <div className={cn(
                'rounded-xl px-4 py-3.5',
                'bg-muted/30'
              )}>
                <p className="text-xs text-muted-foreground mb-1.5">О себе</p>
                <Input
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Кратко о себе (видно в карточке профиля)"
                  className="h-9 border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                />
              </div>

              <div className={cn(
                'rounded-xl px-4 py-3.5',
                'bg-muted/30'
              )}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Показывать «О себе» в профиле</p>
                    <p className="text-xs text-foreground">Видно при клике на ваш аватар в чате</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={profileShowBio}
                    onClick={() => setProfileShowBio((v) => !v)}
                    className={cn(
                      'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors',
                      profileShowBio ? 'bg-primary' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform',
                        profileShowBio && 'translate-x-5'
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className={cn(
                'rounded-xl px-4 py-3.5',
                'bg-muted/30'
              )}>
                <p className="text-xs text-muted-foreground mb-1.5">Аватар</p>
                <p className="text-sm text-foreground">Нажмите на фото выше, чтобы изменить</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модальное окно просмотра фото — на весь экран, без нижней плашки */}
      <Dialog open={imageModal.open} onOpenChange={(open) => !open && closeImageModal()}>
        <DialogContent
          fullScreen
          className="bg-black/35 backdrop-blur-sm border-0 [&>button]:hidden"
          onPointerDownOutside={closeImageModal}
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <img
              src={imageModal.src}
              alt={imageModal.name}
              className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-200 opacity-90 origin-center select-none"
              style={{
                transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
              }}
              draggable={false}
            />
          </div>
          {/* Кнопки поверх фото в углу */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 px-2 py-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-white hover:bg-white/20"
              onClick={handleImageDownload}
              title="Скачать"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-white hover:bg-white/20"
              onClick={() => setImageRotation((r) => (r + 90) % 360)}
              title="Повернуть"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-white hover:bg-white/20"
              onClick={() => setImageZoom((z) => Math.min(z + 0.25, 3))}
              title="Увеличить"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-white hover:bg-white/20"
              onClick={() => setImageZoom((z) => Math.max(z - 0.25, 0.5))}
              title="Уменьшить"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-white/20" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-white hover:bg-red-500/80"
              onClick={closeImageModal}
              title="Закрыть"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог: Создать опрос */}
      <Dialog open={pollDialogOpen} onOpenChange={setPollDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Создать опрос</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Вопрос</label>
              <Input
                placeholder="Введите вопрос"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Варианты ответа</label>
              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Вариант ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const next = [...pollOptions]
                        next[i] = e.target.value
                        setPollOptions(next)
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      disabled={pollOptions.length <= 2}
                      onClick={() => setPollOptions((p) => p.filter((_, j) => j !== i))}
                      aria-label="Удалить вариант"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setPollOptions((p) => [...p, ''])}
                >
                  + Добавить вариант
                </Button>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pollMultiple}
                onChange={(e) => setPollMultiple(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm">Несколько вариантов ответа</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPollDialogOpen(false)}>Отмена</Button>
              <Button
                onClick={handleCreatePoll}
                disabled={!pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2}
              >
                Создать опрос
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог: Уведомление для коллег */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Уведомление для коллег</DialogTitle>
          </DialogHeader>
          <input
            ref={notifImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const r = new FileReader()
              r.onload = () => setNotifImageUrl(r.result)
              r.readAsDataURL(file)
              e.target.value = ''
            }}
          />
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Заголовок (необязательно)</label>
              <Input
                placeholder="Заголовок уведомления"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Текст / подпись</label>
              <Textarea
                placeholder="Текст уведомления для коллег"
                value={notifText}
                onChange={(e) => setNotifText(e.target.value)}
                rows={4}
                className="w-full resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Фото (необязательно)</label>
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => notifImageInputRef.current?.click()}
                >
                  {notifImageUrl ? 'Заменить фото' : 'Добавить фото'}
                </Button>
                {notifImageUrl && (
                  <div className="relative inline-block">
                    <img src={notifImageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => setNotifImageUrl('')}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
                      aria-label="Удалить фото"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setNotificationDialogOpen(false)}>Отмена</Button>
              <Button onClick={handleCreateNotification} disabled={!notifText.trim()}>
                Отправить уведомление
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Контекстное меню сообщения */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-[99]"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
          />
          <div
            className={cn(
              'fixed z-[100] rounded-lg shadow-lg py-1 min-w-[200px]',
              'bg-card border border-border'
            )}
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              onClick={() => {
                setReplyTo({
                  id: contextMenu.msg.id,
                  authorName: chatSettingsMap[contextMenu.msg.authorId]?.displayName ?? contextMenu.msg.authorName,
                  text: contextMenu.msg.text || '',
                })
                setIsQuoteReply(false)
                setContextMenu(null)
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                'hover:bg-muted text-foreground'
              )}
            >
              <Reply className="h-4 w-4 shrink-0" />
              Ответить
            </button>
            <button
              type="button"
              onClick={() => {
                setReplyTo({
                  id: contextMenu.msg.id,
                  authorName: chatSettingsMap[contextMenu.msg.authorId]?.displayName ?? contextMenu.msg.authorName,
                  text: contextMenu.msg.text || '',
                })
                setIsQuoteReply(true)
                setContextMenu(null)
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                'hover:bg-muted text-foreground'
              )}
            >
              <Quote className="h-4 w-4 shrink-0" />
              Ответить цитатой
            </button>
            {contextMenu.msg.authorId === user?.id && (
              <>
                <div className="h-px my-1 bg-border" />
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(contextMenu.msg)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left text-destructive hover:bg-muted"
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                  Удалить
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Календарь — переход к дате */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent
          className={cn(
            'sm:max-w-[320px] p-0 gap-0 overflow-hidden',
            'bg-card border-border'
          )}
        >
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">
                {formatDate(calendarMonth, 'LLLL yyyy', { locale: ru }).replace(/^\w/, (c) => c.toUpperCase())} г.
              </span>
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCalendarMonth((m) => subMonths(m, 1))}
                  aria-label="Предыдущий месяц"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
                  aria-label="Следующий месяц"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-7 gap-0.5 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-[11px] font-medium text-muted-foreground py-1"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day) => {
                const inMonth = isSameMonth(day, calendarMonth)
                const dayKey = formatDate(day, 'yyyy-MM-dd')
                const hasMessages = messageGroupsByDate.some((g) => g.dateKey === dayKey)
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => hasMessages && goToDateAndCloseCalendar(day)}
                    disabled={!hasMessages}
                    className={cn(
                      'h-8 w-8 rounded-full text-sm transition-colors flex items-center justify-center',
                      !inMonth && 'text-muted-foreground',
                      inMonth && 'text-foreground hover:bg-muted',
                      hasMessages && inMonth && 'font-medium',
                      hasMessages && inMonth && 'text-primary hover:bg-primary/15'
                    )}
                  >
                    {formatDate(day, 'd')}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex gap-2 p-3 border-t border-border">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setCalendarOpen(false)}>
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
