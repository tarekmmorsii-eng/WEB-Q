import React, { useState, useRef, useEffect } from 'react';
import { BUTTON_CONFIGS } from '../constants';
import { ViewMode } from '../types';
import { Translations } from '../i18n/translations';
import clsx from 'clsx';
import {
  ChevronDown,
  Type,
  Octagon,
  Shuffle,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  Files,
  Layout,
  AlignLeft,
  AlignRight,
  Split,
  WholeWord
} from 'lucide-react';

import { useFeedback } from '../contexts/FeedbackContext';
import BetaBadge from './BetaBadge';

interface HeaderProps {
  currentMode: ViewMode;
  setMode: (mode: ViewMode, state?: number) => void;
  toggleState: number;
  isVisible: boolean;
  onInteraction: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  t: Translations;
  isRTL?: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentMode, setMode, toggleState, isVisible, onInteraction, onMouseEnter, onMouseLeave, t, isRTL = false }) => {
  const [openDropdown, setOpenDropdown] = useState<ViewMode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { openFeedback } = useFeedback();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // @ts-ignore - Prevent closing during tour
      if (window.__tourDropdownLock) return;

      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // GLOBAL TOUR HELPER: Allow TourManager to open dropdowns reliably
    // @ts-ignore
    window.openTourDropdown = (mode: string) => {
      console.log('[Tour] openTourDropdown called with:', mode);
      // @ts-ignore - Set lock to prevent immediate close
      window.__tourDropdownLock = true;
      // Cast string to ViewMode
      setOpenDropdown(mode as ViewMode);
      console.log('[Tour] setOpenDropdown called, new value:', mode);
      // Release lock after a short delay
      setTimeout(() => {
        // @ts-ignore
        window.__tourDropdownLock = false;
        console.log('[Tour] Lock released');
      }, 500);
    };

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // @ts-ignore
      delete window.openTourDropdown;
      // @ts-ignore
      delete window.__tourDropdownLock;
    }
  }, []);

  const getSubOptions = (mode: ViewMode) => {
    switch (mode) {
      case ViewMode.TOGGLE_LAST_WORD:
        return [
          { label: t.hideLastWord, state: 0, icon: AlignLeft },
          { label: t.showLastWord, state: 1, icon: AlignLeft },
        ];
      case ViewMode.TOGGLE_FIRST_WORD:
        return [
          { label: t.hideFirstWord, state: 0, icon: AlignRight },
          { label: t.showFirstWord, state: 1, icon: AlignRight },
        ];
      case ViewMode.HIDE_RANDOM_WORDS:
        return [
          { label: t.hideRandomWords, state: 0, icon: Shuffle },
          { label: t.allWords, state: 1, icon: WholeWord },
        ];
      case ViewMode.HIDE_RANDOM_AYAHS:
        return [
          { label: t.hideRandomAyahs, state: 0, icon: Shuffle },
          { label: '', state: 1, color: 'bg-red-500' },
          { label: '', state: 2, color: 'bg-yellow-500' },
          { label: '', state: 3, color: 'bg-green-500' },
          { label: t.notMemorizedAyahsHidden, state: 4, icon: HelpCircle },
        ];
      case ViewMode.HIDE_ALL_AYAHS:
        return [
          { label: t.ayahs, state: 0, icon: Files },
          { label: t.stopSignsLabel, state: 1, icon: Octagon },
        ];
      default:
        return [];
    }
  };

  const handleButtonClick = (mode: ViewMode) => {
    onInteraction(); // Trigger audio close via App-level interaction handler
    if (mode === ViewMode.SHOW_ALL) {
      setMode(mode);
      setOpenDropdown(null);
      return;
    }
    setOpenDropdown(openDropdown === mode ? null : mode);
  };

  const handleOptionClick = (mode: ViewMode, state: number) => {
    setMode(mode, state);
    setOpenDropdown(null);
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 bg-[var(--bg-card)] shadow-md border-b border-[var(--border-primary)] transition-all duration-500 ease-in-out",
        isRTL ? "lg:left-20" : "lg:right-20",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
      onTouchStart={onInteraction}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="grid grid-cols-6 gap-1 p-2 max-w-4xl mx-auto">
        {/* Beta Badge - Absolute Left on Desktop (RTL: right), Relative on Mobile */}
        <div className={clsx("absolute top-1/2 -translate-y-1/2 hidden lg:block", isRTL ? "right-4" : "left-4")}>
          <BetaBadge onClick={() => openFeedback('bug_tech')} />
        </div>

        {/* Mobile Beta Badge (Small) */}
        <div className={clsx("lg:hidden absolute top-2 z-50", isRTL ? "right-2" : "left-2")}>
          <BetaBadge className="scale-75 origin-top-left" onClick={() => openFeedback('bug_tech')} />
        </div>

        {BUTTON_CONFIGS.map((config) => {
          const isActive = currentMode === config.mode;
          const isOpen = openDropdown === config.mode;
          const Icon = config.icon;
          const options = getSubOptions(config.mode);

          return (
            <div
              key={config.mode}
              id={`tour-wrapper-${config.mode}`}
              className="relative flex flex-col"
            >
              <button
                id={`tour-btn-${config.mode}`}
                onClick={() => handleButtonClick(config.mode)}
                className={clsx(
                  "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 w-full",
                  "h-16",
                  isActive
                    ? "text-amber-600 dark:text-amber-500 scale-105"
                    : "text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 group"
                )}
              >
                <Icon size={18} className={clsx("mb-1 transition-transform", !isActive && "group-hover:scale-110")} />
                <span className="text-[10px] font-bold leading-tight text-center">
                  {config.mode === ViewMode.SHOW_ALL ? t.showAll :
                    config.mode === ViewMode.HIDE_ALL_AYAHS ? t.hideAll :
                      config.mode === ViewMode.HIDE_RANDOM_AYAHS ? t.hideAyahs :
                        config.mode === ViewMode.HIDE_RANDOM_WORDS ? t.hideWords :
                          config.mode === ViewMode.TOGGLE_FIRST_WORD ? t.toggleFirstWord :
                            t.toggleLastWord}
                </span>
                {options.length > 0 && <ChevronDown size={10} className={clsx("transition-transform", isOpen && "rotate-180")} />}
              </button>

              {/* Dropdown Menu (Stack) */}
              {isOpen && options.length > 0 && (
                <div
                  id={`tour-dropdown-${config.mode}`}
                  className="absolute top-16 left-0 right-0 z-[100000005] mt-1 flex flex-col gap-1.5 bg-[var(--bg-card)] bg-opacity-95 backdrop-blur-sm p-1.5 rounded-xl shadow-2xl border border-[var(--border-primary)] animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {options.map((opt) => (
                    <button
                      key={opt.state}
                      onClick={() => handleOptionClick(config.mode, opt.state)}
                      className={clsx(
                        "w-full flex flex-col items-center justify-center rounded-lg transition-all duration-200",
                        "h-16 p-1",
                        isActive && toggleState === opt.state
                          ? "text-amber-600 dark:text-amber-500 scale-105"
                          : "text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400"
                      )}
                    >
                      {opt.color ? (
                        <div className={clsx("w-6 h-6 rounded-full shadow-sm ring-2 ring-white/20", opt.color)} />
                      ) : (
                        <>
                          {opt.icon && <opt.icon size={16} className="mb-1 opacity-80" />}
                          <span className="text-[8px] font-bold leading-tight text-center">
                            {opt.label}
                          </span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Header;