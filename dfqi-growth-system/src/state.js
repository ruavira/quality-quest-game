const VISITOR_KEY='dfqi_visitor_id';
const SESSION_KEY='dfqi_admin_session';
const LAST_ROUTE='dfqi_last_route';
export function visitorId(){let id=localStorage.getItem(VISITOR_KEY);if(!id){id=crypto.randomUUID();localStorage.setItem(VISITOR_KEY,id)}return id}
export const getLastRoute=()=>localStorage.getItem(LAST_ROUTE)||'part2';
export const setLastRoute=r=>localStorage.setItem(LAST_ROUTE,r);
export function saveSession(s){sessionStorage.setItem(SESSION_KEY,JSON.stringify(s))}
export function getSession(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
export function clearSession(){sessionStorage.removeItem(SESSION_KEY)}
export function attribution(){const q=new URLSearchParams(location.search);return{source:q.get('utm_source')||q.get('source')||'direct',medium:q.get('utm_medium')||'',campaign:q.get('utm_campaign')||'',content:q.get('utm_content')||''}}
