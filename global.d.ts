/**
 * 全局类型声明
 */

// 微信小程序配置对象
declare const __wxConfig: {
  envVersion: 'develop' | 'trial' | 'release'
  platform: string
  [key: string]: any
} | undefined

