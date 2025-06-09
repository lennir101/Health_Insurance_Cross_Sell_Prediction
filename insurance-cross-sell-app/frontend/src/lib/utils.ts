import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

/**
 * 合併類名，支持條件類名和Tailwind類名的合併
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * 格式化日期
 */
export function formatDate(input: string | number): string {
    const date = new Date(input)
    return date.toLocaleDateString("zh-TW", {
        month: "long",
        day: "numeric",
        year: "numeric",
    })
}

/**
 * 格式化貨幣
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number): string {
    return new Intl.NumberFormat('zh-TW', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value);
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
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
    if (!value) return fallback;
    
    try {
        // 如果輸入是對象而不是字符串，直接返回
        if (typeof value === 'object') {
            return value as unknown as T;
        }
        return JSON.parse(value) as T
    } catch (error) {
        console.error('JSON解析錯誤:', error, '原始值:', value);
        return fallback
    }
}

/**
 * 安全地轉換為 JSON 字符串
 */
export function safeJsonStringify(value: any, fallback: string = '{}'): string {
    try {
        return JSON.stringify(value);
    } catch (error) {
        console.error('JSON序列化錯誤:', error, '原始值:', value);
        return fallback;
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
    const output = {...target}

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key as keyof typeof source])) {
                if (!(key in target)) {
                    Object.assign(output, {[key]: source[key as keyof typeof source]})
                } else {
                    output[key as keyof T] = deepMerge(
                        target[key as keyof T] as object,
                        source[key as keyof typeof source] as object
                    ) as T[keyof T]
                }
            } else {
                Object.assign(output, {[key]: source[key as keyof typeof source]})
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