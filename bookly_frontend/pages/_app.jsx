// pages/_app.js
import "bootstrap/dist/css/bootstrap.min.css";
import '../src/index.css';
import "bootstrap-icons/font/bootstrap-icons.css";
// Não há necessidade de useEffect para importar o JS do Bootstrap se você usar react-bootstrap

export default function App({ Component, pageProps }) {
    console.log("APP LOADED");
    // Remova o useEffect que importa o JS do Bootstrap
    return <Component {...pageProps} />;
}