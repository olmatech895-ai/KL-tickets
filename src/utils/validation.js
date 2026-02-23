
/**
 * @param {string} value 
 * @param {number} minя
 * @param {number} max 
 * @param {string} fieldName 
 * @returns {{isValid: boolean, error: string}}
 */
export const validateLength = (value, min = 0, max = 1000, fieldName = 'Поле') => {
  if (value == null) value = ''
  const str = String(value).trim()
  if (min > 0 && str.length < min) {
    return { isValid: false, error: `${fieldName} должно содержать минимум ${min} символов` }
  }
  if (max > 0 && str.length > max) {
    return { isValid: false, error: `${fieldName} не должно превышать ${max} символов` }
  }
  return { isValid: true, error: '' }
}

/**
 * @param {string} username
 * @returns {{isValid: boolean, error: string}} -
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
 * @param {string} email 
 * @param {string} requiredDomain 
 * @returns {{isValid: boolean, error: string}}
 */
export const validateEmail = (email, requiredDomain = '@kostalegal.com') => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email обязателен для заполнения' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Неверный формат email' }
  }

  if (!email.toLowerCase().endsWith(requiredDomain.toLowerCase())) {
    return { isValid: false, error: `Email должен быть с доменом ${requiredDomain}` }
  }

  return { isValid: true, error: '' }
}

/**
 * @param {string} password 
 * @returns {{isValid: boolean, error: string}} 
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
 * @param {string} password 
 * @param {string} confirmPassword 
 * @returns {{isValid: boolean, error: string}}
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
 * @param {Object} data 
 * @returns {{isValid: boolean, errors: Object}}
 */
export const validateRegistration = (data) => {
  const errors = {}

  const usernameValidation = validateUsername(data.username)
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.error
  }

  const emailValidation = validateEmail(data.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error
  }

  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error
  }

  const confirmPasswordValidation = validateConfirmPassword(data.password, data.confirmPassword)
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

