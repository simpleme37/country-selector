import { useState, useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import countriesData from '../../data/countries.zhTW.full.json';
import type { Country, CountrySelectorProps } from './types/country-selector';
import type { CountriesData } from './types/country-selector';
import { sortCountries, groupCountriesByLetter, highlightMatch } from './utils/countryUtils';

import {
    MagnifyingGlassIcon,
    InfoCircleIcon,
    CrossCircleReverseIcon,
} from '@lion-libs/react-icons';
import './country-selector.scss';

/**
 * 國家選擇器元件
 * 支援電話國碼和國籍兩種模式
 */
export default function CountrySelector({
    type,
    value,
    defaultValue,
    onChange,
    placeholder,
    searchPlaceholder = '',
    hintText = '',
    label,
    disabled = false,
    className = '',
}: CountrySelectorProps) {
    // ==========================================
    // State 管理
    // ==========================================
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [selected, setSelected] = useState<Country | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null); // 用於偵測點擊外部
    const selectedItemRef = useRef<HTMLLIElement>(null); // 用於捲動至選中項目

    // ==========================================
    // 資料處理
    // ==========================================

    // 載入國家資料（熱門列表 + 完整列表）
    const { hotList, normalList } = useMemo(() => {
        const data = countriesData as CountriesData;
        return {
            hotList: data.mobileCodeList.hotList,
            normalList: data.mobileCodeList.list,
        };
    }, []);

    // 合併所有國家（用於 defaultValue/value 查找）
    const allCountriesCombined = useMemo(() => {
        return [...hotList, ...normalList];
    }, [hotList, normalList]);

    // 過濾、排序、分組處理（用於渲染）
    const displayCountries = useMemo(() => {
        // 有搜尋詞時：過濾並排序
        const exactMatches: Country[] = [];
        const partialMatches: Country[] = [];

        if (searchInput.trim()) {
            const searchLower = searchInput.toLowerCase();

            normalList.forEach((country) => {
                // 檢查完全匹配 (任一欄位)
                const isExactMatch =
                    country.code === searchInput ||
                    country.zhName.toLowerCase() === searchLower ||
                    country.enName.toLowerCase() === searchLower ||
                    country.shortName.toLowerCase() === searchLower;

                if (isExactMatch) {
                    exactMatches.push(country);
                }

                // 檢查部分匹配 (任一欄位包含)
                else if (
                    country.code.includes(searchInput) ||
                    country.zhName.toLowerCase().includes(searchLower) ||
                    country.enName.toLowerCase().includes(searchLower) ||
                    country.shortName.toLowerCase().includes(searchLower)
                ) {
                    partialMatches.push(country);
                }
            });

            // 合併：完全匹配優先
            const combined = [...sortCountries(exactMatches), ...sortCountries(partialMatches)];
            return groupCountriesByLetter(combined);
        }

        // 無搜尋時：直接排序、分組
        return groupCountriesByLetter(sortCountries(normalList));
    }, [normalList, searchInput]);

    // 渲染配置（控制 UI 顯示邏輯）
    const renderConfig = useMemo(() => {
        const hasSearch = searchInput.trim() !== '';
        const hasResult = Object.keys(displayCountries).length > 0;

        return {
            showHotList: !hasSearch, // 有搜尋時隱藏熱門列表
            showGroupLetter: !hasSearch, // 有搜尋時隱藏字母分組標題
            showNoResult: hasSearch && !hasResult, // 顯示「無結果」提示
        };
    }, [searchInput, displayCountries]);

    // ==========================================
    // 受控/非受控模式處理
    // ==========================================

    // 非受控模式：初始化 defaultValue
    useEffect(() => {
        if (value !== undefined) return; // 受控模式優先

        if (defaultValue && allCountriesCombined.length > 0) {
            const foundCountry = allCountriesCombined.find(
                (c) => c.code === defaultValue || c.shortName === defaultValue
            );
            if (foundCountry) {
                setSelected(foundCountry);
            }
        }
    }, [defaultValue, allCountriesCombined, value]);

    // 受控模式：同步 value 到 selected
    useEffect(() => {
        if (value !== undefined && allCountriesCombined.length > 0) {
            const foundCountry = allCountriesCombined.find(
                (c) => c.code === value || c.shortName === value
            );
            setSelected(foundCountry || null);
        }
    }, [value, allCountriesCombined]);

    // 當選單打開時，捲動至選中項目（置於可視範圍上方）
    useEffect(() => {
        if (isDropdownOpen && selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({
                behavior: 'auto',
                block: 'start', // 將項目置於可視範圍頂部
            });
        }
    }, [isDropdownOpen]);

    // 搜尋輸入時，使用 debounce 觸發 loading
    useEffect(() => {
        if (searchInput.trim()) {
            // 開始 loading
            setIsLoading(true);

            // Debounce 500ms - 等待用戶停止輸入後才結束 loading
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 500);

            return () => clearTimeout(timer);
        } else {
            // 清空搜尋時，立刻停止 loading
            setIsLoading(false);
        }
    }, [searchInput]);

    // ==========================================
    // UI 文字計算
    // ==========================================

    // 按鈕顯示文字（優先順序：selected > placeholder > 預設）
    const displayText = useMemo(() => {
        if (selected) {
            return type === 'dialCode'
                ? `+${selected.code}`
                : `${selected.zhName} ${selected.enName} (${selected.shortName})`;
        }
        if (placeholder) {
            return placeholder;
        }
        return type === 'dialCode' ? '請選擇國碼' : '請選擇國籍';
    }, [selected, placeholder, type]);

    // 提示文字（優先順序：hintText > 預設）
    const computedHintText = useMemo(() => {
        if (hintText) return hintText;
        return type === 'dialCode' ? '非台灣號碼無法接收簡訊，我們將以e-mail與您聯繫' : '';
    }, [hintText, type]);

    // 搜尋框 placeholder（優先順序：searchPlaceholder > 預設）
    const computedSearchPlaceholder = useMemo(() => {
        return searchPlaceholder || (type === 'dialCode' ? '請輸入國家/國碼' : '請輸入國家');
    }, [searchPlaceholder, type]);

    // ==========================================
    // 事件處理
    // ==========================================

    // 統一的選擇處理（觸發 onChange 回調）
    const handleSelectCountry = (country: Country | null) => {
        setSelected(country);
        onChange?.(country);
    };

    // 取得當前搜尋結果的第一筆
    const getFirstCountry = (): Country | null => {
        const letters = Object.keys(displayCountries).sort();
        if (letters.length === 0) return null;
        return displayCountries[letters[0]][0];
    };

    // 鍵盤事件處理
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            // Enter：選擇第一筆結果
            if (searchInput.trim()) {
                const firstCountry = getFirstCountry();
                if (firstCountry) {
                    handleSelectCountry(firstCountry);
                    setIsDropdownOpen(false);
                    setSearchInput('');
                }
            }
        } else if (e.key === 'Escape') {
            // Escape：取消搜尋並關閉選單
            setSearchInput('');
            setIsDropdownOpen(false);
        }
    };

    // 失焦事件處理
    const handleSearchBlur = () => {
        setTimeout(() => {
            // Blur：選擇第一筆結果（延遲避免與 onClick 衝突）
            if (searchInput.trim()) {
                const firstCountry = getFirstCountry();
                if (firstCountry) {
                    handleSelectCountry(firstCountry);
                }
            }
        }, 200);
    };

    // 點擊外部關閉選單
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
                setSearchInput(''); // 清空搜尋但保留 selected
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <div
            ref={containerRef}
            className={clsx('country-selector', className, {
                'country-selector--open': isDropdownOpen,
                'country-selector--disabled': disabled,
            })}
        >
            {/* Label（可選） */}
            {label && (
                <label htmlFor="selector" className="country-selector__label">
                    {label}
                    <span>*</span>
                </label>
            )}

            {/* 選單按鈕 */}
            <button
                id="selector"
                type="button"
                className="country-selector__trigger"
                onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-label={label || (type === 'dialCode' ? '選擇國碼' : '選擇國籍')}
            >
                {/* 按鈕文字 */}
                <span
                    className={clsx('country-selector__trigger-text', {
                        'country-selector__trigger-text--placeholder': !selected,
                    })}
                >
                    {displayText}
                </span>
                {/* 箭頭圖示 */}
                <span
                    className={clsx('country-selector__trigger-arrow', {
                        'country-selector__trigger-arrow--up': isDropdownOpen,
                    })}
                >
                    ▼
                </span>
            </button>

            {isDropdownOpen && (
                <div className="country-selector__dropdown">
                    {/* 搜尋框上方提示文字 */}
                    {computedHintText && (
                        <div className="country-selector__hint">
                            <InfoCircleIcon />
                            {computedHintText}
                        </div>
                    )}

                    {/* 搜尋輸入框 */}
                    <div className="country-selector__search">
                        <input
                            type="text"
                            className="country-selector__search-input"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            onBlur={handleSearchBlur}
                            placeholder={computedSearchPlaceholder}
                            autoFocus
                        />

                        {/* 輸入框有值時，顯示清除 icon；沒有值時，顯示搜尋 icon */}
                        {searchInput ? (
                            <CrossCircleReverseIcon
                                className="clear-icon"
                                onClick={() => setSearchInput('')}
                            ></CrossCircleReverseIcon>
                        ) : (
                            <MagnifyingGlassIcon className="search-icon"></MagnifyingGlassIcon>
                        )}
                    </div>

                    {/* 國家選單 */}
                    <ul
                        className={clsx('country-selector__list', {
                            'country-selector--loading': isLoading,
                        })}
                        role="listbox"
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setIsDropdownOpen(false);
                                setSearchInput('');
                            }
                        }}
                    >
                        {/* Loading 時期顯示 */}
                        {isLoading ? (
                            <li className="country-selector__list-item country-selector__list-item--loading">
                                <span className="country-selector__loading-spinner">⏳</span>
                                Loading...
                            </li>
                        ) : renderConfig.showNoResult ? (
                            <li className="country-selector__list-item country-selector__list-item--empty">
                                很抱歉，找不到符合的項目!
                            </li>
                        ) : (
                            <>
                                {/* 熱門列表 */}
                                {renderConfig.showHotList && (
                                    <>
                                        <p className="country-selector__list-title">
                                            常用國家 / 地區
                                        </p>
                                        {hotList.map((country) => (
                                            <li
                                                key={country.id}
                                                className={clsx(
                                                    'country-selector__list-item',
                                                    'country-selector__list-item--hot',
                                                    {
                                                        'country-selector__list-item--selected':
                                                            selected?.id === country.id,
                                                    }
                                                )}
                                                onClick={() => {
                                                    handleSelectCountry(country);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {type === 'dialCode' ? (
                                                    // 電話國碼模式
                                                    <>
                                                        <div className="country-selector__list-item-content">
                                                            {country.zhName}
                                                            {country.enName} ({country.shortName})
                                                        </div>
                                                        <span className="country-selector__list-item-code">
                                                            +{country.code}
                                                        </span>
                                                    </>
                                                ) : (
                                                    // 國籍模式
                                                    <>
                                                        <div className="country-selector__list-item-content">
                                                            {country.zhName} {country.enName} (
                                                            {country.shortName})
                                                        </div>
                                                    </>
                                                )}
                                            </li>
                                        ))}
                                    </>
                                )}

                                {/* 一般列表 */}
                                {Object.entries(displayCountries)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([letter, countries]) => (
                                        <div key={letter}>
                                            {renderConfig.showGroupLetter && (
                                                <p className="country-selector__list-letter">
                                                    {letter}
                                                </p>
                                            )}
                                            {countries.map((country) => (
                                                <li
                                                    key={country.id}
                                                    ref={
                                                        selected?.id === country.id
                                                            ? selectedItemRef
                                                            : null
                                                    }
                                                    className={clsx('country-selector__list-item', {
                                                        'country-selector__list-item--selected':
                                                            selected?.id === country.id,
                                                    })}
                                                    onClick={() => {
                                                        handleSelectCountry(country);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                >
                                                    {type === 'dialCode' ? (
                                                        // 電話國碼模式
                                                        <>
                                                            <div className="country-selector__list-item-name">
                                                                {highlightMatch(
                                                                    country.zhName,
                                                                    searchInput
                                                                )}{' '}
                                                                {highlightMatch(
                                                                    country.enName,
                                                                    searchInput
                                                                )}{' '}
                                                                (
                                                                {highlightMatch(
                                                                    country.shortName,
                                                                    searchInput
                                                                )}
                                                                )
                                                            </div>
                                                            <span className="country-selector__list-item-code">
                                                                +
                                                                {highlightMatch(
                                                                    country.code,
                                                                    searchInput
                                                                )}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        // 國籍模式
                                                        <>
                                                            <span className="country-selector__list-item-content">
                                                                {highlightMatch(
                                                                    country.zhName,
                                                                    searchInput
                                                                )}{' '}
                                                                {highlightMatch(
                                                                    country.enName,
                                                                    searchInput
                                                                )}{' '}
                                                                (
                                                                {highlightMatch(
                                                                    country.shortName,
                                                                    searchInput
                                                                )}
                                                                )
                                                            </span>
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                        </div>
                                    ))}
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
