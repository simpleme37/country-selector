import CountrySelector from './components/country-selector/country-selector';
import './App.css';

function App() {
    return (
        <div className="container">
            <h3>1. 電話國碼</h3>
            <div className="input-wrapper">
                <CountrySelector type="dialCode" defaultValue="501"></CountrySelector>
            </div>

            <h3>2. 國籍</h3>
            <div className="input-wrapper">
                <CountrySelector type="nationality" defaultValue="TW"></CountrySelector>
            </div>

            <h3>3. 無預設值</h3>
            <div className="input-wrapper">
                <CountrySelector type="dialCode"></CountrySelector>
            </div>

            <h3>4. 有 label</h3>
            <div className="input-wrapper">
                <CountrySelector type="nationality" label="國籍"></CountrySelector>
            </div>
        </div>
    );
}

export default App;
