const m=(d,a="info",l={})=>{let t=document.getElementById("toast-container");t||(t=document.createElement("div"),t.id="toast-container",t.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `,document.body.appendChild(t));const e=document.createElement("div"),i=`toast-${Date.now()}`,r={success:{background:"#10b981",color:"white"},error:{background:"#ef4444",color:"white"},warning:{background:"#f59e0b",color:"white"},info:{background:"#3b82f6",color:"white"}},o=r[a]||r.info;e.id=i,e.style.cssText=`
    background: ${o.background};
    color: ${o.color};
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 300px;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;const c={success:"✓",error:"✕",warning:"⚠",info:"ℹ"};e.innerHTML=`
    <span style="font-size: 18px;">${c[a]||c.info}</span>
    <span style="flex: 1;">${d}</span>
    <button onclick="this.parentElement.remove()" style="
      background: none;
      border: none;
      color: ${o.color};
      font-size: 16px;
      cursor: pointer;
      padding: 0;
      margin-left: 10px;
    ">×</button>
  `;const n=document.createElement("style");n.textContent=`
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,document.querySelector("style[data-toast-animations]")||(n.setAttribute("data-toast-animations","true"),document.head.appendChild(n)),t.appendChild(e);const p=l.timeout||3e3;setTimeout(()=>{const s=document.getElementById(i);s&&(s.style.animation="slideIn 0.3s ease-out reverse",setTimeout(()=>s.remove(),300))},p)};export{m as s};
