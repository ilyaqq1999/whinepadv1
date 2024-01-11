import logo from './logo.svg';
import './App.css';
import Excel from "./components/Excel";
import Discovery from "./components/Discovery";

let headers = localStorage.getItem('headers');
let data = localStorage.getItem('data');

const isDiscovery = window.location.pathname.replace(/\//g, '')

if (!headers) {
    headers = ['Title', 'Year', 'Rating', 'Comments'];
    data = [['Red whine', '2021', '3', 'meh']];
}

function App() {
    if (isDiscovery) {
        return <Discovery/>
    }
    return (
        <div className="Excel">
            <Excel
                headers={headers}
                initialData={data}
            />
        </div>
    );
}

export default App;
