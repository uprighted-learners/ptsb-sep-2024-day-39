import React, { useState } from 'react'

export default function EmailForm() {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [text, setText] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // set the payload
        const payload = {
            to,
            subject,
            text
        };

        try {
            const response = await fetch('http://localhost:8080/api/email/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMessage("Email sent successfully");
                setTo('');
                setSubject('');
                setText('');
            } else {
                setStatusMessage(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <h1>Contact Form</h1>
            <form onSubmit={handleSubmit}>
                <label>To</label>
                <input type="email" value={to} onChange={(e) => setTo(e.target.value)} />
                <br />
                <label>Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
                <br />
                <label>Text</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} />
                <br />
                <button type="submit">Send Email</button>
            </form>

            {statusMessage && <p>{statusMessage}</p>}
        </div>
    )
}
