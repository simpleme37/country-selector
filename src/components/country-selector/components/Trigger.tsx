import { useCountrySelectorContext } from '../context/CountrySelectorContext';
import clsx from 'clsx';
import React from 'react';

/**
 * Trigger 的 Props
 */
export interface TriggerProps {
    children?: React.ReactNode; // 可選：自訂的 input 或 button
    className?: string;
    placeholder?: string;
}

/**
 * Trigger 組件
 *
 * 兩種模式：
 * 1. 無 children：渲染預設按鈕
 * 2. 有 children：將 props 注入到自訂元素
 */
export function Trigger({ children, className, placeholder }: TriggerProps) {
    const {
        isOpen,
        setIsOpen,
        disabled,
        displayTriggerText,
        selectedCountry,
        label,
        required,
        searchInput,
        setSearchInput,
        getFirstCountry,
        handleSelectCountry,
    } = useCountrySelectorContext();

    // ==========================================
    // 模式 1：有 children（自訂 Trigger）
    // ==========================================
    if (children) {
        if (!React.isValidElement(children)) {
            console.warn('CountrySelector.Trigger: children 必須是有效的 React 元素');
            return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const childProps = children.props as any;

        // 決定顯示的值：
        // 1. 如果下拉選單打開且有搜尋輸入，顯示搜尋輸入
        // 2. 否則顯示已選擇的國家名稱
        const displayValue = isOpen && searchInput ? searchInput : displayTriggerText;

        // 注入 props 到 children
        const injectedProps = {
            value: displayValue,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchInput(e.target.value);
                if (childProps.onChange) {
                    childProps.onChange(e);
                }
            },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (!disabled) {
                    setIsOpen(true);
                }
                if (childProps.onFocus) {
                    childProps.onFocus(e);
                }
            },
            onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                setTimeout(() => {
                    if (searchInput.trim()) {
                        const firstCountry = getFirstCountry();
                        if (firstCountry) {
                            handleSelectCountry(firstCountry);
                        }
                    }
                }, 200);
                if (childProps.onBlur) {
                    childProps.onBlur(e);
                }
            },
            onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                    if (searchInput.trim()) {
                        const firstCountry = getFirstCountry();
                        if (firstCountry) {
                            handleSelectCountry(firstCountry);
                            setIsOpen(false);
                            setSearchInput('');
                        }
                    }
                } else if (e.key === 'Escape') {
                    setSearchInput('');
                    setIsOpen(false);
                }
                if (childProps.onKeyDown) {
                    childProps.onKeyDown(e);
                }
            },
            disabled,
            className: clsx(childProps.className, className),
        };

        return React.cloneElement(children, injectedProps);
    }

    // ==========================================
    // 模式 2：無 children（預設按鈕）
    // ==========================================
    // 有選中的國家 → 顯示國家名稱
    // 沒有選中 → 顯示 placeholder 或預設文字
    const displayText = selectedCountry ? displayTriggerText : placeholder || displayTriggerText;

    return (
        <>
            {/* Label */}
            {label && (
                <label htmlFor="country-selector-trigger" className="country-selector__label">
                    {label}
                    {required && <span>*</span>}
                </label>
            )}

            {/* 預設按鈕 */}
            <button
                id="country-selector-trigger"
                type="button"
                className={clsx(
                    'country-selector__trigger',
                    {
                        'country-selector__trigger--open': isOpen,
                    },
                    className
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={label || '選擇國家'}
                aria-required={required}
                disabled={disabled}
            >
                <span
                    className={clsx('country-selector__trigger-text', {
                        'country-selector__trigger-text--placeholder': !selectedCountry,
                    })}
                >
                    {displayText}
                </span>
                <span
                    className={clsx('country-selector__trigger-arrow', {
                        'country-selector__trigger-arrow--up': isOpen,
                    })}
                >
                    ▼
                </span>
            </button>
        </>
    );
}
