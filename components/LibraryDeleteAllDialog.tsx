import React,{useEffect,useId,useRef} from 'react';
export default function LibraryDeleteAllDialog({title,message,confirmLabel,cancelLabel,busy,onConfirm,onCancel,error}:{title:string;message:string;confirmLabel:string;cancelLabel:string;busy:boolean;error?:string;onConfirm:()=>void;onCancel:()=>void}) {
 const titleId=useId(),messageId=useId(),panel=useRef<HTMLDivElement>(null),cancel=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement;cancel.current?.focus();return()=>{if(previous?.isConnected)previous.focus()}},[]);
 return <div className="library-bulk-overlay" onPointerDown={e=>e.stopPropagation()}>
  <div ref={panel} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={messageId} className="library-bulk-confirm" onKeyDown={e=>{
   if(e.key==='Escape'&&!busy){e.stopPropagation();onCancel()}
   if(e.key==='Tab'){const buttons=[...panel.current!.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];if(!buttons.length){e.preventDefault();return}const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
  }}>
   <h3 id={titleId}>{title}</h3><p id={messageId}>{message}</p>{error&&<p role="alert">{error}</p>}
   <div><button type="button" className="library-danger" disabled={busy} onClick={onConfirm}>{confirmLabel}</button><button ref={cancel} type="button" disabled={busy} onClick={onCancel}>{cancelLabel}</button></div>
  </div>
 </div>;
}
