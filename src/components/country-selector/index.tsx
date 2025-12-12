import { Root } from './components/Root';
import { Trigger } from './components/Trigger';
import { Dropdown } from './components/Dropdown';
import './styles/index.scss';

/**
 * CountrySelector - Compound Components API
 *
 * 基本用法：
 * ```tsx
 * <CountrySelector.Root type="dialCode" value={value} onChange={onChange}>
 *   <CountrySelector.Trigger />
 *   <CountrySelector.Dropdown />
 * </CountrySelector.Root>
 * ```
 *
 * 自訂 Trigger：
 * ```tsx
 * <CountrySelector.Root type="dialCode" value={value} onChange={onChange}>
 *   <CountrySelector.Trigger>
 *     <input placeholder="自訂輸入框" />
 *   </CountrySelector.Trigger>
 *   <CountrySelector.Dropdown />
 * </CountrySelector.Root>
 * ```
 */
export const CountrySelector = {
    Root,
    Trigger,
    Dropdown,
};

// 預設導出
export default CountrySelector;

// 也可以個別導出
export { Root, Trigger, Dropdown };

// 導出型別
export type { RootProps } from './components/Root';
export type { TriggerProps } from './components/Trigger';
export type { DropdownProps } from './components/Dropdown';
export type { Country, CountrySelectorType } from './types/country-selector';
