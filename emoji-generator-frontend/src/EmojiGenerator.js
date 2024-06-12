import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmojiGenerator.css';

const EmojiGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [previousEmojis, setPreviousEmojis] = useState([]);

    useEffect(() => {
        const fetchEmojis = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/emojis');
                setPreviousEmojis(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchEmojis();
    }, []);

    const handleGenerate = async () => {
        try {
            const response = await axios.post('http://localhost:5001/api/generate-emoji', { prompt });
            setImageUrl(response.data.imageUrl);
            setPreviousEmojis(prev => [...prev, response.data.imageUrl]);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container">
            <h1 className="header">AI Emoji Generator</h1>
            <div className="content">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt here"
                    className="textarea"
                ></textarea>
                <button onClick={handleGenerate} className="button">
                    Generate Emoji
                </button>
                {imageUrl && <div><img src={imageUrl} alt="Generated Emoji" className="image" /></div>}
                <div className="previous-emojis">
                    <h2>Previously Generated Emojis:</h2>
                    <div className="emoji-grid">
                        {previousEmojis.map((emoji, index) => (
                            <img key={index} src={emoji} alt={`Generated Emoji ${index}`} className="emoji" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmojiGenerator;
