'use client';

import React from 'react';
import MessageBubble from './MessageBubble';
import SuggestionsList from './DefaultPrompt';
import TypingIndicator from './TypeIndicator';
import Hello from '../Hello';
import { UIMessage } from '@/types';

interface ChatAreaProps {
  messages: UIMessage[];
  isWelcomeScreen: boolean;
  isCurrentLoading: boolean;
  onSelectSuggestion: (prompt: string) => void;
}

export default function ChatArea({ messages, isWelcomeScreen, isCurrentLoading, onSelectSuggestion }: ChatAreaProps) {
  return (
    <div style={S.chatArea} className="custom-scroll">
      {isWelcomeScreen ? (
        <div style={S.welcome} className="animate-fade-up">
          <Hello/>
          <SuggestionsList onSelect={onSelectSuggestion} />
        </div>
      ) : (
        <div style={S.messageList}>
          {messages.map((m) => (
            <MessageBubble key={m.id} msg={m} />
          ))}
        </div>
      )}

      {isCurrentLoading && <TypingIndicator />}

      <div style={{ height: 1 }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 5% 40px',
    display: 'flex',
    flexDirection: 'column',
  },
  welcome: {
    margin: 'auto',
    textAlign: 'center',
    maxWidth: 600,
    padding: '40px 0',
  },
  messageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    maxWidth: 800,
    margin: '0 auto',
    width: '100%',
  },
};
