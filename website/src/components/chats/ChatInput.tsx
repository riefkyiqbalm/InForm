'use client'

// ChatInput.tsx
//
// FIX 1 — was calling PATCH /api/chat/sessions/:id (the rename/pin endpoint)
//          to send a message. That returns HTML on error → "Unexpected token '<'".
//          Messages must go to POST /api/chat/sessions/:id/messages.
//
// FIX 2 — sessionId typed as `number` but Prisma uses cuid strings. Changed to string.
//
// FIX 3 — body was sending { messages: { role, content, timestamp } } which is
//          the wrong shape. The messages route expects { message: string }.

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getAuthToken, parseErrorMessage, handleAPIError } from '@/lib/errors'

export interface ChatInputProps {
  sessionId?: string                          // FIX 2: string, not number
  onMessageSent?: (message: string) => void
}

export default function ChatInput({ sessionId, onMessageSent }: ChatInputProps) {
  const { user, isAuthenticated } = useAuth()
  const [message, setMessage]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const saveMessage = async (text: string) => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to send messages')
      return
    }

    if (!sessionId) {
      setError('No active chat session')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = getAuthToken()
      if (!token) throw new Error('No authentication token')

      // FIX 1 — correct endpoint: POST .../messages (not PATCH .../sessions/:id)
      // FIX 3 — correct body shape: { message: string }
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      })

      if (!response.ok) {
        const apiError = await handleAPIError(response)
        throw new Error(apiError.message)
      }

      onMessageSent?.(text)
      setMessage('')
    } catch (err) {
      setError(parseErrorMessage(err, 'Failed to send message'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      setError('Message cannot be empty')
      return
    }
    saveMessage(message.trim())
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      padding: '16px',
      borderTop: '1px solid #eee',
    },
    form: { display: 'flex', gap: '8px' },
    input: {
      flex: 1,
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      fontFamily: 'inherit',
      boxSizing: 'border-box' as const,
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500' as const,
      cursor: 'pointer',
      minWidth: '80px',
    },
    error: {
      padding: '8px 12px',
      backgroundColor: '#fee',
      color: '#c33',
      borderRadius: '4px',
      fontSize: '13px',
    },
    disabled: { opacity: 0.6, cursor: 'not-allowed' as const },
  }

  if (!isAuthenticated) {
    return (
      <div style={{ ...styles.container, ...styles.error }}>
        Please log in to send messages
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ ...styles.button, ...(loading ? styles.disabled : {}) }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {error && <div style={styles.error}>{error}</div>}
    </div>
  )
}