import React, { useState } from 'react';

const PlaceholderReplacer = () => {
    const [content, setContent] = useState("Hello, {{name}}! Your email number is {{email}} and your message is {{message}}.");
    const [data, setData] = useState({
        name: "John Doe",
        email: "john.doe@gmail.com",
        message: "some text"
    });

    const replacePlaceholders = () => {
        let updatedContent = content;
        for (const [key, value] of Object.entries(data)) {
            const placeholder = `{{${key}}}`;
            updatedContent = updatedContent.replace(new RegExp(placeholder, "g"), value);
        }
        setContent(updatedContent);
    };

    return (
        <div>
            <p>{content}</p>
            <button onClick={replacePlaceholders}>Replace Placeholders</button>
        </div>
    );
};

export default PlaceholderReplacer;
