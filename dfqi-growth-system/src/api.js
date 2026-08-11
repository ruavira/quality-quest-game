import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './config.js';
import {getSession,saveSession,clearSession} from './state.js';

function headers(token, extra={}){return{'apikey':SUPABASE_PUBLISHABLE_KEY,'Authorization':`Bearer ${token||SUPABASE_PUBLISHABLE_KEY}`,'Content-Type':'application/json',...extra}}
async function parse(res){if(res.ok){if(res.status===204)return null;const t=await res.text();return t?JSON.parse(t):null}const text=await res.text();let message=text;try{const j=JSON.parse(text);message=j.message||j.error_description||j.hint||text}catch{}throw new Error(message||`Request failed (${res.status})`)}
export async function rpc(name,args={},token){return parse(await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:headers(token),body:JSON.stringify(args)}))}
export async function select(table,query='',token){return parse(await fetch(`${SUPABASE_URL}/rest/v1/${table}${query?`?${query}`:''}`,{headers:headers(token,{'Accept':'application/json'})}))}
export async function insert(table,row,token){return parse(await fetch(`${SUPABASE_URL}/rest/v1/${table}`,{method:'POST',headers:headers(token,{'Prefer':'return=representation'}),body:JSON.stringify(row)}))}
export async function patch(table,filter,row,token){return parse(await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`,{method:'PATCH',headers:headers(token,{'Prefer':'return=representation'}),body:JSON.stringify(row)}))}
export async function signIn(email,password){const data=await parse(await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{'apikey':SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})}));saveSession(data);return data}
export async function refreshSession(){const s=getSession();if(!s?.refresh_token)return null;try{const data=await parse(await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{'apikey':SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})}));saveSession(data);return data}catch{clearSession();return null}}
export async function currentUser(token){return parse(await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:headers(token)}))}
export async function signOut(){const s=getSession();if(s?.access_token){try{await fetch(`${SUPABASE_URL}/auth/v1/logout`,{method:'POST',headers:headers(s.access_token)})}catch{}}clearSession()}
export async function requireSession(){let s=getSession();if(!s)return null;const expires=(s.expires_at||0)*1000;if(Date.now()>expires-60000)s=await refreshSession();return s}
