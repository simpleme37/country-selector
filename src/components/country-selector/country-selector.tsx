import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import clsx from 'clsx';
import countriesData from '../../data/countries.zhTW.full.json';
import CountryListItem from './CountryListItem';
import type { Country, CountrySelectorProps } from './types/country-selector';
import type { CountriesData } from './types/country-selector';
import { useDropdownPosition } from './hook/useDropdownPosition';
import { filterAndGroupCountries } from './utils/countryUtils';
import {
    MagnifyingGlassIcon,
    InfoCircleIcon,
    CrossCircleReverseIcon,
} from '@lion-libs/react-icons';
import './styles/index.scss';

/**
 * 國家選擇器元件
 * 支援電話國碼和國籍兩種模式
 */
export default function CountrySelector({
    type,
    value,
    defaultValue,
    onChange,
    label,
    name,
    required = false,
    placeholder,
    searchPlaceholder,
    dropdownHint,
    disabled = false,
    className,
}: CountrySelectorProps) {
    // ==========================================
    // State 管理
    // ==========================================
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null); // 用於偵測點擊外部
    const selectedItemRef = useRef<HTMLLIElement>(null); // 用於捲動至選中項目

    const { position: dropdownPosition, maxHeight: dropdownMaxHeight } = useDropdownPosition(
        isDropdownOpen,
        containerRef
    );

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

    // ==========================================
    // 受控與非受控模式值的管理
    // ==========================================
    const isControlled = value !== undefined;
    // 只有非受控時會用到
    const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
    // 真正「現在選到什麼」
    const selectedValue = isControlled ? value : internalValue;
    const selectedCountry = useMemo(() => {
        if (!selectedValue) return null;
        return (
            allCountriesCombined.find(
                (c) => c.code === selectedValue || c.shortName === selectedValue
            ) ?? null
        );
    }, [selectedValue, allCountriesCombined]);

    // 過濾、排序、分組處理（用於渲染）
    const displayCountries = useMemo(
        () => filterAndGroupCountries(normalList, searchInput),
        [normalList, searchInput]
    );

    // 渲染設定（控制 UI 顯示邏輯）
    const renderConfig = useMemo(() => {
        const hasSearch = searchInput.trim() !== '';
        const hasResult = Object.keys(displayCountries).length > 0;

        return {
            showHotList: !hasSearch, // 有搜尋時隱藏熱門列表
            showGroupLetter: !hasSearch, // 有搜尋時隱藏字母分組標題
            showNoResult: hasSearch && !hasResult, // 顯示「無結果」提示
        };
    }, [searchInput, displayCountries]);

    // 當選單打開且往下展開時，捲動至選中項目
    useEffect(() => {
        if (isDropdownOpen && dropdownPosition === 'bottom' && selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({
                behavior: 'auto',
                block: 'start',
            });
        }
    }, [isDropdownOpen, dropdownPosition]);

    // 搜尋輸入時，使用 debounce 觸發 loading
    useEffect(() => {
        if (searchInput.trim()) {
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

    // 按鈕顯示文字（優先順序：selectedCountry > placeholder > 預設）
    const displayTriggerText = useMemo(() => {
        if (selectedCountry) {
            return type === 'dialCode'
                ? `+${selectedCountry.code}`
                : `${selectedCountry.zhName} ${selectedCountry.enName} (${selectedCountry.shortName})`;
        }
        if (placeholder) {
            return placeholder;
        }
        return type === 'dialCode' ? '請選擇國碼' : '請選擇國籍';
    }, [selectedCountry, placeholder, type]);

    // 提示文字（優先順序：dropdownHint > 預設）
    const displayDropdownHint = useMemo(() => {
        if (dropdownHint) return dropdownHint;
        return type === 'dialCode' ? '非台灣號碼無法接收簡訊，我們將以e-mail與您聯繫' : '';
    }, [dropdownHint, type]);

    // 搜尋框 placeholder（優先順序：searchPlaceholder > 預設）
    const displaySearchPlaceholder = useMemo(() => {
        return searchPlaceholder || (type === 'dialCode' ? '請輸入國家/國碼' : '請輸入國家');
    }, [searchPlaceholder, type]);

    // ==========================================
    // 事件處理
    // ==========================================

    // 取得當前搜尋結果的第一筆
    const getFirstCountry = useCallback((): Country | null => {
        const letters = Object.keys(displayCountries).sort();
        if (letters.length === 0) return null;
        return displayCountries[letters[0]][0];
    }, [displayCountries]);

    // 統一的選擇處理（觸發 onChange 回調）
    const handleSelectCountry = useCallback(
        (country: Country | null) => {
            if (country) {
                if (!isControlled) {
                    setInternalValue(type === 'dialCode' ? country.code : country.shortName);
                }
                onChange?.(country);
            }
            setIsDropdownOpen(false);
            setSearchInput('');
        },
        [isControlled, type, onChange]
    );

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
                // 如果有搜尋內容，選擇第一筆結果
                if (searchInput.trim()) {
                    const firstCountry = getFirstCountry();
                    if (firstCountry) {
                        handleSelectCountry(firstCountry);
                    }
                }
                setIsDropdownOpen(false);
                setSearchInput(''); // 清空搜尋
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen, searchInput, getFirstCountry, handleSelectCountry]);

    return (
        <div
            ref={containerRef}
            className={clsx('country-selector', className, {
                'country-selector--open': isDropdownOpen,
                'country-selector--disabled': disabled,
            })}
        >
            {/* 標籤*/}
            {label && (
                <label htmlFor="selector" className="country-selector__label">
                    {label}
                    {required && <span>*</span>}
                </label>
            )}

            {/* Hidden input 用於表單提交 */}
            {name && <input type="hidden" name={name} value={selectedValue || ''} />}

            {/* 選單按鈕 */}
            <button
                id="selector"
                type="button"
                className={clsx('country-selector__trigger', {
                    'country-selector__trigger--open': isDropdownOpen,
                })}
                onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-label={label || (type === 'dialCode' ? '選擇國碼' : '選擇國籍')}
                aria-required={required}
            >
                {/* 按鈕文字 */}
                <span
                    className={clsx('country-selector__trigger-text', {
                        'country-selector__trigger-text--placeholder': !selectedCountry,
                    })}
                >
                    {displayTriggerText}
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
                <div
                    className={clsx('country-selector__dropdown', {
                        'country-selector__dropdown--top': dropdownPosition === 'top',
                    })}
                    style={{ maxHeight: `${dropdownMaxHeight}px` }}
                >
                    {/* 搜尋框上方提示文字 */}
                    {displayDropdownHint && (
                        <div className="country-selector__hint">
                            <InfoCircleIcon />
                            {displayDropdownHint}
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
                            placeholder={displaySearchPlaceholder}
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
                        style={{ maxHeight: `${dropdownMaxHeight - 100}px` }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setIsDropdownOpen(false);
                                setSearchInput('');
                            }
                        }}
                    >
                        {/* Loading 時顯示 */}
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
                                            <CountryListItem
                                                key={country.id}
                                                country={country}
                                                type={type}
                                                searchInput={searchInput}
                                                isSelected={selectedCountry?.id === country.id}
                                                isHot
                                                onClick={() => handleSelectCountry(country)}
                                            />
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
                                                <CountryListItem
                                                    key={country.id}
                                                    country={country}
                                                    type={type}
                                                    searchInput={searchInput}
                                                    isSelected={selectedCountry?.id === country.id}
                                                    onClick={() => handleSelectCountry(country)}
                                                    itemRef={
                                                        selectedCountry?.id === country.id
                                                            ? selectedItemRef
                                                            : undefined
                                                    }
                                                />
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
