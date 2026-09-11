'use client'
import {useEffect,useState} from 'react'
export default function AdminModeToggle(){const [advanced,setAdvanced]=useState(false);useEffect(()=>setAdvanced(localStorage.getItem('admin_mode')==='advanced'),[]);function toggle(){const next=!advanced;setAdvanced(next);localStorage.setItem('admin_mode',next?'advanced':'simple');window.dispatchEvent(new Event('admin-mode-change'))}return <button className="button" type="button" onClick={toggle}>{advanced?'Advanced admin':'Simple admin'} · switch</button>}
