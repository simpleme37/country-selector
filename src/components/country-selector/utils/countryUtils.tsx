import type { Country } from '../types/country-selector';

/**
 * 排序國家列表（按 shortName）
 * @param countries - 要排序的國家列表
 * @returns 排序後的列表
 */
function sortCountries(countries: Country[]) {
    return [...countries].sort((a, b) => a.shortName.localeCompare(b.shortName));
}

/**
 * 將國家列表按首字母分組
 * @param countries - 要分組的國家列表（已排序）
 * @returns 分組後的物件 { A: [...], B: [...], ... }
 */
function groupCountriesByLetter(countries: Country[]) {
    const groups: Record<string, Country[]> = {};

    countries.forEach((country) => {
        const letter = country.firstLetter.toUpperCase(); // 使用資料中的 firstLetter

        if (!groups[letter]) {
            groups[letter] = [];
        }
        groups[letter].push(country);
    });

    return groups;
}

/**
 * 轉義正則表達式特殊字符
 * @param string - 需要轉義的字符串
 * @returns 轉義後的字符串
 */
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 處理出關鍵字
 * @param text - 原始文字
 * @param searchTerm - 搜尋關鍵字
 * @returns React 節點，匹配部分以 <mark> 標記
 */
function highlightMatch(text: string, searchTerm: string): React.ReactNode {
    // 如果沒有搜尋詞，直接返回原文
    if (!searchTerm.trim()) {
        return text;
    }

    // 轉義特殊字符，避免正則錯誤
    const escapedTerm = escapeRegExp(searchTerm);
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
        // 每次都建立新的 regex 來測試，避免狀態問題
        const testRegex = new RegExp(escapeRegExp(searchTerm), 'gi');
        const isMatch = testRegex.test(part);

        return isMatch ? (
            <mark key={index} className="highlight">
                {part}
            </mark>
        ) : (
            part
        );
    });
}

/**
 * 篩選國家列表
 * @param countries - 國家列表
 * @param type - 模式（'dialCode' 或 'nationality'）
 * @param searchInput - 搜尋關鍵字
 * @returns 篩選後的國家列表
 */
function filterAndGroupCountries(
    countries: Country[],
    type: string,
    searchInput: string
): Record<string, Country[]> {
    // 有搜尋詞時：過濾並排序
    const exactMatches: Country[] = [];
    const partialMatches: Country[] = [];

    if (searchInput.trim()) {
        const searchLower = searchInput.toLowerCase();

        countries.forEach((country) => {
            // 檢查完全匹配 (任一欄位)
            const isExactMatch =
                (type === 'dialCode' && country.code === searchInput) ||
                country.zhName.toLowerCase() === searchLower ||
                country.enName.toLowerCase() === searchLower ||
                country.shortName.toLowerCase() === searchLower;

            if (isExactMatch) {
                exactMatches.push(country);
            }

            // 檢查部分匹配 (任一欄位包含)
            else if (
                (type === 'dialCode' && country.code.includes(searchInput)) ||
                country.zhName.toLowerCase().includes(searchLower) ||
                country.enName.toLowerCase().includes(searchLower) ||
                country.shortName.toLowerCase().includes(searchLower)
            ) {
                partialMatches.push(country);
            }
        });

        // 合併：完全匹配優先，內部按 shortName 排序
        const combined = [...sortCountries(exactMatches), ...sortCountries(partialMatches)];

        // 搜尋時不分組，保持優先順序（用空字串作為唯一的分組 key）
        return { '': combined };
    }

    // 無搜尋時：直接排序、分組
    return groupCountriesByLetter(sortCountries(countries));
}

export { sortCountries, groupCountriesByLetter, highlightMatch, filterAndGroupCountries };
