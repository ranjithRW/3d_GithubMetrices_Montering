// mainpage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Mainpage = () => {
    const navigate = useNavigate(); // Use useNavigate

    const handleProjectClick = () => {
        navigate('/modelpage'); // Use navigate to redirect to /modelpage
    };
    const handleDeveloperResource = () => {
        navigate('/developerResource')
    }

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                Welcome to our GitHub Monitoring Dashboard. Here you can track repository activities,
                monitor developer contributions, and oversee project progress in real-time.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}
                    onClick={handleDeveloperResource}
                >
                    Developers
                </button>
                <button
                    style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}
                    onClick={handleProjectClick} // Attach the onClick handler
                >
                    Project
                </button>
            </div>
        </div>
    );
};

export default Mainpage;