/** Утилиты для валидации данных */

/**
 * Валидация логина
 * @param {string} username - Логин для проверки
 * @returns {{isValid: boolean, error: string}} - Результат валидации
 */
export const validateUsername = (username) => {
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: 'Логин обязателен для заполнения' }
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Логин должен содержать минимум 3 символа' }
  }

  if (username.length > 30) {
    return { isValid: false, error: 'Логин не должен превышать 30 символов' }
  }

  // Только буквы, цифры, подчеркивание и дефис
  const usernameRegex = /^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Логин может содержать только буквы, цифры, подчеркивание и дефис' }
  }

  return { isValid: true, error: '' }
}

/**
 * Валидация email
 * @param {string} email - Email для проверки
 * @param {string} requiredDomain - Обязательный домен (по умолчанию @kostalegal.com)
 * @returns {{isValid: boolean, error: string}} - Результат валидации
 */
export const validateEmail = (email, requiredDomain = '@kostalegal.com') => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email обязателен для заполнения' }
  }

  // Базовая проверка формата email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Неверный формат email' }
  }

  // Проверка домена
  if (!email.toLowerCase().endsWith(requiredDomain.toLowerCase())) {
    return { isValid: false, error: `Email должен быть с доменом ${requiredDomain}` }
  }

  return { isValid: true, error: '' }
}

/**
 * Валидация пароля
 * @param {string} password - Пароль для проверки
 * @returns {{isValid: boolean, error: string}} - Результат валидации
 */
export const validatePassword = (password) => {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Пароль обязателен для заполнения' }
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Пароль должен содержать минимум 8 символов' }
  }

  if (password.length > 100) {
    return { isValid: false, error: 'Пароль не должен превышать 100 символов' }
  }

  // Пароль должен содержать хотя бы одну букву и одну цифру
  const hasLetter = /[a-zA-Zа-яА-ЯёЁ]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (!hasLetter) {
    return { isValid: false, error: 'Пароль должен содержать хотя бы одну букву' }
  }

  if (!hasNumber) {
    return { isValid: false, error: 'Пароль должен содержать хотя бы одну цифру' }
  }

  return { isValid: true, error: '' }
}

/**
 * Валидация подтверждения пароля
 * @param {string} password - Пароль
 * @param {string} confirmPassword - Подтверждение пароля
 * @returns {{isValid: boolean, error: string}} - Результат валидации
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.length === 0) {
    return { isValid: false, error: 'Подтверждение пароля обязательно' }
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Пароли не совпадают' }
  }

  return { isValid: true, error: '' }
}

/**
 * Валидация всех полей регистрации
 * @param {Object} data - Данные регистрации
 * @returns {{isValid: boolean, errors: Object}} - Результат валидации
 */
export const validateRegistration = (data) => {
  const errors = {}

  // Валидация логина
  const usernameValidation = validateUsername(data.username)
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.error
  }

  // Валидация email
  const emailValidation = validateEmail(data.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error
  }

  // Валидация пароля
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error
  }

  // Валидация подтверждения пароля
  const confirmPasswordValidation = validateConfirmPassword(data.password, data.confirmPassword)
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

