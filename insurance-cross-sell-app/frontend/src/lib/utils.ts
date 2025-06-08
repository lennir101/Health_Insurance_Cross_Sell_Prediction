import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合併類名，支持條件類名和Tailwind類名的合併
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化數字為百分比
 */
export function formatPercent(value: number, decimalPlaces = 2): string {
  return `${(value * 100).toFixed(decimalPlaces)}%`
}

/**
 * 從錯誤對象中獲取錯誤訊息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

/**
 * 延遲函數
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 生成隨機ID
 */
export function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 安全地解析JSON
 */
export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch (error) {
    return fallback
  }
}

/**
 * 截斷字符串
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength)}...`
}

/**
 * 深度合併對象
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target }
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key as keyof typeof source])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key as keyof typeof source] })
        } else {
          output[key as keyof T] = deepMerge(
            target[key as keyof T] as object,
            source[key as keyof typeof source] as object
          ) as T[keyof T]
        }
      } else {
        Object.assign(output, { [key]: source[key as keyof typeof source] })
      }
    })
  }
  
  return output
}

/**
 * 檢查值是否為對象
 */
function isObject(item: unknown): item is object {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item))
} 