import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'i.imgur.com',
            'imgur.com',
            'placehold.co'
        ],
    },
};

module.exports = nextConfig;
