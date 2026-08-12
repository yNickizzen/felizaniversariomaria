import { useState, useEffect } from 'react'

const css = `
.mirror-msg{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;pointer-events:none;animation:mirrorFade .5s ease forwards;font-family:'Nunito',system-ui,sans-serif;}
@keyframes mirrorFade{from{opacity:0}to{opacity:1}}
.mirror-msg.closing{animation:mirrorFadeOut .26s ease forwards;}
@keyframes mirrorFadeOut{from{opacity:1}to{opacity:0}}
.mirror-msg-card{pointer-events:auto;max-width:380px;padding:28px 26px 22px;text-align:center;background:linear-gradient(160deg,rgba(30,22,44,.42),rgba(18,12,28,.55));border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.3),0 0 0 1px rgba(255,200,150,.12);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:mirrorCardIn .6s cubic-bezier(.34,1.56,.64,1) forwards;}
@keyframes mirrorCardIn{0%{opacity:0;transform:scale(.7) translateY(30px)}70%{opacity:1;transform:scale(1.03) translateY(4px)}100%{opacity:1;transform:scale(1) translateY(0)}}
.mirror-msg.closing .mirror-msg-card{animation:mirrorCardOut .26s ease forwards;}
@keyframes mirrorCardOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.88) translateY(16px)}}
.mirror-msg-icon{font-size:28px;margin-bottom:10px;animation:mirrorShine 2.4s ease-in-out infinite;}
@keyframes mirrorShine{0%,100%{opacity:.7}50%{opacity:1}}
.mirror-msg-title{font-size:22px;font-weight:800;color:#fff5e8;margin-bottom:12px;letter-spacing:.5px;}
.mirror-msg-text{font-size:14px;line-height:1.6;color:rgba(255,200,150,.85);}
.mirror-msg-text em{font-style:italic;color:#ffd9a0;}
.mirror-msg-close{margin-top:22px;padding:9px 24px;background:rgba(255,200,150,.12);border:1px solid rgba(255,200,150,.2);border-radius:24px;color:#f5ecdd;font-size:13px;font-family:inherit;cursor:pointer;transition:background .2s,transform .1s;}
.mirror-msg-close:hover{background:rgba(255,200,150,.22);}
.mirror-msg-close:active{transform:scale(.95);}
`

export function MirrorMessage({ closing, onClose }: { closing: boolean; onClose: () => void }) {
  const [showClose, setShowClose] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowClose(true), 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{css}</style>
      <div className={`mirror-msg${closing ? ' closing' : ''}`}>
        <div className="mirror-msg-card">
          <div className="mirror-msg-icon">✨</div>
          <div className="mirror-msg-title">Você é perfeita amor</div>
          <div className="mirror-msg-text">
            Você é infinitamente mais bonita do que consegue sequer enxergar, sou apaixonado por cada detalhe seu, eu te amo minha gatinha perfeita! <em>E te amarei até meu último suspiro</em> Feliz aniversário amor
          </div>
          {showClose && (
            <button className="mirror-msg-close" onClick={onClose}>voltar</button>
          )}
        </div>
      </div>
    </>
  )
}

