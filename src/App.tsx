import { useState } from 'react';
import CountrySelector from './components/country-selector';
import './App.css';

function App() {
    const [dialCode, setDialCode] = useState('886');
    const [nationality, setNationality] = useState('TW');
    const [customValue, setCustomValue] = useState('');

    return (
        <div className="container">
            {/* 範例 1：Nationality 模式 */}
            <div className="demo-group">
                <h3>1. Nationality 模式</h3>
                <CountrySelector.Root
                    type="nationality"
                    value={nationality}
                    required={true}
                    onChange={(country) => setNationality(country?.shortName || '')}
                    label="國籍"
                >
                    <CountrySelector.Trigger placeholder="測試" />
                    <CountrySelector.Dropdown />
                </CountrySelector.Root>
            </div>

            {/* 範例 2：DialCode 模式 */}
            <div className="demo-group">
                <h3>2. DialCode 模式 (與手機號碼組合)</h3>
                <div className="input-wrapper">
                    <CountrySelector.Root
                        type="dialCode"
                        value={dialCode}
                        onChange={(country) => setDialCode(country?.code || '')}
                    >
                        <CountrySelector.Trigger />
                        <CountrySelector.Dropdown />
                    </CountrySelector.Root>
                    <input type="tel" placeholder="請輸入號碼" className="phone-number" />
                </div>
            </div>

            {/* 範例 3：自訂 Trigger（搜尋輸入框） */}
            <div className="demo-group">
                <h3>3. 自訂 Trigger（搜尋輸入框）</h3>
                <CountrySelector.Root
                    type="nationality"
                    value={customValue}
                    onChange={(country) => setCustomValue(country?.shortName || '')}
                >
                    <CountrySelector.Trigger>
                        <input
                            placeholder="輸入國家名稱搜尋..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#d3dee8',
                                borderRadius: '8px',
                                border: 'none',
                            }}
                        />
                    </CountrySelector.Trigger>
                    <CountrySelector.Dropdown />
                </CountrySelector.Root>
            </div>
        </div>
    );
}

export default App;
