'use strict';
const CashSecurity=(()=>{
 const encode=new TextEncoder();const to64=a=>btoa(String.fromCharCode(...a));const from64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 async function digest(pw,salt,iterations){if(!crypto.subtle)throw Error('Use HTTPS do GitHub Pages para utilizar senhas.');const key=await crypto.subtle.importKey('raw',encode.encode(String(pw).normalize('NFKC')),'PBKDF2',false,['deriveBits']);return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,256));}
 async function create(pw){if(String(pw).length<6||String(pw).length>64)throw Error('A senha deve ter de 6 a 64 caracteres.');const salt=crypto.getRandomValues(new Uint8Array(16)),iterations=210000;return{salt:to64(salt),iterations,hash:to64(await digest(pw,salt,iterations))};}
 async function verify(pw,stored){if(!stored)return false;try{const expected=from64(stored.hash),actual=await digest(pw,from64(stored.salt),stored.iterations);if(expected.length!==actual.length)return false;let n=0;for(let i=0;i<actual.length;i++)n|=expected[i]^actual[i];return n===0;}catch{return false;}}
 function recoveryCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',b=crypto.getRandomValues(new Uint8Array(24));return [...b].map(x=>alphabet[x&31]).join('').match(/.{4}/g).join('-');}
 return{create,verify,recoveryCode,normalizeCode:c=>String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'')};
})();
