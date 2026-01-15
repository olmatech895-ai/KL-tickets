import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api, API_BASE_URL } from '../config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { ToastContainer } from '../components/ui/toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Image as ImageIcon, Package, Eye, Download, CheckCircle, AlertCircle, XCircle, Clock, User, Plus, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

export const Inventory = () => {
  const { isAdmin, isIT, getAllUsers } = useAuth()
  const allUsers = getAllUsers()
  const [inventory, setInventory] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    serialNumber: '',
    location: '',
    status: 'working',
    description: '',
    photo: null, // File object
    photoPreview: null, // Preview URL
    responsible: 'none',
  })

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setLoading(true)
      const items = await api.getInventoryItems()
      setInventory(items)
    } catch (error) {
      console.error('Failed to load inventory:', error)
      showToast('Ошибка', 'Не удалось загрузить инвентарь', 'destructive')
    } finally {
      setLoading(false)
    }
  }

  const handleViewItem = (item) => {
    setSelectedItem(item)
    setViewDialogOpen(true)
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      type: item.type || '',
      serialNumber: item.serial_number || '',
      location: item.location || '',
      status: item.status || 'working',
      description: item.description || '',
      photo: null,
      photoPreview: item.photo ? (item.photo.startsWith('/uploads/') ? `${API_BASE_URL.replace('/api/v1', '')}${item.photo}` : item.photo) : null,
      responsible: item.responsible || 'none',
    })
    setEditDialogOpen(true)
  }

  const handleUpdateItem = async (e) => {
    e.preventDefault()
    if (!editingItem) return
    
    try {
      setLoading(true)
      
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('type', formData.type)
      if (formData.serialNumber) {
        formDataToSend.append('serial_number', formData.serialNumber)
      } else {
        formDataToSend.append('serial_number', '')
      }
      if (formData.location) {
        formDataToSend.append('location', formData.location)
      } else {
        formDataToSend.append('location', '')
      }
      formDataToSend.append('status', formData.status)
      if (formData.description) {
        formDataToSend.append('description', formData.description)
      } else {
        formDataToSend.append('description', '')
      }
      const responsibleValue = formData.responsible === "none" || formData.responsible === "" ? null : formData.responsible
      if (responsibleValue) {
        formDataToSend.append('responsible', responsibleValue)
      } else {
        formDataToSend.append('responsible', 'none')
      }
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo)
      }
      
      const updatedItem = await api.updateInventoryItem(editingItem.id, formDataToSend)
      
      // Update local state
      setInventory(inventory.map(item => item.id === updatedItem.id ? updatedItem : item))
      setEditDialogOpen(false)
      setEditingItem(null)
      setFormData({
        name: '',
        type: '',
        serialNumber: '',
        location: '',
        status: 'working',
        description: '',
        photo: null,
        photoPreview: null,
        responsible: 'none',
      })
      showToast('Успешно', 'Техника обновлена', 'default')
    } catch (error) {
      console.error('Failed to update inventory item:', error)
      showToast('Ошибка', 'Не удалось обновить технику', 'destructive')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateResponsible = async (itemId, userId) => {
    try {
      // Convert "none" to null for API
      const responsibleValue = userId === "none" || userId === "" ? null : userId
      await api.updateInventoryItem(itemId, {
        responsible: responsibleValue,
      })
      
      // Обновляем локальное состояние
      const updatedInventory = inventory.map((item) =>
        item.id === itemId
          ? { ...item, responsible: responsibleValue }
          : item
      )
      setInventory(updatedInventory)
      
      // Обновляем selectedItem если он открыт
      if (selectedItem && selectedItem.id === itemId) {
        const updatedItem = updatedInventory.find((item) => item.id === itemId)
        if (updatedItem) {
          setSelectedItem({ ...updatedItem })
        }
      }
      
      showToast('Успешно', 'Ответственный обновлен', 'default')
    } catch (error) {
      console.error('Failed to update responsible:', error)
      showToast('Ошибка', 'Не удалось обновить ответственного', 'destructive')
    }
  }

  const handleCreateItem = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('type', formData.type)
      if (formData.serialNumber) {
        formDataToSend.append('serial_number', formData.serialNumber)
      }
      if (formData.location) {
        formDataToSend.append('location', formData.location)
      }
      formDataToSend.append('status', formData.status)
      if (formData.description) {
        formDataToSend.append('description', formData.description)
      }
      const responsibleValue = formData.responsible === "none" || formData.responsible === "" ? null : formData.responsible
      if (responsibleValue) {
        formDataToSend.append('responsible', responsibleValue)
      } else {
        formDataToSend.append('responsible', 'none')
      }
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo)
      }
      
      const newItem = await api.createInventoryItem(formDataToSend)
      
      setInventory([newItem, ...inventory])
      setCreateDialogOpen(false)
      setFormData({
        name: '',
        type: '',
        serialNumber: '',
        location: '',
        status: 'working',
        description: '',
        photo: null,
        photoPreview: null,
        responsible: 'none',
      })
      showToast('Успешно', 'Техника добавлена в инвентарь', 'default')
    } catch (error) {
      console.error('Failed to create inventory item:', error)
      showToast('Ошибка', 'Не удалось добавить технику', 'destructive')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        showToast('Ошибка', 'Разрешены только изображения (JPG, PNG, GIF, WEBP)', 'destructive')
        return
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast('Ошибка', 'Размер файла не должен превышать 10MB', 'destructive')
        return
      }
      
      setFormData({
        ...formData,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      })
    }
  }

  const getUserName = (userId) => {
    if (!userId) return null
    const user = allUsers.find((u) => u.id === userId)
    return user ? user.username : null
  }

  const getUserInitials = (username) => {
    if (!username) return ''
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserColor = (userId) => {
    if (!userId) return 'bg-gray-400'
    const colors = [
      'bg-primary',
      'bg-secondary',
      'bg-accent',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
    ]
    const index = allUsers.findIndex((u) => u.id === userId) % colors.length
    return colors[index] || colors[0]
  }

  const showToast = (title, description, variant = 'default') => {
    const id = Date.now().toString()
    setToasts([...toasts, { id, title, description, variant }])
    setTimeout(() => {
      setToasts(toasts.filter((t) => t.id !== id))
    }, 3000)
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'working':
        return {
          text: 'Рабочая',
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          className: 'text-green-600 bg-green-50',
        }
      case 'repair':
        return {
          text: 'В ремонте',
          icon: <Clock className="h-4 w-4 text-yellow-500" />,
          className: 'text-yellow-600 bg-yellow-50',
        }
      case 'broken':
        return {
          text: 'Неисправна',
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          className: 'text-red-600 bg-red-50',
        }
      case 'written_off':
        return {
          text: 'Списана',
          icon: <XCircle className="h-4 w-4 text-gray-500" />,
          className: 'text-gray-600 bg-gray-50',
        }
      default:
        return {
          text: 'Не указано',
          icon: <AlertCircle className="h-4 w-4 text-gray-400" />,
          className: 'text-gray-600 bg-gray-50',
        }
    }
  }

  const handleDownloadReport = () => {
    if (inventory.length === 0) {
      showToast('Ошибка', 'Нет данных для экспорта', 'destructive')
      return
    }

    // Создаем CSV файл
    const headers = ['Название', 'Тип', 'Серийный номер', 'Местоположение', 'Состояние', 'Ответственный', 'Дата добавления', 'Описание']
    const rows = inventory.map((item) => {
      const statusInfo = getStatusInfo(item.status || 'working')
      const responsibleName = getUserName(item.responsible) || '—'
      return [
        item.name || '',
        item.type || '',
        item.serial_number || '',
        item.location || '',
        statusInfo.text,
        responsibleName,
        item.createdAt ? (() => {
          try {
            const date = new Date(item.createdAt)
            return isNaN(date.getTime()) ? '' : format(date, 'dd.MM.yyyy')
          } catch {
            return ''
          }
        })() : '',
        item.description || '',
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    // Добавляем BOM для правильного отображения кириллицы в Excel
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `Инвентаризация_${format(new Date(), 'dd-MM-yyyy')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast('Успешно', 'Отчет успешно скачан', 'default')
  }

  if (!isAdmin && !isIT) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Доступ запрещен</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 w-full pt-16 lg:pt-4 sm:pt-6">
      <div className="flex flex-col gap-4 pl-12 lg:pl-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight">Инвентаризация техники</h1>
          <p className="text-muted-foreground mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base">
            Просмотр инвентаря техники компании
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2">
          <Button onClick={() => setCreateDialogOpen(true)} className="w-full xs:w-auto text-sm sm:text-base">
            <Plus className="h-4 w-4 mr-2" />
            Добавить технику
          </Button>
          {inventory.length > 0 && (
            <Button onClick={handleDownloadReport} variant="outline" className="w-full xs:w-auto text-sm sm:text-base">
              <Download className="h-4 w-4 mr-2" />
              Скачать отчет
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Package className="h-5 w-5" />
            Список техники ({inventory.length})
          </CardTitle>
          <CardDescription className="text-sm">
            Полный список техники в инвентаре
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {loading ? (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Техника еще не добавлена в инвентарь
              </p>
              {(isAdmin || isIT) && (
                <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить технику
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {inventory.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-all duration-200 border overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Image Section */}
                        <div className="flex-shrink-0 w-full sm:w-28 h-48 sm:h-auto sm:min-h-[120px] relative">
                          {item.photo ? (
                            <img
                              src={item.photo.startsWith('/uploads/') ? `${API_BASE_URL.replace('/api/v1', '')}${item.photo}` : item.photo}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          {/* Status Badge Overlay */}
                          <div className="absolute top-2 right-2 flex items-center gap-1.5">
                            {getStatusInfo(item.status || 'working').icon}
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${getStatusInfo(item.status || 'working').className}`}
                            >
                              {getStatusInfo(item.status || 'working').text}
                            </span>
                          </div>
                        </div>
                        
                        {/* Content Section */}
                        <div className="flex-1 p-4 flex flex-col">
                          <h3 className="font-bold text-lg mb-3 break-words leading-tight">{item.name}</h3>
                          
                          <div className="space-y-2.5 text-sm mb-4 flex-1">
                            {item.responsible && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs min-w-[100px] flex-shrink-0">Ответственный:</span>
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div
                                    className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm flex-shrink-0 ${getUserColor(item.responsible)}`}
                                    title={getUserName(item.responsible) || ''}
                                  >
                                    {getUserInitials(getUserName(item.responsible))}
                                  </div>
                                  <span className="text-sm font-medium truncate">{getUserName(item.responsible)}</span>
                                </div>
                              </div>
                            )}
                            {item.createdAt && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs min-w-[100px] flex-shrink-0">Добавлено:</span>
                                <span className="text-sm font-medium">
                                  {(() => {
                                    try {
                                      const date = new Date(item.createdAt)
                                      return isNaN(date.getTime()) ? '—' : format(date, 'dd.MM.yyyy HH:mm')
                                    } catch {
                                      return '—'
                                    }
                                  })()}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewItem(item)}
                              className="flex-1 h-9 text-xs"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              Просмотр
                            </Button>
                            {(isAdmin || isIT) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditItem(item)}
                                className="flex-1 h-9 text-xs"
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                Редактировать
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block -mx-4 md:mx-0 px-4 md:px-0">
                <div className="relative w-full">
                  <div className="overflow-x-auto overflow-y-visible xl:overflow-x-visible scrollbar-hide">
                    <div className="w-full align-middle">
                      <div className="overflow-hidden border rounded-lg shadow-sm bg-card w-full">
                        <Table className="w-full">
                          <TableHeader>
                            <TableRow className="bg-muted/50 border-b">
                              <TableHead className="w-[120px] font-semibold">Фото</TableHead>
                              <TableHead className="font-semibold">Название</TableHead>
                              <TableHead className="font-semibold">Состояние</TableHead>
                              <TableHead className="font-semibold">Ответственный</TableHead>
                              <TableHead className="font-semibold">Дата добавления</TableHead>
                              <TableHead className="text-right font-semibold">Действия</TableHead>
                            </TableRow>
                          </TableHeader>
                      <TableBody>
                        {inventory.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="py-3">
                              {item.photo ? (
                                <img
                                  src={item.photo.startsWith('/uploads/') ? `${API_BASE_URL.replace('/api/v1', '')}${item.photo}` : item.photo}
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded-lg border shadow-sm"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-muted rounded-lg border flex items-center justify-center shadow-sm">
                                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-semibold py-3">
                              <p className="break-words" title={item.name}>{item.name}</p>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                {getStatusInfo(item.status || 'working').icon}
                                <span
                                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusInfo(item.status || 'working').className}`}
                                >
                                  {getStatusInfo(item.status || 'working').text}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              {item.responsible ? (
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm ${getUserColor(item.responsible)}`}
                                    title={getUserName(item.responsible) || ''}
                                  >
                                    {getUserInitials(getUserName(item.responsible))}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate" title={getUserName(item.responsible)}>
                                      {getUserName(item.responsible)}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-3">
                              {item.createdAt ? (() => {
                                try {
                                  const date = new Date(item.createdAt)
                                  return isNaN(date.getTime()) ? (
                                    <span className="text-muted-foreground text-sm">—</span>
                                  ) : (
                                    <div className="flex flex-col">
                                      <span className="text-sm">{format(date, 'dd.MM.yyyy')}</span>
                                      <span className="text-xs text-muted-foreground">{format(date, 'HH:mm')}</span>
                                    </div>
                                  )
                                } catch {
                                  return <span className="text-muted-foreground text-sm">—</span>
                                }
                              })() : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right py-3">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewItem(item)}
                                  className="h-8"
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                                  <span className="hidden xl:inline">Просмотр</span>
                                </Button>
                                {(isAdmin || isIT) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditItem(item)}
                                    className="h-8"
                                  >
                                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="hidden xl:inline">Редактировать</span>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl scrollbar-hide">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
                <DialogDescription>
                  Подробная информация о технике
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedItem.photo && (
                  <div>
                    <img
                      src={selectedItem.photo.startsWith('/uploads/') ? `${API_BASE_URL.replace('/api/v1', '')}${selectedItem.photo}` : selectedItem.photo}
                      alt={selectedItem.name}
                      className="w-full max-h-64 object-contain rounded-lg border"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Тип техники</Label>
                    <p className="font-medium">{selectedItem.type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Серийный номер</Label>
                    <p className="font-medium">
                      {selectedItem.serial_number || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Местоположение</Label>
                    <p className="font-medium">
                      {selectedItem.location || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Состояние</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusInfo(selectedItem.status || 'working').icon}
                      <p className="font-medium">
                        {getStatusInfo(selectedItem.status || 'working').text}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Дата добавления</Label>
                    <p className="font-medium">
                      {selectedItem.createdAt ? (() => {
                        try {
                          const date = new Date(selectedItem.createdAt)
                          return isNaN(date.getTime()) ? '—' : format(date, 'dd.MM.yyyy HH:mm')
                        } catch {
                          return '—'
                        }
                      })() : '—'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Ответственный за технику</Label>
                    <div className="mt-2">
                      <Select
                        value={selectedItem.responsible || 'none'}
                        onValueChange={(value) => handleUpdateResponsible(selectedItem.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Не назначен" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Не назначен</SelectItem>
                          {allUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedItem.responsible && (
                        <div className="flex items-center gap-2 mt-2">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getUserColor(selectedItem.responsible)}`}
                          >
                            {getUserInitials(getUserName(selectedItem.responsible))}
                          </div>
                          <div>
                            <p className="font-medium">{getUserName(selectedItem.responsible)}</p>
                            {allUsers.find((u) => u.id === selectedItem.responsible)?.email && (
                              <p className="text-sm text-muted-foreground">
                                {allUsers.find((u) => u.id === selectedItem.responsible)?.email}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {selectedItem.description && (
                  <div>
                    <Label className="text-muted-foreground">Описание</Label>
                    <p className="font-medium">{selectedItem.description}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Inventory Item Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Добавить технику в инвентарь</DialogTitle>
            <DialogDescription>
              Заполните форму для добавления новой техники
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateItem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Ноутбук Dell Latitude"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Тип техники *</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Например: Ноутбук, Монитор, Принтер"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Серийный номер</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="SN123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Местоположение</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Например: Офис 101"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Состояние</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="working">Рабочая</SelectItem>
                  <SelectItem value="repair">В ремонте</SelectItem>
                  <SelectItem value="broken">Неисправна</SelectItem>
                  <SelectItem value="written_off">Списана</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible">Ответственный</Label>
              <Select
                value={formData.responsible || 'none'}
                onValueChange={(value) => setFormData({ ...formData, responsible: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Не назначен" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не назначен</SelectItem>
                  {allUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Фото</Label>
              <Input
                id="photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handlePhotoChange}
              />
              {formData.photoPreview && (
                <div className="mt-2">
                  <img
                    src={formData.photoPreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Дополнительная информация о технике"
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Добавление...' : 'Добавить'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={loading}
              >
                Отмена
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Inventory Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Редактировать технику</DialogTitle>
            <DialogDescription>
              Измените данные техники
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateItem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Название *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Ноутбук Dell Latitude"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Тип техники *</Label>
              <Input
                id="edit-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Например: Ноутбук, Монитор, Принтер"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-serialNumber">Серийный номер</Label>
                <Input
                  id="edit-serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="SN123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Местоположение</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Например: Офис 101"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Состояние</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="working">Рабочая</SelectItem>
                  <SelectItem value="repair">В ремонте</SelectItem>
                  <SelectItem value="broken">Неисправна</SelectItem>
                  <SelectItem value="written_off">Списана</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-responsible">Ответственный</Label>
              <Select
                value={formData.responsible || 'none'}
                onValueChange={(value) => setFormData({ ...formData, responsible: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Не назначен" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не назначен</SelectItem>
                  {allUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-photo">Фото</Label>
              <Input
                id="edit-photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handlePhotoChange}
              />
              {formData.photoPreview && (
                <div className="mt-2">
                  <img
                    src={formData.photoPreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Дополнительная информация о технике"
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setEditingItem(null)
                  setFormData({
                    name: '',
                    type: '',
                    serialNumber: '',
                    location: '',
                    status: 'working',
                    description: '',
                    photo: null,
                    photoPreview: null,
                    responsible: 'none',
                  })
                }}
                disabled={loading}
              >
                Отмена
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </div>
  )
}
