// /**
//  * bottomImagePopup.js - 完全独立版本
//  * 功能：底部图片弹窗 + 左下缩略图 + 右上角倒计时
//  * 页面加载时获取用户IP和UA，点击下载时调用接口
//  * 新增：获取当前访问地址作为pageName参数，添加qudao='百度'参数
//  * 依赖：无 (纯原生JS)
//  */

// (function (global) {
//   "use strict";

//   // 默认配置 - 可直接修改这里
//   const DEFAULT_CONFIG = {
//     imageUrl: "https://png.masyunrui.com/muban001/jy/popup1.png", // 弹窗主图
//     thumbnailUrl: "https://png.masyunrui.com/muban001/jy/popup2.png", // 缩略图
//     autoHideDelay: 5000, // 自动隐藏延迟(ms)
//     apiUrl: "https://sgtxad.masyunrui.com/appocpc/getAdClickData", // 接口地址
//     clickName: "剪映", // 点击名称
//     clickType: "1", // 点击类型
//     qudao: "百度", // 渠道参数
//   };

//   class BottomImagePopup {
//     constructor(config = {}) {
//       // 合并配置
//       this.config = {
//         imageUrl: config.imageUrl || DEFAULT_CONFIG.imageUrl,
//         thumbnailUrl: config.thumbnailUrl || DEFAULT_CONFIG.thumbnailUrl,
//         autoHideDelay:
//           config.autoHideDelay !== undefined
//             ? config.autoHideDelay
//             : DEFAULT_CONFIG.autoHideDelay,
//         apiUrl: config.apiUrl || DEFAULT_CONFIG.apiUrl,
//         clickName: config.clickName || DEFAULT_CONFIG.clickName,
//         clickType: config.clickType || DEFAULT_CONFIG.clickType,
//         qudao: config.qudao || DEFAULT_CONFIG.qudao, // 添加qudao配置
//         onPopupClick: config.onPopupClick || this.defaultDownload.bind(this), // 绑定this
//         onClose: config.onClose || null,
//         onCountdown: config.onCountdown || null,
//       };

//       this.popup = null;
//       this.thumbnail = null;
//       this.closeBtn = null;
//       this.countdownEl = null;
//       this.thumbnailImage = null;
//       this.autoTimer = null;
//       this.countdownInterval = null;
//       this.remainingSeconds = Math.ceil(this.config.autoHideDelay / 1000);
//       this.isDestroyed = false;

//       // 用户信息
//       this.userIP = "";
//       this.userUA = navigator.userAgent;

//       // 获取当前访问地址（完整URL）
//       this.pageName = window.location.href;
//       console.log("当前访问地址:", this.pageName);

//       // 等待DOM加载完成后再初始化
//       if (document.readyState === "loading") {
//         document.addEventListener("DOMContentLoaded", () => this.init());
//       } else {
//         setTimeout(() => this.init(), 100);
//       }

//       // 获取用户IP
//       this.fetchUserIP();
//     }

//     // 获取用户IP
//     fetchUserIP() {
//       // 使用多个备用API获取IP
//       const ipApis = [
//         "https://api64.ipify.org/?format=json",
//         // 'https://ipapi.co/json/',
//         // 'https://api.ipify.org?format=json'
//       ];

//       let currentApiIndex = 0;

//       const tryFetchIP = () => {
//         if (currentApiIndex >= ipApis.length) {
//           console.warn("所有IP获取接口都失败，使用空IP");
//           this.userIP = "";
//           return;
//         }

//         const apiUrl = ipApis[currentApiIndex];

//         fetch(apiUrl, {
//           mode: "cors",
//           cache: "no-cache",
//         })
//           .then((response) => {
//             if (!response.ok) {
//               throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//           })
//           .then((data) => {
//             // 不同API返回的IP字段不同
//             if (data.ip) {
//               this.userIP = data.ip;
//             } else if (data.query) {
//               this.userIP = data.query;
//             } else if (data.ip_address) {
//               this.userIP = data.ip_address;
//             } else {
//               // 如果没找到IP字段，尝试下一个API
//               currentApiIndex++;
//               tryFetchIP();
//             }

//             if (this.userIP) {
//               console.log("获取用户IP成功:", this.userIP);
//             }
//           })
//           .catch((error) => {
//             console.warn(`IP获取失败 (${apiUrl}):`, error);
//             currentApiIndex++;
//             tryFetchIP();
//           });
//       };

//       tryFetchIP();
//     }

//     // 获取当前页面地址
//     getPageName() {
//       return window.location.href;
//     }

//     // 调用点击接口 - 添加qudao参数
//     callClickAPI(source) {
//       const params = {
//         clickName: this.config.clickName,
//         clickType: this.config.clickType,
//         ip: this.userIP || "",
//         ua: this.userUA || "",
//         pageName: this.getPageName(), // 添加当前访问地址
//         qudao: this.config.qudao, // 添加渠道参数
//       };

//       // 构建查询字符串
//       const queryString = new URLSearchParams(params).toString();
//       const url = `${this.config.apiUrl}?${queryString}`;

//       console.log("调用点击接口，URL:", url, "来源:", source);
//       console.log("接口参数:", params); // 打印所有参数便于调试

//       // 使用fetch调用接口 - GET请求不能有body
//       fetch(url, {
//         method: "GET",
//         headers: {
//           Accept: "application/json",
//         },
//         mode: "cors",
//         cache: "no-cache",
//       })
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then((data) => {
//           window.location.href =
//         //   下载链接
//             "https://lf3-package.vlabstatic.com/obj/faceu-packages/installer/jianying_jianyingpro_xzjs_1.2.8_installer.exe";
//           console.log("接口调用成功:", data);
//         })
//         .catch((error) => {
//           console.error("接口调用失败:", error);
//           // 降级方案：使用图片像素追踪
//           this.fallbackCallAPI(params);
//         });
//     }

//     // 降级方案：使用图片像素追踪
//     fallbackCallAPI(params) {
//       try {
//         const img = new Image();
//         // 添加时间戳避免缓存
//         const queryParams = {
//           ...params,
//           _t: Date.now(),
//         };
//         const queryString = new URLSearchParams(queryParams).toString();
//         img.src = `${this.config.apiUrl}?${queryString}`;

//         // 添加错误处理
//         img.onerror = () => {
//           console.warn("降级方案图片加载失败，可能是SSL证书问题");
//           // 最后尝试使用JSONP方式（如果需要跨域）
//           this.jsonpFallback(params);
//         };

//         console.log("使用降级方案调用接口");
//       } catch (error) {
//         console.error("降级方案也失败:", error);
//         this.jsonpFallback(params);
//       }
//     }

//     // JSONP降级方案（处理SSL证书问题）
//     jsonpFallback(params) {
//       try {
//         const callbackName = "jsonp_callback_" + Date.now();
//         const script = document.createElement("script");

//         // 创建全局回调函数
//         window[callbackName] = function (data) {
//           console.log("JSONP调用成功:", data);
//           delete window[callbackName];
//           document.body.removeChild(script);
//         };

//         // 构建URL
//         const queryParams = {
//           ...params,
//           callback: callbackName,
//           _t: Date.now(),
//         };
//         const queryString = new URLSearchParams(queryParams).toString();
//         script.src = `${this.config.apiUrl}?${queryString}`;

//         // 错误处理
//         script.onerror = function () {
//           console.error("JSONP调用失败");
//           delete window[callbackName];
//           if (script.parentNode) {
//             document.body.removeChild(script);
//           }
//         };

//         document.body.appendChild(script);
//         console.log("使用JSONP降级方案");
//       } catch (error) {
//         console.error("所有调用方案都失败:", error);
//       }
//     }

//     // 默认下载方法
//     defaultDownload(source) {
//       console.log("底部弹窗广告被点击了，来源：", source);
//       this.callClickAPI(source);
//     }

//     // 创建DOM结构
//     createDOM() {
//       if (!document.body) {
//         console.error("document.body 不存在");
//         return false;
//       }

//       this.instanceId = Date.now();

//       // 添加样式
//       this.addStyles();

//       // 弹窗部分
//       this.popup = document.createElement("div");
//       this.popup.className = "bottom-image-popup";
//       this.popup.id = "bottom-image-popup-" + this.instanceId;

//       const wrapper = document.createElement("div");
//       wrapper.className = "popup-image-wrapper";

//       const img = document.createElement("img");
//       img.src = this.config.imageUrl;
//       img.alt = "推广图片";
//       img.setAttribute("loading", "lazy");

//       img.onerror = () => {
//         console.warn("图片加载失败:", this.config.imageUrl);
//       };

//       const topRight = document.createElement("div");
//       topRight.className = "popup-top-right";

//       this.countdownEl = document.createElement("div");
//       this.countdownEl.className = "popup-countdown";

//       const countdownIcon = document.createElement("span");
//       countdownIcon.className = "countdown-icon";
//       countdownIcon.textContent = "关闭剩余";

//       this.countdownNumber = document.createElement("span");
//       this.countdownNumber.className = "countdown-number";
//       this.updateCountdownDisplay();

//       this.countdownEl.appendChild(countdownIcon);
//       this.countdownEl.appendChild(this.countdownNumber);

//       this.closeBtn = document.createElement("div");
//       this.closeBtn.className = "popup-close-btn";
//       this.closeBtn.innerHTML = "&times;";
//       this.closeBtn.setAttribute("role", "button");
//       this.closeBtn.setAttribute("aria-label", "关闭");

//       topRight.appendChild(this.countdownEl);
//       topRight.appendChild(this.closeBtn);

//       wrapper.appendChild(img);
//       wrapper.appendChild(topRight);
//       this.popup.appendChild(wrapper);

//       // 缩略图部分
//       this.thumbnail = document.createElement("div");
//       this.thumbnail.className = "popup-thumbnail";
//       this.thumbnail.id = "thumbnail_" + this.instanceId;

//       this.thumbnailImage = document.createElement("div");
//       this.thumbnailImage.className = "thumbnail-image";

//       const thumbImg = document.createElement("img");
//       thumbImg.src = this.config.thumbnailUrl;
//       thumbImg.alt = "缩略图";
//       thumbImg.setAttribute("loading", "lazy");

//       thumbImg.onerror = () => {
//         console.warn("缩略图加载失败:", this.config.thumbnailUrl);
//       };

//       this.thumbnailImage.appendChild(thumbImg);
//       this.thumbnail.appendChild(this.thumbnailImage);

//       try {
//         document.body.appendChild(this.popup);
//         document.body.appendChild(this.thumbnail);
//       } catch (error) {
//         console.error("添加弹窗到body失败:", error);
//         return false;
//       }

//       return true;
//     }

//     // 添加样式
//     addStyles() {
//       if (document.getElementById("bottom-popup-styles")) return;

//       const style = document.createElement("style");
//       style.id = "bottom-popup-styles";
//       style.textContent = `
//         .bottom-image-popup {
//           position: fixed;
//           bottom: 0;
//           left: 0;
//           width: 100vw;
//         //   height: 400px;
//           z-index: 9999;
//           transition: transform 0.35s ease, opacity 0.35s ease;
//           transform: translateY(100%);
//           opacity: 0;
//           pointer-events: none;
//           line-height: 0;
//         }
        
//         .bottom-image-popup.show {
//           transform: translateY(0);
//           opacity: 1;
//           pointer-events: auto;
//         }
        
//         .bottom-image-popup .popup-image-wrapper {
//           position: relative;
//           background-color: #f0f0f0;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//         }
        
//         .bottom-image-popup .popup-image-wrapper img {
//           max-width: 100%;
//           max-height: 100%;
//           width: auto;
//           height: auto;
//           display: block;
//           object-fit: contain;
//           box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.2);
//           pointer-events: none;
//         }
        
//         .popup-top-right {
//           position: absolute;
//           top: 20px;
//           right: 20px;
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           z-index: 10000;
//         }
        
//         .popup-countdown {
//           background-color: rgba(0, 0, 0, 0.6);
//           color: white;
//           font-size: 16px;
//           font-weight: 600;
//           padding: 8px 14px;
//           border-radius: 30px;
//           backdrop-filter: blur(4px);
//           border: 1px solid rgba(255, 255, 255, 0.3);
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           letter-spacing: 0.5px;
//         }
        
//         .popup-countdown .countdown-icon {
//           font-size: 14px;
//           opacity: 0.9;
//         }
        
//         .popup-countdown .countdown-number {
//           min-width: 28px;
//           text-align: center;
//         }
        
//         .popup-close-btn {
//           width: 44px;
//           height: 44px;
//           background-color: rgba(255, 255, 255, 0.95);
//           border-radius: 50%;
//           box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           font-size: 28px;
//           font-weight: 400;
//           color: #2c3e50;
//           transition: background-color 0.2s, transform 0.15s;
//           user-select: none;
//           backdrop-filter: blur(4px);
//           border: 1px solid rgba(230, 245, 210, 0.7);
//         }
        
//         .popup-close-btn:hover {
//           background-color: #ffffff;
//           transform: scale(1.05);
//         }
        
//         .popup-close-btn:active {
//           transform: scale(0.95);
//         }
        
//         .popup-thumbnail {
//           position: fixed;
//           bottom: 10px;
//           left: 10px;
//           display: flex;
//           align-items: center;
//           z-index: 9998;
//           opacity: 0;
//           transform: scale(0.6) translateY(30px);
//           pointer-events: none;
//           transition: all 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.1);
//         }
        
//         .popup-thumbnail.show-thumb {
//           opacity: 1;
//           transform: scale(1) translateY(0);
//           pointer-events: auto;
//         }
        
//         .popup-thumbnail .thumbnail-image {
//           width: 240px;
//         //   height: 240px;
//           border-radius: 16px;
//           overflow: hidden;
//           box-shadow: 0 8px 22px rgba(0, 40, 0, 0.25);
//           border: 3px solid white;
//           background: #fff;
//           cursor: pointer;
//           transition: transform 0.2s ease;
//         }
        
//         .popup-thumbnail .thumbnail-image:hover {
//           transform: scale(1.05);
//         }
        
//         .popup-thumbnail .thumbnail-image:active {
//           transform: scale(0.95);
//         }
        
//         .popup-thumbnail .thumbnail-image img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//           display: block;
//           pointer-events: none;
//         }
        
//         @media (max-width: 700px) {
//           .bottom-image-popup {
//             height: 280px;
//           }
//           .popup-top-right {
//             top: 12px;
//             right: 12px;
//             gap: 8px;
//           }
//           .popup-countdown {
//             font-size: 14px;
//             padding: 6px 10px;
//           }
//           .popup-close-btn {
//             width: 38px;
//             height: 38px;
//             font-size: 26px;
//           }
//           .popup-thumbnail {
//             bottom: 80px;
//             left: 16px;
//           }
//           .popup-thumbnail .thumbnail-image {
//             width: 50px;
//             height: 50px;
//           }
//         }
//       `;

//       document.head.appendChild(style);
//     }

//     // 更新倒计时显示
//     updateCountdownDisplay() {
//       if (this.countdownNumber) {
//         this.countdownNumber.textContent = this.remainingSeconds + "s";
//       }
//     }

//     // 开始倒计时
//     startCountdown() {
//       this.stopCountdown();

//       if (this.config.autoHideDelay <= 0) return;

//       this.remainingSeconds = Math.ceil(this.config.autoHideDelay / 1000);
//       this.updateCountdownDisplay();

//       this.countdownInterval = setInterval(() => {
//         this.remainingSeconds--;
//         this.updateCountdownDisplay();

//         if (this.config.onCountdown) {
//           this.config.onCountdown(this.remainingSeconds);
//         }

//         if (this.remainingSeconds <= 0) {
//           this.stopCountdown();
//         }
//       }, 1000);
//     }

//     // 停止倒计时
//     stopCountdown() {
//       if (this.countdownInterval) {
//         clearInterval(this.countdownInterval);
//         this.countdownInterval = null;
//       }
//     }

//     // 重置倒计时
//     resetCountdown() {
//       this.stopCountdown();
//       if (
//         this.config.autoHideDelay > 0 &&
//         this.popup &&
//         this.popup.classList.contains("show")
//       ) {
//         this.remainingSeconds = Math.ceil(this.config.autoHideDelay / 1000);
//         this.updateCountdownDisplay();
//         this.startCountdown();
//       }
//     }

//     // 绑定事件
//     bindEvents() {
//       if (!this.closeBtn || !this.thumbnailImage || !this.popup) return;

//       // 关闭按钮点击
//       this.closeBtn.addEventListener("click", (e) => {
//         e.stopPropagation();
//         e.preventDefault();
//         this.hidePopup();
//         this.showThumbnail();
//         this.clearTimer();
//         this.stopCountdown();
//         if (this.config.onClose) this.config.onClose("closeBtn");
//       });

//       // 缩略图图片点击
//       this.thumbnailImage.addEventListener("click", (e) => {
//         e.stopPropagation();
//         e.preventDefault();

//         if (this.config.onPopupClick) {
//           this.config.onPopupClick("thumbnail");
//         }

//         this.resetTimer();
//         this.resetCountdown();
//       });

//       // 弹窗点击
//       this.popup.addEventListener("click", (e) => {
//         if (e.target === this.closeBtn || this.closeBtn.contains(e.target))
//           return;
//         if (
//           e.target === this.countdownEl ||
//           this.countdownEl.contains(e.target)
//         )
//           return;

//         if (this.config.onPopupClick) {
//           this.config.onPopupClick("popup");
//         }

//         this.resetTimer();
//         this.resetCountdown();
//       });
//     }

//     // 显示弹窗
//     showPopup() {
//       if (this.isDestroyed || !this.popup) return;
//       this.popup.classList.add("show");
//       if (this.config.autoHideDelay > 0) {
//         this.startCountdown();
//       }
//     }

//     // 隐藏弹窗
//     hidePopup() {
//       if (!this.popup) return;
//       this.popup.classList.remove("show");
//       this.stopCountdown();
//     }

//     // 显示缩略图
//     showThumbnail() {
//       if (!this.thumbnail) return;
//       this.thumbnail.classList.add("show-thumb");
//     }

//     // 隐藏缩略图
//     hideThumbnail() {
//       if (!this.thumbnail) return;
//       this.thumbnail.classList.remove("show-thumb");
//     }

//     // 清除定时器
//     clearTimer() {
//       if (this.autoTimer) {
//         clearTimeout(this.autoTimer);
//         this.autoTimer = null;
//       }
//     }

//     // 重置自动隐藏定时器
//     resetTimer() {
//       this.clearTimer();
//       if (this.config.autoHideDelay > 0) {
//         this.autoTimer = setTimeout(() => {
//           this.hidePopup();
//           this.showThumbnail();
//           this.stopCountdown();
//         }, this.config.autoHideDelay);
//       }
//     }

//     // 初始化
//     init() {
//       try {
//         if (!document.body) {
//           setTimeout(() => this.init(), 100);
//           return;
//         }

//         const success = this.createDOM();
//         if (!success) {
//           console.error("创建DOM失败");
//           return;
//         }

//         this.bindEvents();

//         setTimeout(() => {
//           if (!this.isDestroyed) {
//             this.showPopup();
//           }
//         }, 100);

//         if (this.config.autoHideDelay > 0) {
//           this.autoTimer = setTimeout(() => {
//             this.hidePopup();
//             this.showThumbnail();
//             this.stopCountdown();
//           }, this.config.autoHideDelay);
//         }

//         console.log("底部弹窗初始化成功，当前页面地址:", this.pageName);
//       } catch (error) {
//         console.error("底部弹窗初始化失败:", error);
//       }
//     }

//     // 手动关闭弹窗
//     close() {
//       if (this.isDestroyed) return;
//       this.hidePopup();
//       this.showThumbnail();
//       this.clearTimer();
//       this.stopCountdown();
//     }

//     // 销毁实例
//     destroy() {
//       this.clearTimer();
//       this.stopCountdown();
//       if (this.popup && this.popup.parentNode) {
//         this.popup.parentNode.removeChild(this.popup);
//       }
//       if (this.thumbnail && this.thumbnail.parentNode) {
//         this.thumbnail.parentNode.removeChild(this.thumbnail);
//       }
//       this.isDestroyed = true;
//     }
//   }

//   // 自动初始化
//   function autoInit() {
//     if (window._bottomPopupInitialized) {
//       console.log("底部弹窗已经初始化过");
//       return;
//     }

//     let attempts = 0;
//     const maxAttempts = 10;

//     function tryInit() {
//       attempts++;

//       if (!document.body) {
//         if (attempts < maxAttempts) {
//           console.log(`等待document.body可用... (${attempts}/${maxAttempts})`);
//           setTimeout(tryInit, 200);
//         } else {
//           console.error("初始化失败: document.body 不可用");
//         }
//         return;
//       }

//       try {
//         const popup = new BottomImagePopup();
//         window.bottomPopup = popup;
//         window._bottomPopupInitialized = true;
//         console.log("底部弹窗自动初始化成功", popup);
//       } catch (error) {
//         console.error("底部弹窗初始化失败:", error);
//         if (attempts < maxAttempts) {
//           console.log(`重试初始化... (${attempts}/${maxAttempts})`);
//           setTimeout(tryInit, 500);
//         }
//       }
//     }

//     tryInit();
//   }

//   // 根据页面加载状态自动初始化
//   if (
//     document.readyState === "complete" ||
//     document.readyState === "interactive"
//   ) {
//     setTimeout(autoInit, 200);
//   } else {
//     document.addEventListener("DOMContentLoaded", autoInit);
//     window.addEventListener("load", autoInit);
//   }

//   // 暴露类到全局
//   global.BottomImagePopup = BottomImagePopup;
// })(window);