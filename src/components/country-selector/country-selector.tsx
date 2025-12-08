import { useState, useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import type { Country, CountrySelectorProps } from './types/country-selector';
import type { CountriesData } from './types/country-selector';
import countriesData from '../../data/countries.zhTW.full.json';
import './country-selector.scss';

/**
 * 國家選擇器元件
 * 支援電話國碼和國籍兩種模式
 */
export default function CountrySelector({
    type,
    value,
    defaultValue,
    // onChange,  // TODO:
    placeholder,
    searchPlaceholder = '搜尋國家',
    hintText = '非台灣號碼無法接收簡訊，我們將以e-mail與您聯繫',
    label,
    disabled = false,
    className = '',
}: CountrySelectorProps) {
    // === State 定義 ===
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [selected, setSelected] = useState<Country | null>(null);

    // Ref 用於點擊外部關閉下拉選單
    const containerRef = useRef<HTMLDivElement>(null);

    // === 載入國家資料 ===
    const { hotList, allCountries } = useMemo(() => {
        const data = countriesData as CountriesData;
        return {
            hotList: data.mobileCodeList.hotList,
            allCountries: data.mobileCodeList.list,
        };
    }, []);

    // 合併所有國家（用於搜尋和 defaultValue 查找）
    const allCountriesCombined = useMemo(() => {
        return [...hotList, ...allCountries];
    }, [hotList, allCountries]);

    // === 初始化 defaultValue ===
    useEffect(() => {
        // 受控元件優先使用 value
        if (value !== undefined) {
            return;
        }

        // 非受控元件使用 defaultValue
        if (defaultValue && allCountriesCombined.length > 0) {
            // 可能是國碼（如 '886'）或國家代碼（如 'TW'）
            const foundCountry = allCountriesCombined.find(
                (c) => c.code === defaultValue || c.shortName === defaultValue
            );

            if (foundCountry) {
                setSelected(foundCountry);
            }
        }
    }, [defaultValue, allCountriesCombined, value]);

    // === 受控 / 非受控模式處理 ===
    // 受控元件：根據 value 找到對應的國家
    useEffect(() => {
        if (value !== undefined && allCountriesCombined.length > 0) {
            const foundCountry = allCountriesCombined.find(
                (c) => c.code === value || c.shortName === value
            );
            setSelected(foundCountry || null);
        }
    }, [value, allCountriesCombined]);

    // === 計算 UI 文字 ===
    // 顯示格式化的按鈕文字
    const getDisplayText = (): string => {
        // 優先順序：
        // 1. 有選中的國家 → 顯示格式化的國家資訊
        if (selected) {
            return type === 'dialCode'
                ? `+${selected.code}` // dialCode 模式：+886
                : `${selected.zhName} (${selected.shortName})`; // nationality 模式：台灣 (TW)
        }

        // 2. 沒選中但有 placeholder → 顯示自訂 placeholder
        if (placeholder) {
            return placeholder;
        }

        // 3. 都沒有 → 顯示預設提示文字
        return type === 'dialCode' ? '請選擇國碼' : '請選擇國籍';
    };

    // TODO: 實作搜尋過濾邏輯

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
                <span className="country-selector__trigger-text">{getDisplayText()}</span>
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
                    {hintText && (
                        <div className="country-selector__hint">
                            <i className="fa-solid fa-info"></i> {hintText}
                        </div>
                    )}

                    {/* 搜尋輸入框 */}
                    <div className="country-selector__search">
                        <input
                            type="text"
                            className="country-selector__search-input"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            // TODO: 事件處理
                            // onBlur={}
                            // onKeyDown={}
                            placeholder={searchPlaceholder}
                            autoFocus
                        />
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </div>

                    {/* 國家列表 */}
                    <ul className="country-selector__list" role="listbox">
                        {allCountriesCombined.length === 0 ? (
                            <li className="country-selector__list-item">載入中...</li>
                        ) : (
                            <>
                                {/* 熱門列表 */}
                                <p className="country-selector__list-title">常用國家 / 地區</p>
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
                                            setSelected(country);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {type === 'dialCode' ? (
                                            <>
                                                <div>
                                                    <span>{country.zhName}</span>
                                                    <span>{`(${country.enName})`}</span>
                                                </div>
                                                <span className="country-selector__list-item--code">
                                                    +{country.code}
                                                </span>
                                            </>
                                        ) : (
                                            `${country.zhName} (${country.shortName})`
                                        )}
                                    </li>
                                ))}

                                {/* 一般列表 */}
                                <p className="country-selector__list-title">一般國家 / 地區</p>
                                {allCountries.map((country) => (
                                    <li
                                        key={country.id}
                                        className={clsx('country-selector__list-item', {
                                            'country-selector__list-item--selected':
                                                selected?.id === country.id,
                                        })}
                                        onClick={() => {
                                            setSelected(country);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {type === 'dialCode'
                                            ? `+${country.code} ${country.zhName}`
                                            : `${country.zhName} (${country.shortName})`}
                                    </li>
                                ))}
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
