import React from 'react';
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
        const letter = country.shortName[0].toUpperCase(); // 例如 A, B, C

        if (!groups[letter]) {
            groups[letter] = [];
        }
        groups[letter].push(country);
    });

    return groups;
}

/**
 * 處理出關鍵字
 */
function highlightMatch(text: string, searchTerm: string): React.ReactNode {
    // 如果沒有搜尋詞，直接返回原文
    if (!searchTerm.trim()) {
        return text;
    }

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
        // 每次都建立新的 regex 來測試，避免狀態問題
        const testRegex = new RegExp(searchTerm, 'gi');
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

export { sortCountries, groupCountriesByLetter, highlightMatch };
