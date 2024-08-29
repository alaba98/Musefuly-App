import React, { useEffect, useState } from 'react';
import './home.css'; 

export default function Home() {
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setFadeIn(true), 500); // Delay for fade-in effect
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`home-container ${fadeIn ? 'fade-in' : ''}`}>
            <div className="home-content">
                <h1>Welcome to Musefuly</h1>
                <p>Discover and connect with others who share your interests. Explore communities, join discussions, and make new friends!</p>
                <div className="home-buttons">
                    <a href="/signup" className="btn btn-primary">Sign Up</a>
                    <a href="/login" className="btn btn-secondary">Login</a>
                </div>
            </div>
        </div>
    );
}
