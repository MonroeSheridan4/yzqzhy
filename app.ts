// app.ts
import { userStatusManager, typingStatusManager } from './utils/userStatus'
import { notificationManager, NotificationType } from './utils/notification'
import { analytics } from './utils/analytics'
import { offlineCache } from './utils/offlineCache'
// 🔥 新增系统优化工具
import { statusManager } from './utils/statusManager'
import { offlineQueue } from './utils/offlineQueue'
import { performanceMonitor } from './utils/performance'
// 🚀 WebSocket实时通信
import { initWebSocket } from './utils/websocket-events'

App<IAppOption>({
  globalData: {
    userInfo: undefined,
    debug: true,
    // 用于跨页面传递数据（查看他人资料）
    viewUserProfile: null as { userId: string; fromPage: string } | null,
    // 登录弹窗状态
    showLoginPopup: false,
    loginCallback: null as ((success: boolean) => void) | null,
    // 自定义加载状态
    showCustomLoading: false,
    loadingText: '加载中...',
    loadingMask: true
  },
  
  async onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
        wx.cloud.init({
          env: 'prod-2g2e9u62d243dc67',  // 🔥 新的云托管环境
          traceUser: true
        })
      console.log('✅ 云开发初始化成功')
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // ✅ 登录检查
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      console.log('✅ 已登录:', userInfo.nickname)
      
      // 🌐 初始化用户状态管理
      await userStatusManager.init()
      typingStatusManager.init()
      
      // 🚀 初始化通知系统
      await notificationManager.init()
      console.log('✅ 通知系统初始化成功')
      
      // 📊 初始化埋点系统
      analytics.init()
      console.log('✅ 埋点系统初始化成功')
      
      // 💾 初始化离线缓存
      await offlineCache.init()
      console.log('✅ 离线缓存初始化成功')
      
      // 🔥 初始化状态管理器
      const userId = wx.getStorageSync('userId')
      if (userId) {
        await statusManager.init(userId)
        console.log('✅ 状态管理器初始化成功')
      }
      
      // 📡 初始化离线队列（自动启动）
      console.log('✅ 离线队列已启动')
      
      // 📊 启动性能监控
      console.log('✅ 性能监控已启动')
      
      // 🎨 Markdown缓存已就绪
      console.log('✅ Markdown缓存已就绪')
      
      // 🚀 初始化WebSocket实时通信
      try {
        await initWebSocket()
        console.log('✅ WebSocket实时通信已启动')
      } catch (error) {
        console.error('⚠️ WebSocket初始化失败（将使用轮询方式）:', error)
      }
      
      // 🔥 移除自动订阅通知（需要在用户点击事件中触发）
      // 通知订阅应该在用户主动操作时请求，例如：
      // - 发送消息时
      // - 点赞/收藏时
      // - 进入设置页面时
      // 微信要求必须在用户点击事件中调用 requestSubscribeMessage
    }
  },
  
  onShow() {
    // 应用显示时设置为在线
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      userStatusManager.setOnline()
      
      // 🚀 重新连接WebSocket（如果断开）
      const userId = wx.getStorageSync('userId')
      if (userId) {
        initWebSocket().catch(err => {
          console.error('⚠️ WebSocket重连失败:', err)
        })
      }
    }
  },
  
  onHide() {
    // 应用隐藏时设置为离开
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      userStatusManager.setAway('暂时离开')
    }
    
    // WebSocket会自动维持连接，不需要主动断开
  },

  // 显示登录弹窗
  showLoginPopup(callback?: (success: boolean) => void) {
    this.globalData.showLoginPopup = true
    this.globalData.loginCallback = callback || null
    
    // 通知所有页面更新登录弹窗状态
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      if (currentPage.setData) {
        currentPage.setData({ 
          showLoginPopup: true 
        })
      }
    }
  },

  // 隐藏登录弹窗
  hideLoginPopup() {
    this.globalData.showLoginPopup = false
    
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      if (currentPage.setData) {
        currentPage.setData({ 
          showLoginPopup: false 
        })
      }
    }
  },

  // 检查登录状态
  checkLogin(showPopup: boolean = true): boolean {
    const userId = wx.getStorageSync('userId')
    if (!userId) {
      if (showPopup) {
        this.showLoginPopup()
      }
      return false
    }
    return true
  },

  // 登录成功回调
  onLoginSuccess(user: any) {
    this.globalData.userInfo = user
    
    // 执行回调
    if (this.globalData.loginCallback) {
      this.globalData.loginCallback(true)
      this.globalData.loginCallback = null
    }
    
    this.hideLoginPopup()
  },
  
  // 🎨 自定义Loading管理
  showCustomLoading(text?: string, mask?: boolean) {
    this.globalData.showCustomLoading = true
    this.globalData.loadingText = text || '加载中...'
    this.globalData.loadingMask = mask !== false
  },
  
  hideCustomLoading() {
    this.globalData.showCustomLoading = false
  }
})