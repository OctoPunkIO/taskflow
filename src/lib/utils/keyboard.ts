import type { Task, TaskStatus } from '$lib/types';

/**
 * Keyboard shortcut definitions for the task board
 */
export const KEYBOARD_SHORTCUTS = {
  // Navigation
  NEXT_TASK: ['j', 'ArrowDown'],
  PREV_TASK: ['k', 'ArrowUp'],
  OPEN_TASK: ['Enter', ' '],
  
  // Actions
  NEW_TASK: ['n'],
  EDIT_TASK: ['e'],
  DELETE_TASK: ['d'],
  
  // Status changes
  SET_TODO: ['1'],
  SET_IN_PROGRESS: ['2'], 
  SET_IN_REVIEW: ['3'],
  SET_DONE: ['4'],
  
  // Global
  QUICK_SEARCH: ['cmd+k', 'ctrl+k'],
  ESCAPE: ['Escape'],
} as const;

/**
 * Maps keyboard shortcuts to task statuses
 */
export const STATUS_SHORTCUTS: Record<string, TaskStatus> = {
  '1': 'todo',
  '2': 'in_progress', 
  '3': 'in_review',
  '4': 'done'
};

/**
 * Checks if a keyboard event matches any of the given key combinations
 */
export function matchesShortcut(event: KeyboardEvent, shortcuts: readonly string[]): boolean {
  const key = event.key;
  const hasCmd = event.metaKey || event.ctrlKey;
  const hasShift = event.shiftKey;
  const hasAlt = event.altKey;
  
  return shortcuts.some(shortcut => {
    // Handle modifier combinations like 'cmd+k'
    if (shortcut.includes('+')) {
      const parts = shortcut.split('+');
      const modifiers = parts.slice(0, -1);
      const targetKey = parts[parts.length - 1];
      
      const needsCmd = modifiers.includes('cmd') || modifiers.includes('ctrl');
      const needsShift = modifiers.includes('shift');
      const needsAlt = modifiers.includes('alt');
      
      return key.toLowerCase() === targetKey.toLowerCase() &&
        hasCmd === needsCmd &&
        hasShift === needsShift &&
        hasAlt === needsAlt;
    }
    
    // Simple key match
    return key === shortcut;
  });
}

/**
 * Global keyboard event handler for task board shortcuts
 */
export class KeyboardManager {
  private handlers = new Map<string, (event: KeyboardEvent) => void | boolean>();
  private isActive = true;
  
  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }
  
  /**
   * Register a handler for specific keyboard shortcuts
   */
  on(shortcuts: readonly string[], handler: (event: KeyboardEvent) => void | boolean) {
    const key = shortcuts.join(',');
    this.handlers.set(key, handler);
  }
  
  /**
   * Remove a handler
   */
  off(shortcuts: readonly string[]) {
    const key = shortcuts.join(',');
    this.handlers.delete(key);
  }
  
  /**
   * Start listening for keyboard events
   */
  start() {
    this.isActive = true;
    document.addEventListener('keydown', this.handleKeyDown, { capture: true });
  }
  
  /**
   * Stop listening for keyboard events
   */
  stop() {
    this.isActive = false;
    document.removeEventListener('keydown', this.handleKeyDown, { capture: true });
  }
  
  /**
   * Temporarily disable keyboard handling (e.g., when modals are open)
   */
  disable() {
    this.isActive = false;
  }
  
  /**
   * Re-enable keyboard handling
   */
  enable() {
    this.isActive = true;
  }
  
  private handleKeyDown(event: KeyboardEvent) {
    if (!this.isActive) return;
    
    // Don't handle shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    
    // Check each registered handler
    for (const [shortcutKey, handler] of this.handlers) {
      const shortcuts = shortcutKey.split(',');
      if (matchesShortcut(event, shortcuts)) {
        const result = handler(event);
        // If handler returns true, prevent default and stop propagation
        if (result !== false) {
          event.preventDefault();
          event.stopPropagation();
        }
        break;
      }
    }
  }
}

/**
 * Get a human-readable description of keyboard shortcuts for help/tooltips
 */
export function getShortcutDisplay(shortcuts: readonly string[]): string {
  return shortcuts
    .map(shortcut => {
      if (shortcut.includes('+')) {
        return shortcut
          .replace('cmd', '⌘')
          .replace('ctrl', 'Ctrl')
          .replace('shift', '⇧')
          .replace('alt', '⌥')
          .replace('+', ' + ')
          .toUpperCase();
      }
      return shortcut.toUpperCase();
    })
    .join(' or ');
}

/**
 * Default keyboard manager instance
 */
export const keyboardManager = new KeyboardManager();