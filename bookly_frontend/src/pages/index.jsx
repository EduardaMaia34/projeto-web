// pages/index.jsx

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const isAuthenticated = () => !!localStorage.getItem('jwtToken');

const IndexPage = () => {
    const router = useRouter();
    const [checkedAuth, setCheckedAuth] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (isAuthenticated()) {
                router.push('/reviews');
            } else {
                router.push('/login');
            }
        }
        setCheckedAuth(true);
    }, [router]);

    if (!checkedAuth) {
        return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Carregando...</div>;
    }

    return null;
};

export default IndexPage;