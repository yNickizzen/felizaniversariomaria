import { useState, useEffect, useRef } from 'react'
import type { RadioTrack } from './useRadio'

interface RadioHudProps {
  track: RadioTrack | null
  isPlaying: boolean
  volume: number
  progress: number
  onTogglePlay: () => void
  onNext: () => void
  onPrev: () => void
  onVolume: (v: number) => void
  onClose: () => void
}

const hudCss = `
.radio-hud{position:fixed;bottom:max(16px,env(safe-area-inset-bottom,16px));right:max(16px,env(safe-area-inset-right,16px));z-index:100;width:288px;font-family:'Nunito',system-ui,sans-serif;color:#f5ecdd;animation:radioIn .4s cubic-bezier(.34,1.56,.64,1) forwards;}
@keyframes radioIn{0%{opacity:0;transform:scale(.7) translateY(24px)}70%{opacity:1;transform:scale(1.03) translateY(4px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes radioOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.85) translateY(16px)}}
.radio-hud.closing{animation:radioOut .25s ease forwards;}
.radio-card{background:linear-gradient(135deg,rgba(30,22,44,.95),rgba(18,12,28,.97));border-radius:16px;padding:14px 14px 12px;box-shadow:0 12px 48px rgba(0,0,0,.55),0 0 0 1px rgba(255,200,150,.12);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);overflow:hidden;}
.radio-top{display:flex;gap:12px;align-items:center;}
.radio-disc{width:68px;height:68px;flex-shrink:0;position:relative;}
.radio-disc-img{width:68px;height:68px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 3px rgba(255,200,150,.15),0 4px 12px rgba(0,0,0,.4);}
.radio-disc.spinning .radio-disc-img{animation:spin 4s linear infinite;}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.radio-disc::after{content:'';position:absolute;top:50%;left:50%;width:12px;height:12px;border-radius:50%;background:#120c1c;transform:translate(-50%,-50%);box-shadow:0 0 0 2px rgba(255,200,150,.25);pointer-events:none;}
.radio-info{flex:1;min-width:0;}
.radio-title{font-size:13px;font-weight:700;color:#fff5e8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.radio-artist{font-size:11px;color:rgba(255,200,150,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;}
.radio-album{font-size:10px;color:rgba(255,200,150,.45);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px;}
.radio-progress{margin-top:11px;}
.radio-progress-bar{position:relative;height:3px;border-radius:2px;background:rgba(255,200,150,.13);overflow:visible;}
.radio-progress-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#ffb87a,#ff8a4a);transition:width .25s linear;}
.radio-progress-dot{position:absolute;top:50%;width:9px;height:9px;border-radius:50%;background:#fff5e8;transform:translate(-50%,-50%);box-shadow:0 0 6px rgba(255,184,122,.7),0 0 12px rgba(255,184,122,.35);transition:left .25s linear;pointer-events:none;}
.radio-progress-time{display:flex;justify-content:space-between;margin-top:6px;font-size:10px;color:rgba(255,200,150,.6);font-variant-numeric:tabular-nums;}
.radio-progress-time .remaining{color:rgba(255,200,150,.85);}
.radio-controls{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,200,150,.1);}
.radio-btn{width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:rgba(255,200,150,.07);border:none;border-radius:50%;cursor:pointer;color:#f5ecdd;transition:background .2s,transform .1s;padding:0;}
.radio-btn:hover{background:rgba(255,200,150,.18);}
.radio-btn:active{transform:scale(.9);}
.radio-btn.play{background:rgba(255,200,150,.18);width:36px;height:36px;}
.radio-btn svg{width:15px;height:15px;}
.radio-btn.play svg{width:17px;height:17px;}
.radio-volume{display:flex;align-items:center;gap:7px;margin-top:10px;}
.radio-volume svg{flex-shrink:0;opacity:.65;}
.radio-volume-slider{flex:1;-webkit-appearance:none;appearance:none;height:3px;border-radius:2px;background:rgba(255,200,150,.2);outline:none;cursor:pointer;}
.radio-volume-slider::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:#ffb87a;cursor:pointer;box-shadow:0 0 5px rgba(255,184,122,.5);}
.radio-volume-slider::-moz-range-thumb{width:13px;height:13px;border-radius:50%;background:#ffb87a;cursor:pointer;border:none;}
.radio-download{font-size:10px;color:rgba(255,200,150,.5);text-decoration:none;margin-top:8px;display:block;}
.radio-download:hover{color:rgba(255,200,150,.8);}
.radio-close{position:absolute;top:-8px;right:-8px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:rgba(30,18,48,.97);border:1px solid rgba(255,200,150,.2);border-radius:50%;cursor:pointer;color:#f5ecdd;font-size:15px;line-height:1;transition:background .2s;}
.radio-close:hover{background:rgba(60,40,80,.97);}
@media(max-width:480px){.radio-hud{width:calc(100vw - 32px);right:16px;}}
`

const FALLBACK_COVER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#2a1f3d"/><circle cx="128" cy="128" r="60" fill="none" stroke="#8a7a9a" stroke-width="3"/><circle cx="128" cy="128" r="14" fill="#8a7a9a"/></svg>')

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

export function RadioHud({ track, isPlaying, volume, progress, onTogglePlay, onNext, onPrev, onVolume, onClose }: RadioHudProps) {
  const [closing, setClosing] = useState(false)
  const [imgError, setImgError] = useState(false)
  const closingRef = useRef(false)

  useEffect(() => { setImgError(false) }, [track?.slug])

  if (!track) return null

  const handleClose = () => {
    if (closingRef.current) return
    closingRef.current = true
    setClosing(true)
    setTimeout(() => { closingRef.current = false; onClose() }, 240)
  }

  return (
    <>
      <style>{hudCss}</style>
      <div className={`radio-hud${closing ? ' closing' : ''}`} style={{ position: 'fixed' }}>
        <div className="radio-card" style={{ position: 'relative' }}>
          <button className="radio-close" onClick={handleClose} aria-label="Desligar rádio">×</button>

          <div className="radio-top">
            <div className={`radio-disc${isPlaying ? ' spinning' : ''}`}>
              <img
                className="radio-disc-img"
                src={imgError ? FALLBACK_COVER : track.cover}
                alt={track.album}
                onError={() => setImgError(true)}
              />
            </div>
            <div className="radio-info">
              <div className="radio-title">{track.title}</div>
              <div className="radio-artist">{track.artist}</div>
              <div className="radio-album">{track.album}</div>
            </div>
          </div>

          {/* Progress bar with remaining time */}
          <div className="radio-progress">
            <div className="radio-progress-bar">
              <div className="radio-progress-fill" style={{ width: `${progress * 100}%` }} />
              <div className="radio-progress-dot" style={{ left: `${progress * 100}%` }} />
            </div>
            <div className="radio-progress-time">
              <span>0:00</span>
              <span className="remaining">-{formatTime((1 - progress) * 30)}</span>
            </div>
          </div>

          {/* Controls row: prev · play/pause · next */}
          <div className="radio-controls">
            <button className="radio-btn" onClick={onPrev} aria-label="Anterior">
              {/* Previous: vertical bar + left-pointing triangle */}
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6V6zm12 0L8 12l10 6V6z"/>
              </svg>
            </button>
            <button className="radio-btn play" onClick={onTogglePlay} aria-label={isPlaying ? 'Pausar' : 'Tocar'}>
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5z"/></svg>
              )}
            </button>
            <button className="radio-btn" onClick={onNext} aria-label="Próxima">
              {/* Next: right-pointing triangle + vertical bar */}
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 18h2V6h-2v12zM6 18l10-6L6 6v12z"/>
              </svg>
            </button>
          </div>

          {/* Volume row — on its own line, never overflows */}
          <div className="radio-volume">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4z"/>
            </svg>
            <input
              className="radio-volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolume(parseFloat(e.target.value))}
              aria-label="Volume"
            />
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1-3.29-2.5-4.03v8.05C16 16.29 17 14.76 17 12zm2.5 0c0 2.7-1.39 5.09-3.5 6.49V5.52C20.11 6.9 21.5 9.3 21.5 12z"/>
            </svg>
          </div>

          <a
            className="radio-download"
            href={track.preview}
            download={`${track.artist} - ${track.title}.mp3`}
            target="_blank"
            rel="noopener noreferrer"
          >
            baixar prévia
          </a>
        </div>
      </div>
    </>
  )
}
