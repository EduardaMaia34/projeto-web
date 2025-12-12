"use client";

import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/index.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function App({ Component, pageProps }) {
    useEffect(() => {
        (async () => {
            await import("bootstrap/dist/js/bootstrap.bundle.min.js");
        })();
    }, []);

    return <Component {...pageProps} />;
}
