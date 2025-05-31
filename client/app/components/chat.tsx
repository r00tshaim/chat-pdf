'use client';

import React from 'react';
import { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useUser } from "@clerk/nextjs"; 


interface IMessage {
    role: 'user' | 'assistant';
    content?: string;
    docuement?: string[];
}

const ChatComponent: React.FC = () => {

    const { user } = useUser(); // Get the logged-in user

    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<IMessage[]>([]);

    const handleSendChatMessage = async () => {
        if (message.trim() === '') {
            return;
        }
        // Here you would typically send the message to your backend or chat service
        console.log("Sending message:", message);

        // Update the messages state to include the new message
        setMessages(prevMessages => [...prevMessages, {role: 'user', content: message} ]);

        const res = await fetch(`http://localhost:8000/chat?message=${message}`);

        const data = await res.json();

        // Update the messages state to include the new message
        setMessages(prevMessages => [...prevMessages, {role: 'assistant', content: data.results} ]);

        console.log("Response from chat:", data);

        setMessage(''); // Clear the input field after sending the message
    };

  return (
    <div className="p-4">

<div className="flex flex-col gap-4 mb-24">
    {messages.map((msg, index) => (
        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
                <Avatar>
                    <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg" alt="Assistant" />
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
            )}
            <div className={`rounded-lg px-4 py-2 max-w-[70%] text-sm ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}>
                {msg.content}
            </div>
            {msg.role === 'user' && (
                <Avatar>
                    <AvatarImage src={user?.imageUrl || "https://api.dicebear.com/7.x/person/svg"} alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            )}
        </div>
    ))}
</div>

      <div className='fixed bottom-4 w-220 flex gap-2'>
        <Input 
            type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
                if(e.key === "Enter" && message.trim()){
                    handleSendChatMessage();
                }}
            } 
            placeholder="Type your query here..." />
        <Button 
            className="ml-2" 
            disabled={!message.trim()} 
            onClick={handleSendChatMessage} 
            variant="default">Send</Button>
      </div>

    </div>
  );
}


export default ChatComponent;