import { useState, useRef, useEffect, useCallback } from 'react'

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string

export interface RadioTrack {
  slug: string
  title: string
  artist: string
  album: string
  preview: string
  cover: string
}

const TRACK_DURATION = 30

export function useRadio() {
  const [tracks, setTracks] = useState<RadioTrack[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOn, setIsOn] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolume] = useState(0.7)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0) // 0..1 within current track

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelPosRef = useRef(0)
  const lastTickRef = useRef(0)

  const tracksRef = useRef<RadioTrack[]>([])
  const isOnRef = useRef(false)
  const isPlayingRef = useRef(true)
  const volumeRef = useRef(0.7)
  const currentIndexRef = useRef(0)
  const isFadingOutRef = useRef(false)

  useEffect(() => { tracksRef.current = tracks }, [tracks])
  useEffect(() => { isOnRef.current = isOn }, [isOn])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { volumeRef.current = volume }, [volume])
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])

  const currentTrack = tracks[currentIndex] || null

  const fetchTracks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const url = `${SUPABASE_URL}/functions/v1/radio-previews`
      const headers = {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      }
      const resp = await fetch(url, { headers })
      if (!resp.ok) throw new Error(`Falha ao carregar músicas (${resp.status})`)
      const data = await resp.json()
      if (!data.tracks) throw new Error('Resposta inválida do servidor')
      const ordered = [
        'join-me-in-death', 'potranca', 'ultraviolence', 'ride', 'let-down',
        'fireworks', 'pisca-duas-vezes', 'i-love-you', 'ma-cherie', 'tudo-vai-dar-certo',
      ]
      const list: RadioTrack[] = ordered
        .map((slug) => data.tracks[slug])
        .filter((t): t is NonNullable<typeof t> => !!t && !!t.preview)
      if (list.length === 0) throw new Error('Nenhuma música disponível')
      setTracks(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar rádio')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'auto'
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const fadeTo = useCallback((targetVol: number, durationMs: number, onDone?: () => void) => {
    const audio = audioRef.current
    if (!audio) { onDone?.(); return }
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    const steps = 20
    const interval = durationMs / steps
    const startVol = audio.volume
    const delta = (targetVol - startVol) / steps
    let step = 0
    const tick = () => {
      step++
      audio.volume = Math.max(0, Math.min(1, startVol + delta * step))
      if (step < steps) {
        fadeTimerRef.current = setTimeout(tick, interval)
      } else {
        audio.volume = targetVol
        onDone?.()
      }
    }
    fadeTimerRef.current = setTimeout(tick, interval)
  }, [])

  const playTrack = useCallback((track: RadioTrack, offset: number, vol: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = track.preview
    audio.volume = 0
    audio.currentTime = 0
    audio.play().then(() => {
      if (offset > 0.5 && offset < TRACK_DURATION - 1) {
        try { audio.currentTime = offset } catch {}
      }
      fadeTo(vol, 600)
    }).catch(() => {})
  }, [fadeTo])

  // Channel clock — advances ONLY when radio is off.
  // When on+playing, the audio element is the source of truth (synced via timeupdate).
  // When on+paused, everything is frozen.
  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      const delta = (now - lastTickRef.current) / 1000
      lastTickRef.current = now
      if (isOnRef.current || tracksRef.current.length === 0) return
      channelPosRef.current += delta
      if (channelPosRef.current >= TRACK_DURATION) {
        channelPosRef.current = 0
        setCurrentIndex((i) => (i + 1) % tracksRef.current.length)
      }
    }
    lastTickRef.current = Date.now()
    const interval = setInterval(tick, 250)
    return () => clearInterval(interval)
  }, [])

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      if (isOnRef.current && isPlayingRef.current) {
        channelPosRef.current = audio.currentTime
        const dur = audio.duration || TRACK_DURATION
        setProgress(Math.min(1, audio.currentTime / dur))
      }
      if (audio.duration && audio.duration - audio.currentTime <= 2.5 && audio.volume > 0.01 && !isFadingOutRef.current) {
        isFadingOutRef.current = true
        fadeTo(0, 2000)
      }
    }

    const onEnded = () => {
      isFadingOutRef.current = false
      channelPosRef.current = 0
      setProgress(0)
      setCurrentIndex((i) => (i + 1) % Math.max(1, tracksRef.current.length))
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [fadeTo])

  // Main playback effect
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || tracks.length === 0 || !currentTrack) return

    if (isOn && isPlaying) {
      isFadingOutRef.current = false
      if (audio.src !== currentTrack.preview || audio.paused) {
        if (audio.src === currentTrack.preview && audio.paused) {
          // Same track, just paused: resume from frozen position
          audio.currentTime = channelPosRef.current
          audio.volume = 0
          audio.play().then(() => fadeTo(volume, 400)).catch(() => {})
        } else {
          // New track: load and play
          playTrack(currentTrack, channelPosRef.current, volume)
        }
      }
    } else {
      if (!audio.paused) {
        channelPosRef.current = audio.currentTime
        fadeTo(0, 300, () => audio.pause())
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOn, isPlaying, currentIndex, currentTrack?.preview, tracks.length])

  const togglePower = useCallback(() => {
    setIsOn((v) => !v)
    setIsPlaying(true)
  }, [])

  const togglePlay = useCallback(() => setIsPlaying((v) => !v), [])

  const next = useCallback(() => {
    isFadingOutRef.current = false
    channelPosRef.current = 0
    setCurrentIndex((i) => (i + 1) % Math.max(1, tracksRef.current.length))
    setIsPlaying(true)
  }, [])

  const prev = useCallback(() => {
    isFadingOutRef.current = false
    channelPosRef.current = 0
    setCurrentIndex((i) => (i - 1 + tracksRef.current.length) % Math.max(1, tracksRef.current.length))
    setIsPlaying(true)
  }, [])

  // When radio is off, advance the visual progress from the channel clock
  useEffect(() => {
    if (isOn || tracks.length === 0) return
    setProgress(Math.min(1, channelPosRef.current / TRACK_DURATION))
  }, [isOn, tracks.length, currentIndex])

  return {
    tracks, currentTrack, currentIndex, isOn, isPlaying, volume, loading, error, progress,
    togglePower, togglePlay, next, prev, setVolume,
  }
}
