'use strict';
const Access=(()=>{
 let role=null,employee=null,selection='owner',loginBusy=false,printRecovery=null;
 const $=id=>document.getElementById(id);
 const isOwner=()=>role==='owner',isOperator=()=>role==='operator',isLoggedIn=()=>!!role;
 const actor=()=>isOwner()?{role:'Dono',name:String(db.settings.ownerName||'Dono').trim()||'Dono',id:null}:employee?{role:'Funcionário',name:employee.name,id:employee.id}:null;
 function requireOwner(){if(isOwner())return true;alert('Somente o dono pode acessar esta área.');return false;}
 function choose(next){selection=next;for(const key of ['owner','operator']){const el=$('login'+(key==='owner'?'Owner':'Operator'));el.classList.toggle('selected',key===next);el.setAttribute('aria-pressed',String(key===next));}
 $('loginOperator').disabled=!db.security;
 $('loginPasswordWrap').hidden=next!=='owner';$('loginPasswordConfirmWrap').hidden=next!=='owner'||!!db.security;
 $('loginPassword').required=next==='owner';$('loginPasswordConfirm').required=next==='owner'&&!db.security;
 $('loginSubmit').textContent=next==='owner'?db.security?'Entrar como dono':'Criar senha do dono':'Entrar no PDV sem senha';
 $('forgotOwnerPassword').hidden=next!=='owner'||!db.security;
 $('loginHelp').textContent=next==='owner'?'Informe a senha do dono.':'Escolha seu nome antes de iniciar o atendimento.';
 $('loginError').hidden=true;$('loginPassword').value='';$('loginPasswordConfirm').value='';}
 function showLogin(){role=null;employee=null;document.body.classList.add('login-locked');document.body.classList.remove('role-owner','role-operator');$('loginOverlay').hidden=false;choose(db.security?'operator':'owner');$('roleBadge').textContent='Acesso restrito';}
 async function login(event){event?.preventDefault();if(loginBusy)return;
 if(selection==='operator'){
   $('employeeSelect').innerHTML='<option value="">Selecione seu nome</option>'+db.employees.map(e=>`<option value="${safe(e.id)}">${safe(e.name)}</option>`).join('');
   $('emptyEmployees').hidden=db.employees.length>0;$('confirmEmployeeSelect').disabled=!db.employees.length;$('employeeSelectOverlay').hidden=false;return;
 }
 loginBusy=true;try{const pw=$('loginPassword').value;if(!db.security){if(pw!==$('loginPasswordConfirm').value)throw Error('As senhas não conferem');const credentials=await CashSecurity.create(pw);commit(()=>db.security=credentials);}else if(!await CashSecurity.verify(pw,db.security))throw Error('Senha do dono incorreta');
 enter('owner');if(!db.recoverySecurity)await generateRecovery();
 }catch(e){$('loginError').hidden=false;$('loginError').textContent=e.message;}finally{loginBusy=false;}}
 function enter(next){role=next;document.body.classList.remove('login-locked');document.body.classList.toggle('role-owner',isOwner());document.body.classList.toggle('role-operator',isOperator());$('loginOverlay').hidden=true;$('roleBadge').textContent=isOwner()?'👑 Dono':'👤 Funcionário';$('pdvProfile').textContent=actor()?.name||'Dono';go(isOwner()?'inicio':'caixa');render();}
 function staffLogin(){const e=db.employees.find(x=>x.id===$('employeeSelect').value);if(!e)return;employee={id:e.id,name:e.name};$('employeeSelectOverlay').hidden=true;enter('operator');}
 function logout(){cart.length=0;showLogin();document.body.classList.remove('pdv-focus');document.fullscreenElement&&document.exitFullscreen().catch(()=>{});}
 async function changeOwner(){if(!requireOwner())return;const old=prompt('Senha atual do dono:');if(old===null)return;if(!await CashSecurity.verify(old,db.security))return alert('Senha incorreta');const next=prompt('Nova senha do dono (mínimo 6 caracteres):');if(next===null)return;if(db.cashSecurity&&await CashSecurity.verify(next,db.cashSecurity))return alert('Use uma senha diferente da senha do caixa');try{const v=await CashSecurity.create(next);commit(()=>db.security=v);alert('Senha atualizada');}catch(e){alert(e.message);}}
 async function configureCash(){if(!requireOwner())return;const pw=prompt('Confirme a senha do dono:');if(pw===null)return;if(!await CashSecurity.verify(pw,db.security))return alert('Senha incorreta');$('cashAccessOverlay').hidden=false;}
 async function saveCash(event){event.preventDefault();const form=new FormData($('cashAccessForm'));if(!await CashSecurity.verify(form.get('ownerPassword'),db.security))return alert('Senha do dono incorreta');if(form.get('newPassword')!==form.get('confirmPassword'))return alert('Senhas diferentes');if(await CashSecurity.verify(form.get('newPassword'),db.security))return alert('Use uma senha diferente da senha do dono');try{const record=await CashSecurity.create(form.get('newPassword'));commit(()=>db.cashSecurity=record);$('cashAccessOverlay').hidden=true;render();}catch(e){alert(e.message);}}
 function showRecoveryCode(code){printRecovery=code;$('recoveryCodeText').textContent=code;$('recoveryCodeOverlay').hidden=false;}
 async function generateRecovery(){if(!isOwner())return;const code=CashSecurity.recoveryCode();const verifier=await CashSecurity.create(CashSecurity.normalizeCode(code));if(commit(()=>db.recoverySecurity=verifier))showRecoveryCode(code);}
 async function renewRecovery(){if(!isOwner())return;const pw=prompt('Digite a senha do dono para gerar outro código:');if(pw===null)return;if(!await CashSecurity.verify(pw,db.security))return alert('Senha incorreta');if(confirm('O código antigo será invalidado. Continuar?'))await generateRecovery();}
 function showRecovery(){const usable=!!db.recoverySecurity;$('recoverOwnerMessage').textContent=usable?'Informe seu código salvo anteriormente para redefinir a senha.':'Não existe código configurado. Sem senha do dono e sem código de recuperação não é possível redefinir pelo site.';$('recoverOwnerForm').hidden=!usable;$('recoverOwnerOverlay').hidden=false;}
 async function recover(event){event.preventDefault();const form=new FormData(event.currentTarget);if(!db.recoverySecurity)return;if(!await CashSecurity.verify(CashSecurity.normalizeCode(form.get('code')),db.recoverySecurity))return $('recoverOwnerError').textContent='Código inválido',$('recoverOwnerError').hidden=false;
 if(form.get('password')!==form.get('confirmation'))return alert('Senhas diferentes');if(db.cashSecurity&&await CashSecurity.verify(form.get('password'),db.cashSecurity))return alert('Use senha diferente da senha do caixa');try{const newSec=await CashSecurity.create(form.get('password'));commit(()=>{db.security=newSec;db.recoverySecurity=null;});$('recoverOwnerOverlay').hidden=true;choose('owner');alert('Senha alterada. Entre como dono; um novo código será gerado.');}catch(e){alert(e.message);}}
 const cashCredential=action=>action==='exit'?db.security:db.cashSecurity;
 function init(){
 $('loginOwner').onclick=()=>choose('owner');$('loginOperator').onclick=()=>choose('operator');$('loginForm').onsubmit=login;
 $('confirmEmployeeSelect').onclick=staffLogin;$('cancelEmployeeSelect').onclick=()=>$('employeeSelectOverlay').hidden=true;
 for(const id of ['switchUser','pdvSwitchUser'])$(id).onclick=logout;
 $('changeCashPassword').onclick=changeOwner;$('configureCashPassword').onclick=configureCash;$('cancelCashAccess').onclick=()=>$('cashAccessOverlay').hidden=true;$('cashAccessForm').onsubmit=saveCash;
 $('forgotOwnerPassword').onclick=showRecovery;$('cancelOwnerRecovery').onclick=()=>$('recoverOwnerOverlay').hidden=true;$('recoverOwnerForm').onsubmit=recover;
 $('renewRecoveryCode').onclick=renewRecovery;$('closeRecoveryCode').onclick=()=>{$('recoveryCodeText').textContent='';printRecovery=null;$('recoveryCodeOverlay').hidden=true;};
 $('copyRecoveryCode').onclick=()=>printRecovery&&navigator.clipboard?.writeText(printRecovery).catch(()=>alert('Copie o código manualmente.'));
 $('downloadRecoveryCode').onclick=()=>printRecovery&&downloadBlob('Código de recuperação do dono — Sorveteria Manager:\n'+printRecovery+'\nGuarde em local seguro.','sorveteria-recuperacao.txt','text/plain');
 showLogin();}
 return{init,isOwner,isOperator,isLoggedIn,actor,cashCredential,requireOwner,logout,choose};
})();
