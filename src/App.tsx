import { useState, useEffect } from 'react';
import CountrySelector from './components/country-selector';
import type { CountryList } from './components/country-selector/types/country-selector';
import countriesData from './data/countries.zhTW.full.json';
import './App.css';

function App() {
    const [dialCode, setDialCode] = useState('886');
    const [nationality, setNationality] = useState('TW');
    const [customValue, setCustomValue] = useState('');

    // 模擬外部API載入
    const [customCountries, setCustomCountries] = useState<CountryList>({ hotList: [], list: [] });
    const [customLoading, setCustomLoading] = useState(true);

    useEffect(() => {
        setCustomLoading(true);
        const timer = setTimeout(() => {
            setCustomCountries({
                hotList: countriesData.mobileCodeList.hotList.slice(0, 1),
                list: countriesData.mobileCodeList.list,
            });
            setCustomLoading(false);
        }, 1800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="container">
            {/* 範例 1：基本用法 - 預設 Trigger */}
            <div className="demo-group">
                <h3>1. 基本用法（預設按鈕）</h3>
                <CountrySelector.Root
                    type="dialCode"
                    value={dialCode}
                    onChange={(country) => setDialCode(country?.code || '')}
                    label="電話國碼"
                >
                    <CountrySelector.Trigger />
                    <CountrySelector.Dropdown />
                </CountrySelector.Root>
            </div>

            {/* 範例 2：自訂 Trigger */}
            <div className="demo-group">
                <h3>2. 自訂 Trigger（搜尋輸入框）</h3>
                <CountrySelector.Root
                    type="nationality"
                    value={nationality}
                    onChange={(country) => setNationality(country?.shortName || '')}
                >
                    <CountrySelector.Trigger>
                        <input
                            placeholder="輸入國家名稱搜尋..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#e8f1ff',
                                color: '#2e80ff',
                                border: '1px solid #2e80ff',
                                borderRadius: '4px',
                            }}
                        />
                    </CountrySelector.Trigger>
                    <CountrySelector.Dropdown />
                </CountrySelector.Root>
            </div>

            {/* 範例 3：與手機號碼組合 */}
            <div className="demo-group">
                <h3>3. 與手機號碼組合</h3>
                <div className="input-wrapper">
                    <CountrySelector.Root
                        type="dialCode"
                        value={customValue}
                        onChange={(country) => setCustomValue(country?.code || '')}
                    >
                        <CountrySelector.Trigger placeholder="國碼" />
                        <CountrySelector.Dropdown />
                    </CountrySelector.Root>
                    <input type="tel" placeholder="電話號碼" className="phone-number" />
                </div>
            </div>

            {/* 範例 4：外部資料與 loading 控制 */}
            <div className="demo-group">
                <h3>4. 外部資料與 loading 控制</h3>
                <CountrySelector.Root
                    type="dialCode"
                    value={customValue}
                    onChange={(country) => setCustomValue(country?.code || '')}
                    dataSource={customCountries}
                    loading={customLoading}
                >
                    <CountrySelector.Trigger placeholder="國籍" />
                    <CountrySelector.Dropdown />
                </CountrySelector.Root>
            </div>
        </div>
    );
}

export default App;
