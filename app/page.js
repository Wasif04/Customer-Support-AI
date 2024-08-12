'use client'
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState, useRef, useEffect } from "react";
import "./globals.css"; 

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm BehavioralBuddy. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;  
    setIsLoading(true);
  
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }
    setIsLoading(false);
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#171717" 
      style={{
    fontFamily: "'Poppins', sans-serif"
  }}
    >
      <div className="lines">
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="2px solid rgba(255, 255, 255, 0.2)"
        borderRadius="12px"
        p={2}
        spacing={3}
        bgcolor="rgba(23, 23, 23, 0.9)" 
        boxShadow="0px 0px 15px rgba(255, 255, 255, 0.1)" 
        zIndex={1} 
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          paddingRight="10px"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'rgba(0, 150, 255, 0.3)' 
                    : 'rgba(0, 255, 150, 0.3)' 
                }
                color="white"
                borderRadius={16}
                p={2}
                maxWidth="80%"
                wordBreak="break-word"
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
        <TextField
          label="Type your message..."
          variant="outlined"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          InputProps={{
            style: {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '10px', 
              boxSizing: 'border-box',
              fontFamily: "'Poppins', sans-serif", 
            },
            inputProps: {
              style: {
                padding: '10px 14px',
                lineHeight: '1.5',
                fontFamily: "'Poppins', sans-serif", 
              }
            }
          }}
          InputLabelProps={{
            style: {
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: "'Poppins', sans-serif", 
            },
          }}
        />


        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={isLoading}
          style={{
            backgroundColor: 'rgba(0, 150, 255, 0.5)',
            color: 'white',
            borderRadius: '8px',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            boxShadow: '0px 0px 10px rgba(0, 150, 255, 0.5)',
            fontFamily: "'Poppins', sans-serif", 
          }}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>

        </Stack>
      </Stack>
    </Box>
  );
}
