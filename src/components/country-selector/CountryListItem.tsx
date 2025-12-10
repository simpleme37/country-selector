import clsx from 'clsx';
import type { Country, CountrySelectorType } from './types/country-selector';
import { highlightMatch } from './utils/countryUtils';

interface CountryListItemProps {
    country: Country;
    type: CountrySelectorType;
    searchInput: string;
    isSelected: boolean;
    isHot?: boolean;
    onClick: () => void;
    itemRef?: React.RefObject<HTMLLIElement | null>;
}

export default function CountryListItem({
    country,
    type,
    searchInput,
    isSelected,
    isHot = false,
    onClick,
    itemRef,
}: CountryListItemProps) {
    return (
        <li
            ref={itemRef}
            className={clsx('country-selector__list-item', {
                'country-selector__list-item--hot': isHot,
                'country-selector__list-item--selected': isSelected,
            })}
            onClick={onClick}
        >
            {type === 'dialCode' ? (
                // 電話國碼模式
                <>
                    <div className="country-selector__list-item-name">
                        {highlightMatch(country.zhName, searchInput)}{' '}
                        {highlightMatch(country.enName, searchInput)} (
                        {highlightMatch(country.shortName, searchInput)})
                    </div>
                    <span className="country-selector__list-item-code">
                        +{highlightMatch(country.code, searchInput)}
                    </span>
                </>
            ) : (
                // 國籍模式
                <span className="country-selector__list-item-content">
                    {highlightMatch(country.zhName, searchInput)}{' '}
                    {highlightMatch(country.enName, searchInput)} (
                    {highlightMatch(country.shortName, searchInput)})
                </span>
            )}
        </li>
    );
}
