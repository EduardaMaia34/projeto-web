
import React from 'react';
import '../index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
        <body>
        {children}
        </body>
        </html>
    );
}