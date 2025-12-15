import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import countriesData from '../../../data/countries.zhTW.full.json';
import type { CountryList, Country, CountriesData } from '../types/country-selector';
import { useDropdownPosition } from '../hook/useDropdownPosition';
import { filterAndGroupCountries } from '../utils/countryUtils';
import { CountrySelectorContext } from '../context/CountrySelectorContext';
import clsx from 'clsx';

/**
 * Root 的 Props（從原本的 CountrySelectorProps 調整）
 */
export interface RootProps {
    type: 'dialCode' | 'nationality';
    value?: string;
    defaultValue?: string;
    onChange?: (country: Country | null) => void;
    label?: string;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    loading?: boolean;
    dataSource?: CountryList; // 自訂國家資料來源
    className?: string;
    children: React.ReactNode; // 必須包含 Trigger 和 Dropdown
}

/**
 * Root 組件 - 狀態管理和 Context Provider
 */
export function Root({
    type,
    value,
    defaultValue,
    onChange,
    label,
    name,
    required = false,
    disabled = false,
    loading,
    dataSource,
    className,
    children,
}: RootProps) {
    // ==========================================
    // State 管理
    // ==========================================
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [internalLoading, setInternalLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const selectedItemRef = useRef<HTMLLIElement>(null);

    const { position: dropdownPosition, maxHeight: dropdownMaxHeight } = useDropdownPosition(
        isDropdownOpen,
        containerRef
    );

    // ==========================================
    // 資料處理
    // ==========================================
    const { hotList, normalList } = useMemo(() => {
        // 如果外面有給 dataSource 的情況
        const source = dataSource ?? (countriesData as CountriesData).mobileCodeList;

        return {
            hotList: source.hotList,
            normalList: source.list,
        };
    }, [dataSource]);

    const allCountriesCombined = useMemo(() => {
        return [...hotList, ...normalList];
    }, [hotList, normalList]);

    // ==========================================
    // 受控/非受控模式
    // ==========================================
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
    const selectedValue = isControlled ? value : internalValue;

    const selectedCountry = useMemo(() => {
        if (!selectedValue) return null;
        return (
            allCountriesCombined.find(
                (c) => c.code === selectedValue || c.shortName === selectedValue
            ) ?? null
        );
    }, [selectedValue, allCountriesCombined]);

    // 過濾後的國家列表
    const displayCountries = useMemo(
        () => filterAndGroupCountries(normalList, type, searchInput),
        [normalList, type, searchInput]
    );

    // 渲染配置
    const renderConfig = useMemo(() => {
        const hasSearch = searchInput.trim() !== '';
        // 檢查是否有任何分組包含國家資料
        const hasResult = Object.values(displayCountries).some((arr) => arr.length > 0);

        return {
            showHotList: !hasSearch,
            showGroupLetter: !hasSearch,
            showNoResult: hasSearch && !hasResult,
        };
    }, [searchInput, displayCountries]);

    // ==========================================
    // UI 文字計算
    // ==========================================
    const displayTriggerText = useMemo(() => {
        if (selectedCountry) {
            return type === 'dialCode'
                ? `+${selectedCountry.code}`
                : `${selectedCountry.zhName} ${selectedCountry.enName} (${selectedCountry.shortName})`;
        }
        return type === 'dialCode' ? '請選擇國碼' : '請選擇國籍';
    }, [selectedCountry, type]);

    const displaySearchPlaceholder = useMemo(() => {
        return type === 'dialCode' ? '請輸入國家/國碼' : '請輸入國家';
    }, [type]);

    // ==========================================
    // 事件處理
    // ==========================================
    const getFirstCountry = useCallback((): Country | null => {
        const letters = Object.keys(displayCountries).sort();
        if (letters.length === 0) return null;
        return displayCountries[letters[0]][0];
    }, [displayCountries]);

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

    // ==========================================
    // Effects
    // ==========================================
    // 模擬搜尋 loading 狀態（用 setTimeout 模擬 API 延遲）
    useEffect(() => {
        if (loading === undefined) {
            if (searchInput.trim()) {
                setInternalLoading(true);
                const timer = setTimeout(() => {
                    setInternalLoading(false);
                }, 500);
                return () => clearTimeout(timer);
            } else {
                setInternalLoading(false);
            }
        }
    }, [searchInput, loading]);

    // 合併外部與內部 loading 狀態
    useEffect(() => {
        setIsLoading(loading ?? internalLoading);
    }, [internalLoading, loading]);

    // 選單打開時，捲動至選中項目
    useEffect(() => {
        if (isDropdownOpen && selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({
                behavior: 'auto',
                block: 'start',
            });
        }
    }, [isDropdownOpen, dropdownPosition]);

    // 點擊外部關閉選單
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (searchInput.trim()) {
                    const firstCountry = getFirstCountry();
                    if (firstCountry) {
                        handleSelectCountry(firstCountry);
                    }
                }
                setIsDropdownOpen(false);
                setSearchInput('');
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen, searchInput, getFirstCountry, handleSelectCountry]);

    // ==========================================
    // Context Value
    // ==========================================
    const contextValue = useMemo(
        () => ({
            // 基本配置
            type,
            disabled,
            required,
            label,
            name,

            // 狀態
            isOpen: isDropdownOpen,
            searchInput,
            selectedCountry,

            // 資料
            hotList,
            filteredCountries: displayCountries,
            isLoading,

            // UI 控制
            dropdownPosition,
            dropdownMaxHeight,

            // 方法
            setIsOpen: setIsDropdownOpen,
            setSearchInput,
            handleSelectCountry,
            getFirstCountry,

            // Refs
            containerRef,
            selectedItemRef,

            // UI 文字
            displayTriggerText,
            displaySearchPlaceholder,

            // 渲染配置
            renderConfig,
        }),
        [
            type,
            disabled,
            required,
            label,
            name,
            isDropdownOpen,
            searchInput,
            selectedCountry,
            hotList,
            displayCountries,
            isLoading,
            dropdownPosition,
            dropdownMaxHeight,
            getFirstCountry,
            handleSelectCountry,
            displayTriggerText,
            displaySearchPlaceholder,
            renderConfig,
        ]
    );

    // ==========================================
    // Render
    // ==========================================
    return (
        <CountrySelectorContext.Provider value={contextValue}>
            <div
                ref={containerRef}
                className={clsx('country-selector', className, {
                    'country-selector--open': isDropdownOpen,
                    'country-selector--disabled': disabled,
                })}
            >
                {children}
            </div>
        </CountrySelectorContext.Provider>
    );
}
