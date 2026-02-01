import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Ubank',
        short_name: 'Ubank',
        description: 'Modern financial inclusion platform for community banking',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#064e3b', // Emerald 900
        theme_color: '#064e3b',
        categories: ['finance', 'productivity'],
        icons: [
            {
                src: '/ubank-logo.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/ubank-logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/ubank-logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
        share_target: {
            action: '/share-target',
            method: 'POST',
            enctype: 'multipart/form-data',
            params: {
                title: 'title',
                text: 'text',
                url: 'url',
                files: [
                    {
                        name: 'file',
                        accept: ['image/*', 'application/pdf'],
                    },
                ],
            },
        },
    }
}
