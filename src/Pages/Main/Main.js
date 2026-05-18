import { React } from 'react';
import './main.scss';

const Main = () => {
    return (
        <main className="main">
            <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                <h2>Welcome to MangaLive</h2>
                <p>Use the navigation menu to browse manga, anime, and categories!</p>
            </div>
        </main>
    );
};

export default Main;