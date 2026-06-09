/**
 * Advanced Screenshot Prevention Utilities
 * 
 * This module provides comprehensive protection against screenshot attempts
 * across different devices and browsers.
 */

export interface ScreenshotPreventionConfig {
  onViolationDetected: (type: 'screenshot' | 'devtools' | 'visibility' | 'keyboard') => void;
  blurOnViolation?: boolean;
  strictMode?: boolean;
}

export class ScreenshotPrevention {
  private config: ScreenshotPreventionConfig;
  private listeners: Array<() => void> = [];
  private intervals: Array<NodeJS.Timeout> = [];
  private isActive = false;

  constructor(config: ScreenshotPreventionConfig) {
    this.config = config;
  }

  /**
   * Activate all screenshot prevention measures
   */
  activate(): void {
    if (this.isActive) return;
    this.isActive = true;

    this.preventKeyboardShortcuts();
    this.preventContextMenu();
    this.detectDevTools();
    this.monitorVisibility();
    this.preventTextSelection();
    this.preventDragDrop();
    this.detectPrintScreen();
    this.preventInspection();
    
    if (this.config.strictMode) {
      this.enableStrictMode();
    }
  }

  /**
   * Deactivate all prevention measures
   */
  deactivate(): void {
    if (!this.isActive) return;
    this.isActive = false;

    // Remove all event listeners
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];

    // Restore normal behavior
    this.restoreNormalBehavior();
  }

  /**
   * Prevent keyboard shortcuts for screenshots and dev tools
   */
  private preventKeyboardShortcuts(): void {
    const keydownHandler = (e: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = e;
      
      // Screenshot shortcuts
      const isScreenshotShortcut = (
        // Windows/Linux screenshots
        key === 'PrintScreen' ||
        (altKey && key === 'PrintScreen') ||
        (ctrlKey && shiftKey && key === 'S') ||
        // Mac screenshots
        (metaKey && shiftKey && ['3', '4', '5'].includes(key)) ||
        // Snipping tool
        (ctrlKey && shiftKey && key === 'S')
      );

      // Dev tools shortcuts
      const isDevToolsShortcut = (
        (ctrlKey || metaKey) && shiftKey && ['I', 'J', 'C'].includes(key) ||
        key === 'F12' ||
        (ctrlKey || metaKey) && key === 'U' // View source
      );

      // Other restricted shortcuts
      const isRestrictedShortcut = (
        (ctrlKey || metaKey) && key === 'S' || // Save
        (ctrlKey || metaKey) && key === 'P' || // Print
        (ctrlKey || metaKey) && key === 'A' || // Select all
        (ctrlKey || metaKey) && key === 'C' || // Copy
        (ctrlKey || metaKey) && key === 'V' || // Paste
        (ctrlKey || metaKey) && key === 'X'    // Cut
      );

      if (isScreenshotShortcut) {
        e.preventDefault();
        e.stopPropagation();
        this.config.onViolationDetected('screenshot');
        return false;
      }

      if (isDevToolsShortcut) {
        e.preventDefault();
        e.stopPropagation();
        this.config.onViolationDetected('devtools');
        return false;
      }

      if (isRestrictedShortcut) {
        e.preventDefault();
        e.stopPropagation();
        this.config.onViolationDetected('keyboard');
        return false;
      }
    };

    document.addEventListener('keydown', keydownHandler, true);
    this.listeners.push(() => document.removeEventListener('keydown', keydownHandler, true));
  }

  /**
   * Prevent right-click context menu
   */
  private preventContextMenu(): void {
    const contextMenuHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.config.onViolationDetected('screenshot');
      return false;
    };

    document.addEventListener('contextmenu', contextMenuHandler, true);
    this.listeners.push(() => document.removeEventListener('contextmenu', contextMenuHandler, true));
  }

  /**
   * Detect developer tools opening
   */
  private detectDevTools(): void {
    let devtools = { open: false };
    const threshold = 160;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devtools.open) {
          devtools.open = true;
          this.config.onViolationDetected('devtools');
        }
      } else {
        devtools.open = false;
      }
    };

    const interval = setInterval(checkDevTools, 500);
    this.intervals.push(interval);

    // Additional dev tools detection methods
    this.detectConsoleUsage();
    this.detectDebugger();
  }

  /**
   * Detect console usage
   */
  private detectConsoleUsage(): void {
    // Override console methods to detect usage
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      this.config.onViolationDetected('devtools');
      return originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      this.config.onViolationDetected('devtools');
      return originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      this.config.onViolationDetected('devtools');
      return originalError.apply(console, args);
    };

    this.listeners.push(() => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    });
  }

  /**
   * Detect debugger statements
   */
  private detectDebugger(): void {
    const checkDebugger = () => {
      const start = performance.now();
      debugger; // This will pause if dev tools are open
      const end = performance.now();
      
      if (end - start > 100) {
        this.config.onViolationDetected('devtools');
      }
    };

    const interval = setInterval(checkDebugger, 1000);
    this.intervals.push(interval);
  }

  /**
   * Monitor page visibility changes
   */
  private monitorVisibility(): void {
    const visibilityHandler = () => {
      if (document.hidden) {
        this.config.onViolationDetected('visibility');
      }
    };

    document.addEventListener('visibilitychange', visibilityHandler);
    this.listeners.push(() => document.removeEventListener('visibilitychange', visibilityHandler));

    // Monitor window focus
    const blurHandler = () => {
      this.config.onViolationDetected('visibility');
    };

    window.addEventListener('blur', blurHandler);
    this.listeners.push(() => window.removeEventListener('blur', blurHandler));
  }

  /**
   * Prevent text selection
   */
  private preventTextSelection(): void {
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
    `;
    document.head.appendChild(style);

    this.listeners.push(() => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    });
  }

  /**
   * Prevent drag and drop
   */
  private preventDragDrop(): void {
    const dragStartHandler = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const dropHandler = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    document.addEventListener('dragstart', dragStartHandler, true);
    document.addEventListener('drop', dropHandler, true);

    this.listeners.push(() => {
      document.removeEventListener('dragstart', dragStartHandler, true);
      document.removeEventListener('drop', dropHandler, true);
    });
  }

  /**
   * Detect PrintScreen key specifically
   */
  private detectPrintScreen(): void {
    // Create a hidden canvas to detect clipboard access
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvas.style.position = 'absolute';
    canvas.style.left = '-9999px';
    canvas.style.top = '-9999px';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, 1, 1);
    }

    // Monitor for clipboard changes (potential screenshot)
    const checkClipboard = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.read) {
          const items = await navigator.clipboard.read();
          if (items.length > 0) {
            this.config.onViolationDetected('screenshot');
          }
        }
      } catch (e) {
        // Clipboard access denied or not supported
      }
    };

    const interval = setInterval(checkClipboard, 1000);
    this.intervals.push(interval);

    this.listeners.push(() => {
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    });
  }

  /**
   * Prevent inspection of elements
   */
  private preventInspection(): void {
    const selectStartHandler = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('selectstart', selectStartHandler, true);
    this.listeners.push(() => document.removeEventListener('selectstart', selectStartHandler, true));
  }

  /**
   * Enable strict mode with additional protections
   */
  private enableStrictMode(): void {
    // Disable image dragging
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.draggable = false;
      img.style.pointerEvents = 'none';
    });

    // Monitor for new images
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLImageElement) {
            node.draggable = false;
            node.style.pointerEvents = 'none';
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    this.listeners.push(() => observer.disconnect());

    // Add watermark overlay
    this.addWatermarkOverlay();
  }

  /**
   * Add invisible watermark overlay
   */
  private addWatermarkOverlay(): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 50px,
        rgba(255, 255, 255, 0.01) 50px,
        rgba(255, 255, 255, 0.01) 100px
      );
    `;
    document.body.appendChild(overlay);

    this.listeners.push(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });
  }

  /**
   * Restore normal browser behavior
   */
  private restoreNormalBehavior(): void {
    // Remove any custom styles
    const customStyles = document.querySelectorAll('style[data-screenshot-prevention]');
    customStyles.forEach(style => style.remove());

    // Restore text selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }
}

/**
 * Mobile-specific screenshot prevention
 */
export class MobileScreenshotPrevention {
  private config: ScreenshotPreventionConfig;
  private isActive = false;

  constructor(config: ScreenshotPreventionConfig) {
    this.config = config;
  }

  activate(): void {
    if (this.isActive) return;
    this.isActive = true;

    this.preventMobileScreenshots();
    this.detectScreenRecording();
  }

  deactivate(): void {
    this.isActive = false;
  }

  private preventMobileScreenshots(): void {
    // Prevent screenshot on iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          this.config.onViolationDetected('screenshot');
        }
      });
    }

    // Prevent screenshot on Android
    if (/Android/.test(navigator.userAgent)) {
      let volumeDownPressed = false;
      let powerButtonPressed = false;

      document.addEventListener('keydown', (e) => {
        if (e.key === 'VolumeDown') volumeDownPressed = true;
        if (e.key === 'Power') powerButtonPressed = true;

        if (volumeDownPressed && powerButtonPressed) {
          this.config.onViolationDetected('screenshot');
        }
      });

      document.addEventListener('keyup', (e) => {
        if (e.key === 'VolumeDown') volumeDownPressed = false;
        if (e.key === 'Power') powerButtonPressed = false;
      });
    }
  }

  private detectScreenRecording(): void {
    // Monitor for screen recording indicators
    if ('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices) {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      
      navigator.mediaDevices.getDisplayMedia = async (...args) => {
        this.config.onViolationDetected('screenshot');
        return originalGetDisplayMedia.apply(navigator.mediaDevices, args);
      };
    }
  }
}

/**
 * Utility function to detect if user is on mobile device
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Main function to initialize screenshot prevention
 */
export const initializeScreenshotPrevention = (config: ScreenshotPreventionConfig) => {
  const prevention = isMobileDevice() 
    ? new MobileScreenshotPrevention(config)
    : new ScreenshotPrevention(config);

  prevention.activate();

  return {
    deactivate: () => prevention.deactivate(),
    isActive: () => prevention instanceof ScreenshotPrevention ? prevention['isActive'] : prevention['isActive']
  };
};