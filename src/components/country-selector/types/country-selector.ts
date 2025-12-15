// ==========================================
// 1. 資料層型別定義（對應 JSON 資料結構）
// ==========================================

/**
 * 國家基本資訊
 * 對應 countries.zhTW.full.json 中的每個國家物件
 */
export interface Country {
    zhName: string;
    enName: string;
    shortName: string;
    firstLetter: string;
    code: string;
    id: number;
}

/**
 * 國家列表資料結構
 * 包含熱門列表和完整列表
 */
export interface CountryList {
    /** 熱門國家列表 */
    hotList: Country[];
    /** 完整國家列表 (按字母排序) */
    list: Country[];
}

/** 完整 JSON 資料結構 */
export interface CountriesData {
    mobileCodeList: CountryList;
}

// ==========================================
// 2. 元件層型別定義
// ==========================================

/**
 * 選擇器模式
 * - dialCode: 電話號碼前綴選擇（顯示 +886 台灣）
 * - nationality: 國籍選擇（顯示 台灣 (TW)）
 */
export type CountrySelectorType = 'dialCode' | 'nationality';

/**
 * CountrySelector 元件的 Props
 */
export interface CountrySelectorProps {
    /** 選擇器類型 */
    type: CountrySelectorType;

    /** 受控元件：目前選中的值 */
    value?: string;

    /** 非受控元件：預設選中的值（例如：'TW' 或 '886'） */
    defaultValue?: string;

    /** 選擇變更時的回調（可能為 null 當清空選擇時） */
    onChange?: (country: Country | null) => void;

    /** trigger 的 placeholder（沒有值時顯示） */
    placeholder?: string;

    /** 搜尋輸入框的 placeholder */
    searchPlaceholder?: string;

    /** 下拉選單內的提示文字 */
    dropdownHint?: string;

    /** 元件的 label 文字 */
    label?: string;

    /** 表單欄位名稱（用於表單提交） */
    name?: string;

    /** 是否為必填欄位（會在 label 顯示紅色星號） */
    required?: boolean;

    /** 自訂 CSS class */
    className?: string;

    /** 是否禁用 */
    disabled?: boolean;

    /** 資料來源 */
    dataSource?: CountryList[];
}

// ==========================================
// 3. 內部狀態型別定義（供元件內部使用）
// ==========================================

/**
 * 元件內部 UI 狀態
 */
export interface CountrySelectorState {
    isOpen: boolean;
    searchTerm: string;
    selectedCountry: Country | null;
    filteredList: Country[];
}

// ==========================================
// 4. 工具函數型別定義
// ==========================================

/**
 * 搜尋匹配類型
 * - exact: 完全匹配（優先級最高）
 * - partial: 部分匹配
 * - none: 不匹配
 */
export type MatchType = 'exact' | 'partial' | 'none';

/**
 * 帶有匹配資訊的國家資料
 * 用於排序演算法
 */
export interface CountryWithMatch extends Country {
    matchType: MatchType; // 新增這個屬性，其他繼承自 Country
}
