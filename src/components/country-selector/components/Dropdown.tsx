import { useCountrySelectorContext } from '../context/CountrySelectorContext';
import CountryListItem from './CountryListItem';
import clsx from 'clsx';
import {
    MagnifyingGlassIcon,
    InfoCircleIcon,
    CrossCircleReverseIcon,
} from '@lion-libs/react-icons';

/**
 * Dropdown 的 Props
 */
export interface DropdownProps {
    className?: string;
    hint?: string;
    searchPlaceholder?: string;
}

/**
 * Dropdown 組件 - 下拉選單
 */
export function Dropdown({ className, hint, searchPlaceholder }: DropdownProps) {
    const {
        type,
        name,
        isOpen,
        searchInput,
        setSearchInput,
        selectedCountry,
        hotList,
        filteredCountries,
        isLoading,
        dropdownPosition,
        dropdownMaxHeight,
        handleSelectCountry,
        getFirstCountry,
        selectedItemRef,
        renderConfig,
        displaySearchPlaceholder,
    } = useCountrySelectorContext();

    // 如果選單未打開，不渲染
    if (!isOpen) {
        return null;
    }

    // 使用傳入的 props 或 context 的預設值
    const finalSearchPlaceholder = searchPlaceholder || displaySearchPlaceholder;
    const finalHint = hint || '';

    // 搜尋框事件處理
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (searchInput.trim()) {
                const firstCountry = getFirstCountry();
                if (firstCountry) {
                    handleSelectCountry(firstCountry);
                }
            }
        } else if (e.key === 'Escape') {
            setSearchInput('');
        }
    };

    const handleSearchBlur = () => {
        setTimeout(() => {
            if (searchInput.trim()) {
                const firstCountry = getFirstCountry();
                if (firstCountry) {
                    handleSelectCountry(firstCountry);
                }
            }
        }, 200);
    };

    return (
        <>
            {/* Hidden input 用於表單提交 */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={
                        selectedCountry
                            ? type === 'dialCode'
                                ? selectedCountry.code
                                : selectedCountry.shortName
                            : ''
                    }
                />
            )}

            <div
                className={clsx(
                    'country-selector__dropdown',
                    {
                        'country-selector__dropdown--top': dropdownPosition === 'top',
                    },
                    className
                )}
                style={{ maxHeight: `${dropdownMaxHeight}px` }}
            >
                {/* 提示文字 */}
                {finalHint && (
                    <div className="country-selector__hint">
                        <InfoCircleIcon />
                        {finalHint}
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
                        placeholder={finalSearchPlaceholder}
                        autoFocus
                    />

                    {searchInput ? (
                        <CrossCircleReverseIcon
                            className="clear-icon"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                setSearchInput('');
                            }}
                        />
                    ) : (
                        <MagnifyingGlassIcon className="search-icon" />
                    )}
                </div>

                {/* 國家選單 */}
                <ul
                    className={clsx('country-selector__list', {
                        'country-selector--loading': isLoading,
                    })}
                    role="listbox"
                    style={{ maxHeight: `${dropdownMaxHeight - 100}px` }}
                >
                    {/* Loading 狀態 - 顯示 skeleton */}
                    {isLoading ? (
                        <>
                            {/* 計算 skeleton 數量：根據當前搜尋結果數量，最多 10 個 */}
                            {Array.from({
                                length: Math.min(
                                    10,
                                    Math.max(1, Object.values(filteredCountries).flat().length || 5)
                                ),
                            }).map((_, index) => {
                                // 長短交替：偶數索引為長，奇數索引為短
                                const widthVariant = index % 2 === 0 ? 'long' : 'short';
                                return (
                                    <li
                                        key={index}
                                        className="country-selector__list-item country-selector__list-item--skeleton"
                                    >
                                        <div
                                            className={`skeleton skeleton-text skeleton-text--${widthVariant}`}
                                        ></div>
                                    </li>
                                );
                            })}
                        </>
                    ) : renderConfig.showNoResult ? (
                        <li className="country-selector__list-item country-selector__list-item--empty">
                            很抱歉，找不到符合的項目!
                        </li>
                    ) : (
                        <>
                            {/* 熱門列表 */}
                            {renderConfig.showHotList && (
                                <>
                                    <p className="country-selector__list-title">常用國家 / 地區</p>
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

                            {/* 完整列表 */}
                            {Object.entries(filteredCountries)
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
        </>
    );
}
