/*
 * Dev Kayko — senha local do caixa.
 * PBKDF2 SHA-256 com salt aleatório (Web Crypto, GitHub Pages HTTPS).
 * Não substitui autenticação em servidor nem protege contra acesso físico
 * ao DevTools / localStorage do computador. Nunca salvamos senha legível.
 */
'use strict';
const CashSecurity=(()=>{
  const ITERATIONS=210000;
  const encoder=new TextEncoder();
  const bytesToBase64=arr=>btoa(String.fromCharCode(...arr));
  const base64ToBytes=str=>Uint8Array.from(atob(str),c=>c.charCodeAt(0));
  async function derive(password,salt,iterations){
    if(!globalThis.crypto?.subtle)throw Error('Senha indisponível neste navegador. Use o site HTTPS publicado no GitHub Pages.');
    const key=await crypto.subtle.importKey('raw',encoder.encode(password.normalize('NFKC')),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,256);
    return new Uint8Array(bits);
  }
  async function create(password){
    if(typeof password!=='string'||password.length<6||password.length>64)throw Error('A senha deve ter entre 6 e 64 caracteres.');
    if(!globalThis.crypto?.getRandomValues)throw Error('Criptografia indisponível neste navegador.');
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const hash=await derive(password,salt,ITERATIONS);
    return {salt:bytesToBase64(salt),hash:bytesToBase64(hash),iterations:ITERATIONS};
  }
  async function verify(password,settings){
    if(!settings)return false;
    const computed=await derive(password,base64ToBytes(settings.salt),settings.iterations);
    const expected=base64ToBytes(settings.hash);
    if(computed.length!==expected.length)return false;
    let diff=0;
    for(let i=0;i<computed.length;i++)diff|=computed[i]^expected[i];
    return diff===0;
  }
  // Código aleatório de 120 bits, exibido UMA única vez e nunca salvo em texto claro.
  // Alfabeto sem caracteres ambíguos (I/O/0/1).
  function generateRecoveryCode(){
    if(!globalThis.crypto?.getRandomValues)throw Error('Criptografia indisponível neste navegador.');
    const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes=crypto.getRandomValues(new Uint8Array(24));
    const characters=Array.from(bytes,b=>alphabet[b&31]).join('');
    return characters.match(/.{1,4}/g).join('-');
  }
  function normalizeRecoveryCode(value){
    return String(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  }
  return Object.freeze({create,verify,generateRecoveryCode,normalizeRecoveryCode});
})();
