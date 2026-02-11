import { FormInstance } from 'antd'
import { ErrorResponse } from './apiClient'

/**
 * 将字段错误应用到Ant Design表单
 * @param form Ant Design表单实例
 * @param fieldErrors 字段错误数组
 * @param fieldNameMapping 字段名映射（可选），用于将API字段名映射到表单字段名
 */
export function applyFieldErrorsToForm(
  form: FormInstance,
  fieldErrors: ErrorResponse['fieldErrors'] = [],
  fieldNameMapping: Record<string, string> = {}
): void {
  if (!fieldErrors || fieldErrors.length === 0) {
    return
  }

  const errors: Array<{ name: string | string[]; errors: string[] }> = []

  fieldErrors.forEach((fieldError) => {
    const fieldName = fieldNameMapping[fieldError.field] || fieldError.field
    if (fieldName) {
      errors.push({
        name: fieldName.split('.'),
        errors: [fieldError.message],
      })
    }
  })

  if (errors.length > 0) {
    form.setFields(errors)
  }
}

/**
 * 检查错误是否为验证错误
 */
export function isValidationError(error: any): boolean {
  const errorCode = error.errorResponse?.code || error.response?.data?.code
  return errorCode === 'VALIDATION_ERROR' || error.response?.status === 422
}

/**
 * 从错误对象中提取字段错误
 */
export function extractFieldErrors(error: any): ErrorResponse['fieldErrors'] {
  return error.errorResponse?.fieldErrors || error.response?.data?.fieldErrors
}

/**
 * 获取错误消息
 * @param error 错误对象
 * @param defaultMessage 默认错误消息
 */
export function getErrorMessage(error: any, defaultMessage = '操作失败'): string {
  return error.errorResponse?.message || 
         error.response?.data?.message || 
         error.response?.data?.error || 
         error.message || 
         defaultMessage
}

/**
 * 处理API错误
 * @param error 错误对象
 * @param options 处理选项
 * @returns 是否已处理错误
 */
export function handleApiError(
  error: any,
  options: {
    form?: FormInstance
    fieldNameMapping?: Record<string, string>
    showMessage?: boolean
    defaultMessage?: string
  } = {}
): boolean {
  const { form, fieldNameMapping, showMessage = true, defaultMessage = '操作失败' } = options

  // 检查是否为验证错误
  if (isValidationError(error)) {
    const fieldErrors = extractFieldErrors(error)
    
    if (form && fieldErrors && fieldErrors.length > 0) {
      // 将字段错误应用到表单
      applyFieldErrorsToForm(form, fieldErrors, fieldNameMapping)
      
      // 如果需要显示消息，显示通用的验证错误消息
      if (showMessage) {
        const message = getErrorMessage(error, '请检查表单输入')
        import('antd').then(({ message: antdMessage }) => {
          antdMessage.warning(message)
        })
      }
      return true
    }
  }

  // 非验证错误或没有字段错误
  if (showMessage) {
    const message = getErrorMessage(error, defaultMessage)
    import('antd').then(({ message: antdMessage }) => {
      antdMessage.error(message)
    })
  }

  return false
}