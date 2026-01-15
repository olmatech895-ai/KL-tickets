import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { FileText, Ticket, MessageSquare, User, Shield, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react'

export const Rules = () => {
  const rules = [
    {
      icon: <Ticket className="h-6 w-6" />,
      title: 'Создание тикета',
      description: 'Как правильно создать заявку',
      content: [
        'Нажмите кнопку "Создать тикет" на главной странице',
        'Заполните все обязательные поля: название и описание проблемы',
        'Выберите приоритет (Высокий, Средний, Низкий)',
        'Выберите категорию проблемы (Оборудование, ПО, Сеть, Учетная запись, Другое)',
        'После создания тикет будет отправлен в IT отдел',
      ],
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Комментирование тикетов',
      description: 'Как оставлять комментарии',
      content: [
        'Вы можете комментировать только свои тикеты',
        'Используйте комментарии для уточнения деталей проблемы',
        'IT отдел может задавать вопросы через комментарии',
        'Все комментарии сохраняются в истории тикета',
      ],
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Статусы тикетов',
      description: 'Что означают статусы',
      content: [
        'Открытый - тикет создан и ожидает обработки',
        'Взять на разработку - тикет взят в работу IT отделом',
        'Закрыть тикет - проблема решена, тикет закрыт',
      ],
    },
    {
      icon: <AlertCircle className="h-6 w-6" />,
      title: 'Приоритеты',
      description: 'Как выбрать приоритет',
      content: [
        'Высокий - критическая проблема, блокирует работу',
        'Средний - важная проблема, требует решения в ближайшее время',
        'Низкий - незначительная проблема, можно решить позже',
      ],
    },
    {
      icon: <User className="h-6 w-6" />,
      title: 'Просмотр тикетов',
      description: 'Доступ к вашим тикетам',
      content: [
        'Вы можете просматривать только свои тикеты',
        'На главной странице отображаются все ваши тикеты',
        'Вы можете отслеживать статус каждого тикета',
        'История комментариев доступна в детальном просмотре тикета',
      ],
    },
    {
      icon: <Info className="h-6 w-6" />,
      title: 'Общие правила',
      description: 'Важная информация',
      content: [
        'Описывайте проблему максимально подробно',
        'Указывайте точное время возникновения проблемы',
        'Сообщайте о любых изменениях в статусе проблемы',
        'Не создавайте дублирующие тикеты для одной проблемы',
        'Будьте вежливы в комментариях',
      ],
    },
  ]

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto pt-16 lg:pt-4 sm:pt-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 sm:p-6 md:p-8 text-white shadow-xl pl-12 lg:pl-4 sm:pl-6">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Правила пользования системой</h1>
          </div>
          <p className="text-blue-50 text-xs sm:text-sm md:text-base mt-2">
            Изучите правила работы с тикет-системой для эффективного решения проблем
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Rules Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rules.map((rule, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {rule.icon}
                </div>
                <CardTitle className="text-lg">{rule.title}</CardTitle>
              </div>
              <CardDescription>{rule.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {rule.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Important Notice */}
      <Card className="border-2 border-yellow-500 bg-yellow-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-yellow-900">Важно помнить</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-800">
            Соблюдение правил пользования системой помогает IT отделу быстрее решать ваши проблемы. 
            Чем подробнее описание проблемы, тем быстрее будет найдено решение. 
            При возникновении вопросов обращайтесь к администратору системы.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}



