"use client"

import Gallery from '../_components/ui/gallery-component'

const gallerySections = [
    {
        images: [
            {
                src: './images/9.jpg',
                alt: 'Coastal cliffs and ocean view'
            }
        ]
    },
    {
        type: 'grid',
        images: [
            {
                src: './images/8.jpg',
                alt: 'Silhouettes on beach'
            },
            {
                src: './images/6.jpg',
                alt: 'Snowy mountain peaks'
            },
            {
                src: './images/9.jpg',
                alt: 'Rolling green hills'
            },
            {
                src: './images/14.jpg',
                alt: 'Sunset landscape'
            }
        ]
    },
    {
        type: 'grid',
        images: [
            {
                src: "./images/10.jpg",
                alt: 'Silhouettes on beach'
            },
            {
                src: "./images/11.jpg",
                alt: 'Snowy mountain peaks'
            },
            {
                src: "./images/14.jpg",
                alt: 'Rolling green hills'
            },
            {
                src: "./images/13.jpg",
                alt: 'Sunset landscape'
            }
        ]
    },
    {
        images: [
            {
                src: './images/7.jpg',
                alt: 'Coastal cliffs and ocean view'
            }
        ]
    }
]

export default function ServicesPage() {
    return (
        <Gallery sections={gallerySections} />
    );
}
