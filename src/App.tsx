import CountrySelector from './components/country-selector/country-selector';
import './App.css';

function App() {
    return (
        <div className="container">
            <h3>1.</h3>
            <div className="input-wrapper">
                <CountrySelector type="dialCode" defaultValue="886"></CountrySelector>
            </div>

            <h3>2.</h3>
            <div className="input-wrapper">
                <CountrySelector type="dialCode" defaultValue="TW"></CountrySelector>
            </div>

            <h3>3.</h3>
            <div className="input-wrapper">
                <CountrySelector type="dialCode"></CountrySelector>
            </div>
        </div>
    );
}

export default App;
