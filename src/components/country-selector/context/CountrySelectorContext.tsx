import { createContext, useContext } from 'react';
import type { Country } from '../types/country-selector';

/**
 * Context 的值（所有需要共享的狀態和方法）
 */
export interface CountrySelectorContextValue {
    // 基本屬性 (來自 Root)
    type: 'dialCode' | 'nationality';
    disabled: boolean;
    required: boolean;
    label?: string;
    name?: string;

    // 狀態 (Root 管理)
    isOpen: boolean;
    searchInput: string;
    selectedCountry: Country | null;

    // 資料
    hotList: Country[];
    filteredCountries: Record<string, Country[]>;
    isLoading: boolean;

    // UI 控制
    dropdownPosition: 'top' | 'bottom';
    dropdownMaxHeight: number;

    // 方法
    setIsOpen: (open: boolean) => void;
    setSearchInput: (input: string) => void;
    handleSelectCountry: (country: Country | null) => void;
    getFirstCountry: () => Country | null;

    // Refs
    containerRef: React.RefObject<HTMLDivElement | null>;
    selectedItemRef: React.RefObject<HTMLLIElement | null>;

    // UI 文字
    displayTriggerText: string;
    displaySearchPlaceholder: string;

    // 渲染配置
    renderConfig: {
        showHotList: boolean;
        showGroupLetter: boolean;
        showNoResult: boolean;
    };
}

/**
 * 創建 Context
 */
export const CountrySelectorContext = createContext<CountrySelectorContextValue | null>(null);

/**
 * 自定義 Hook：取得 Context
 */
export function useCountrySelectorContext() {
    const context = useContext(CountrySelectorContext);

    if (!context) {
        throw new Error('useCountrySelectorContext 必須在 CountrySelectContext.Provider 內使用');
    }

    return context;
}
