'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface StarCounterProps {
  className?: string
}

export default function StarCounter({ className = '' }: StarCounterProps) {
  const [starCount, setStarCount] = useState<number>(63)
  const [hasStarred, setHasStarred] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [sessionId] = useState<string>(() => {
    // Generate or get session ID
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('star_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        localStorage.setItem('star_session_id', sessionId)
      }
      return sessionId
    }
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  })

  // Make component visible after mount
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Fetch initial star count and check if user has starred
  useEffect(() => {
    const fetchStarData = async () => {
      try {
        // Get current star count
        const countResponse = await fetch('/api/star_count')
        if (countResponse.ok) {
          const countData = await countResponse.json()
          setStarCount(countData.count || 63)
        } else {
          // Fallback to localStorage if API is not available
          const localCount = localStorage.getItem('star_count')
          setStarCount(localCount ? parseInt(localCount) : 63)
        }

        // Check if user has already starred
        const checkResponse = await fetch(`/api/star_check/${sessionId}`)
        if (checkResponse.ok) {
          const checkData = await checkResponse.json()
          setHasStarred(checkData.has_starred || false)
        } else {
          // Fallback to localStorage
          const localStarred = localStorage.getItem('has_starred')
          setHasStarred(localStarred === 'true')
        }
      } catch {
        console.log('API not available, using offline mode')
        // Fallback to localStorage when API is not available
        const localCount = localStorage.getItem('star_count')
        const localStarred = localStorage.getItem('has_starred')
        
        setStarCount(localCount ? parseInt(localCount) : 63)
        setHasStarred(localStarred === 'true')
      }
    }

    fetchStarData()
  }, [sessionId])

  // Listen for real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('star_count')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'star_count' }, (payload) => {
        setStarCount(payload.new.count)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleStarClick = async () => {
    if (hasStarred || isLoading) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/star_add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_agent: navigator.userAgent
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          setStarCount(data.count)
          setHasStarred(true)
          
          // Store in localStorage
          localStorage.setItem('has_starred', 'true')
          localStorage.setItem('star_count', data.count.toString())
        }
      } else {
        // Offline mode - increment locally
        const newCount = starCount + 1
        setStarCount(newCount)
        setHasStarred(true)
        
        // Store in localStorage
        localStorage.setItem('has_starred', 'true')
        localStorage.setItem('star_count', newCount.toString())
      }
    } catch {
      console.log('API not available, using offline mode')
      // Offline mode - increment locally
      const newCount = starCount + 1
      setStarCount(newCount)
      setHasStarred(true)
      
      // Store in localStorage
      localStorage.setItem('has_starred', 'true')
      localStorage.setItem('star_count', newCount.toString())
    } finally {
      setIsLoading(false)
    }
  }

  // Format number with commas
  const formatCount = (count: number): string => {
    return count.toLocaleString()
  }



  if (!isVisible) {
    return null
  }

  return (
    <div 
      className={`fixed top-4 right-4 z-[9999] ${className}`}
      style={{ 
        position: 'fixed', 
        top: '16px', 
        right: '16px', 
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
    >
      <button
        onClick={handleStarClick}
        disabled={hasStarred || isLoading}
        className={`
          flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition-all duration-200
          ${hasStarred 
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800 cursor-default' 
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer'
          }
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
          shadow-lg hover:shadow-xl
          text-xs sm:text-sm font-medium
          backdrop-blur-sm
        `}
        title={hasStarred ? 'You have starred this site' : 'Star this site'}
        style={{ minWidth: '80px' }}
      >
        <Star 
          className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-200 ${
            hasStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'
          }`}
        />
        <span className="font-mono text-xs sm:text-sm">
          {typeof window !== 'undefined' && starCount > 999 && window.innerWidth < 640 
            ? `${Math.floor(starCount / 1000)}k` 
            : formatCount(starCount)
          }
        </span>
        {isLoading && (
          <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
        )}
      </button>
    </div>
  )
}