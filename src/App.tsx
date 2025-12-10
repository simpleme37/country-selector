import { useState } from 'react';
import CountrySelector from './components/country-selector/country-selector';
import './App.css';

function App() {
    const [country, setCountry] = useState('JP');

    return (
        <div className="container">
            <div className="demo-group">
                <h3>1. 電話國碼</h3>
                <div className="input-wrapper">
                    <CountrySelector type="dialCode" defaultValue="501"></CountrySelector>
                    <input type="text" placeholder="請輸入號碼" className="phone-number" />
                </div>
            </div>

            <div className="demo-group">
                <h3>2. 國籍</h3>
                <CountrySelector type="nationality" defaultValue="TW"></CountrySelector>
            </div>

            <div className="demo-group">
                <h3>3. 無預設值、有 label</h3>
                <CountrySelector type="dialCode" label="國籍"></CountrySelector>
            </div>

            <div className="demo-group">
                <h3>4. 受控模式</h3>
                <CountrySelector
                    type="nationality"
                    value={country}
                    onChange={(c) => c && setCountry(c.code)}
                ></CountrySelector>
            </div>

            <div className="demo-group">
                <h3>5. disabled 樣式</h3>
                <CountrySelector type="nationality" disabled={true}></CountrySelector>
            </div>
        </div>
    );
}

export default App;
