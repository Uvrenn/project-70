const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const plan={
Monday:{name:'Upper A',focus:'Chest · Shoulders · Triceps · Back',items:[['Push-ups','3 × 6–12'],['Dumbbell floor press','3 × 10–15'],['Resistance band rows','3 × 12–15'],['Shoulder press','2 × 10–12'],['Lateral raises','2 × 12–15'],['Triceps extension','2 × 12–15']]},
Tuesday:{name:'Lower A',focus:'Quads · Glutes · Core',items:[['Bodyweight squats','3 × 12–15'],['Split squats','3 × 8–10 each'],['Dumbbell Romanian deadlift','3 × 12–15'],['Glute bridges','3 × 12–15'],['Calf raises','2 × 15'],['Dead bugs','2 × 10 each']]},
Thursday:{name:'Upper B',focus:'Back · Biceps · Chest · Shoulders',items:[['Resistance band rows','3 × 12–15'],['Push-ups','3 × 6–12'],['Dumbbell rows','3 × 12–15'],['Hammer curls','2 × 12–15'],['Alternate curls','2 × 10–12'],['Reverse fly','2 × 12–15']]},
Saturday:{name:'Lower B',focus:'Hamstrings · Glutes · Calves · Core',items:[['Reverse lunges','3 × 10 each'],['Dumbbell Romanian deadlift','3 × 12–15'],['Single-leg glute bridges','2 × 10 each'],['Sumo squats','3 × 12–15'],['Calf raises','2 × 15'],['Plank','2 × 20–40 sec']]}
};
const defaults={xp:0,workouts:[],checks:{},exerciseChecks:{},protein:{},spending:{},strengthLogs:[],reminders:{workout:'16:30',meal:'19:30',recovery:'21:30'},notified:{}};
let state=load(),selectedDay=['Monday','Tuesday','Thursday','Saturday'].includes(days[new Date().getDay()])?days[new Date().getDay()]:'Monday';
function load(){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem('p70state')||'{}'))}catch(e){return JSON.parse(JSON.stringify(defaults))}}
function localDateKey(date){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')}
function key(){return localDateKey(new Date())}
function dateFromKey(dateKey){const parts=dateKey.split('-').map(Number);return new Date(parts[0],parts[1]-1,parts[2],12,0,0)}
function displayDate(date,options={weekday:'long',day:'numeric',month:'long',year:'numeric'}){return new Intl.DateTimeFormat(undefined,options).format(date)}
let calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1,12);
let calendarSelected=key();
let lastLiveDate=key();
function updateLiveClock(){
 const now=new Date();
 $('#liveTime').textContent=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).format(now);
 $('#liveDate').textContent=new Intl.DateTimeFormat(undefined,{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(now)+' · '+(Intl.DateTimeFormat().resolvedOptions().timeZone||'Local time');
 const today=key();
 if(today!==lastLiveDate){lastLiveDate=today;calendarMonth=new Date(now.getFullYear(),now.getMonth(),1,12);calendarSelected=today;render();}
}
function calendarSummary(dateKey){
 const workouts=state.workouts.filter(x=>x.date===dateKey);
 const checks=state.checks[dateKey]||[];
 const proteins=state.protein[dateKey]||[];
 const spending=state.spending[dateKey]||[];
 const strength=state.strengthLogs.filter(x=>localDateKey(new Date(x.time))===dateKey);
 return {workouts,checks,proteins,spending,strength,proteinTotal:proteins.reduce((a,x)=>a+Number(x.grams||0),0),spendTotal:spending.reduce((a,x)=>a+Number(x.amount||0),0),hasActivity:workouts.length+checks.length+proteins.length+spending.length+strength.length>0};
}
function renderCalendarDetail(){
 const d=dateFromKey(calendarSelected),s=calendarSummary(calendarSelected);
 $('#calendarSelectedDate').textContent=displayDate(d);
 const facts=[];
 if(s.workouts.length)facts.push(['WORKOUT',s.workouts.map(x=>safe(x.name)).join(', ')]);
 facts.push(['CHECKPOINTS',s.checks.length+' / 4 completed']);
 facts.push(['PROTEIN',s.proteinTotal+' g · '+s.proteins.length+' entries']);
 facts.push(['SPENDING','₹'+s.spendTotal+' · '+s.spending.length+' entries']);
 if(s.strength.length)facts.push(['STRENGTH LOGS',s.strength.length+' recorded']);
 $('#calendarSelectedStats').innerHTML=facts.map(x=>'<div class="calendar-stat"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')||'<p class="tiny">No tracking entries for this date yet.</p>';
}
function renderCalendar(){
 const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth();
 $('#calendarMonth').textContent=new Intl.DateTimeFormat(undefined,{month:'long',year:'numeric'}).format(calendarMonth);
 const firstOffset=(new Date(year,month,1,12).getDay()+6)%7;
 const totalDays=new Date(year,month+1,0,12).getDate();
 const cells=[];
 for(let i=0;i<firstOffset;i++)cells.push('<span class="calendar-empty" aria-hidden="true"></span>');
 for(let day=1;day<=totalDays;day++){
   const date=new Date(year,month,day,12),dateKey=localDateKey(date),summary=calendarSummary(dateKey);
   const classes=['calendar-day'];
   if(dateKey===key())classes.push('is-today');
   if(dateKey===calendarSelected)classes.push('is-selected');
   if(summary.hasActivity)classes.push('has-activity');
   cells.push('<button type="button" class="'+classes.join(' ')+'" data-calendar-date="'+dateKey+'" aria-label="'+displayDate(date)+ (summary.hasActivity?', activity recorded':'') +'">'+day+(summary.hasActivity?'<i></i>':'')+'</button>');
 }
 $('#calendarDays').innerHTML=cells.join('');
 $('[data-calendar-date]').forEach(button=>button.onclick=()=>{calendarSelected=button.dataset.calendarDate;renderCalendar()});
 renderCalendarDetail();
}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function save(){localStorage.setItem('p70state',JSON.stringify(state));render()}
function toast(s){const t=$('#toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function completed(day,date=key()){return state.workouts.some(w=>w.day===day&&w.date===date)}
function mondayOf(d){const x=new Date(d);x.setHours(12,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x.toLocaleDateString('en-CA')}
function streak(){const w={};state.workouts.forEach(x=>w[mondayOf(new Date(x.date+'T12:00:00'))]=(w[mondayOf(new Date(x.date+'T12:00:00'))]||0)+1);let cursor=mondayOf(new Date()),n=0;while(w[cursor]>=4){n++;const d=new Date(cursor+'T12:00:00');d.setDate(d.getDate()-7);cursor=mondayOf(d)}return n}
function renderHeader(){const rank=state.xp>=1000?'A · ELITE':state.xp>=500?'B · VETERAN':state.xp>=200?'C · BUILDER':state.xp>=50?'D · APPRENTICE':'E · INITIATE';$('#rankBadge').textContent='RANK '+rank;$('#xpValue').textContent=state.xp+' XP';const ws=mondayOf(new Date());const n=state.workouts.filter(w=>w.date>=ws&&w.date<=key()).length;$('#weekCount').textContent=n;$('#weekProgress').style.width=Math.min(100,n/4*100)+'%';$('#budgetValue').textContent=(state.spending[key()]||[]).reduce((a,x)=>a+x.amount,0)}
function renderToday(){const d=days[new Date().getDay()],rest=!plan[d],p=plan[d]||{name:'Recovery day',items:[['Gentle walk or mobility','Optional']]};$('#dateLabel').textContent=new Date().toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});$('#todayDay').textContent=d.toUpperCase();$('#todayWorkout').textContent=p.name;$('#todayTag').textContent=rest?'RECOVERY QUEST':'TRAINING QUEST';$('#todayDesc').textContent=rest?'Take a rest day or choose gentle movement.':'Your scheduled training quest. Use controlled technique and stop if anything feels wrong.';$('#todayExerciseList').innerHTML=p.items.slice(0,4).map(x=>'<span class="pill">'+safe(x[0])+'</span>').join('');$('#openWorkoutBtn').textContent=rest?'OPEN RECOVERY QUEST ↗':'OPEN TRAINING QUEST ↗';const checks=['Workout / gentle movement','Balanced meals','Protein source included','Sleep and recovery'],obj=state.checks[key()]||[];$('#dailyChecks').innerHTML=checks.map((x,i)=>'<label class="check"><input type="checkbox" data-check="'+i+'" '+(obj.includes(i)?'checked':'')+'>'+x+'</label>').join('');$('#checkCount').textContent=obj.length+' / 4';$$('[data-check]').forEach(e=>e.onchange=()=>{let a=state.checks[key()]||[];const i=Number(e.dataset.check);a=e.checked?a.concat(i):a.filter(x=>x!==i);state.checks[key()]=a;save()})}
function renderTraining(){$('#daySelector').innerHTML=['Monday','Tuesday','Thursday','Saturday'].map(d=>'<button class="day-btn '+(d===selectedDay?'active':'')+'" data-day="'+d+'">'+d.slice(0,3).toUpperCase()+'<small>'+plan[d].name+'</small></button>').join('');$$('[data-day]').forEach(b=>b.onclick=()=>{selectedDay=b.dataset.day;renderTraining()});const p=plan[selectedDay],done=completed(selectedDay),checks=state.exerciseChecks[selectedDay]||[];$('#workoutTag').textContent=selectedDay.toUpperCase();$('#workoutName').textContent=p.name;$('#workoutFocus').textContent=p.focus;$('#exerciseList').innerHTML=p.items.map((x,i)=>'<label class="exercise"><input type="checkbox" data-ex="'+i+'" '+(checks.includes(i)?'checked':'')+' '+(done?'disabled':'')+'><span><b>'+safe(x[0])+'</b><small>Controlled reps · leave 2–3 reps in reserve</small></span><strong>'+x[1]+'</strong></label>').join('');$$('[data-ex]').forEach(e=>e.onchange=()=>{let a=state.exerciseChecks[selectedDay]||[];let i=Number(e.dataset.ex);a=e.checked?a.concat(i):a.filter(x=>x!==i);state.exerciseChecks[selectedDay]=a;save()});$('#workoutDoneText').textContent=done?'Session already logged':checks.length+' / '+p.items.length+' exercises checked';$('#completeWorkoutBtn').disabled=done;$('#completeWorkoutBtn').textContent=done?'SESSION LOGGED ✓':'COMPLETE SESSION + XP'}
function renderNutrition(){const k=key(),p=state.protein[k]||[],s=state.spending[k]||[],pt=p.reduce((a,x)=>a+x.grams,0),st=s.reduce((a,x)=>a+x.amount,0);$('#proteinTotal').textContent=pt;$('#proteinProgress').style.width=Math.min(100,pt)+'%';$('#spendTotal').textContent=st;$('#spendProgress').style.width=Math.min(100,st/300*100)+'%';$('#proteinEntries').innerHTML=p.map((x,i)=>'<div class="entry">'+safe(x.name)+' · '+x.grams+' g <button data-rp="'+i+'">REMOVE</button></div>').join('')||'<p class="tiny">No entries yet.</p>';$('#spendEntries').innerHTML=s.map((x,i)=>'<div class="entry">'+safe(x.name)+' · ₹'+x.amount+' <button data-rs="'+i+'">REMOVE</button></div>').join('')||'<p class="tiny">No purchases yet.</p>';$$('[data-rp]').forEach(b=>b.onclick=()=>{state.protein[k].splice(Number(b.dataset.rp),1);save()});$$('[data-rs]').forEach(b=>b.onclick=()=>{state.spending[k].splice(Number(b.dataset.rs),1);save()})}
function renderHistory(){const items=state.workouts.slice().sort((a,b)=>b.time-a.time).slice(0,20);$('#historyList').innerHTML=items.map(x=>'<div class="entry">'+safe(x.day)+' · '+new Date(x.time).toLocaleDateString()+' <b>+'+x.xp+' XP · '+safe(x.name)+'</b></div>').join('')||'<p class="tiny">No sessions logged yet.</p>';const s=streak();$('#streakBadge').textContent=s+' WEEK STREAK';const n=state.workouts.length;const achievements=[['First Quest','Complete your first session',n>=1,'⚔'],['Three Sessions','Complete 3 sessions',n>=3,'🔥'],['Full Week','Complete 4 sessions',n>=4,'🏅'],['Consistency I','Complete 4 sessions in 2 weeks',s>=2,'🌱'],['Consistency II','Complete 4 sessions in 4 weeks',s>=4,'🌟'],['XP Collector','Earn 100 XP',state.xp>=100,'💎'],['Veteran','Earn 500 XP',state.xp>=500,'👑'],['Logbook Keeper','Record a strength result',state.strengthLogs.length>0,'📈']];$('#achievementGrid').innerHTML=achievements.map(a=>'<div class="achievement '+(a[2]?'unlocked':'')+'"><span>'+a[3]+'</span><div><b>'+a[0]+'</b><small>'+a[1]+'</small></div><strong>'+(a[2]?'UNLOCKED':'LOCKED')+'</strong></div>').join('');$('#workoutTime').value=state.reminders.workout;$('#mealTime').value=state.reminders.meal;$('#recoveryTime').value=state.reminders.recovery;const names=Array.from(new Set(state.strengthLogs.map(x=>x.exercise))),old=$('#chartExercise').value;$('#chartExercise').innerHTML='<option value="">Choose an exercise</option>'+names.map(x=>'<option>'+safe(x)+'</option>').join('');$('#chartExercise').value=names.includes(old)?old:(names[names.length-1]||'');$('#strengthEntries').innerHTML=state.strengthLogs.slice(-6).reverse().map(x=>'<div class="entry">'+safe(x.exercise)+' · '+x.value+' reps · '+new Date(x.time).toLocaleDateString()+'</div>').join('')||'<p class="tiny">Log a result to start tracking.</p>';drawChart()}
function drawChart(){const c=$('#strengthChart'),name=$('#chartExercise').value,arr=state.strengthLogs.filter(x=>x.exercise===name).slice(-12),w=c.clientWidth||600,h=170,d=window.devicePixelRatio||1;c.width=w*d;c.height=h*d;const x=c.getContext('2d');x.scale(d,d);x.clearRect(0,0,w,h);x.strokeStyle='#35445b';for(let i=0;i<4;i++){x.beginPath();x.moveTo(24,14+i*45);x.lineTo(w-10,14+i*45);x.stroke()}if(!arr.length){x.fillStyle='#91a0b9';x.font='12px sans-serif';x.fillText('Log the same exercise more than once to compare',24,90);return}const max=Math.max(5,...arr.map(v=>v.value));x.strokeStyle='#63e6d2';x.lineWidth=3;x.beginPath();arr.forEach((v,i)=>{const px=24+(arr.length===1?(w-44)/2:i*(w-44)/(arr.length-1)),py=14+(max-v.value)/max*135;i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();x.fillStyle='#c4f36b';arr.forEach((v,i)=>{const px=24+(arr.length===1?(w-44)/2:i*(w-44)/(arr.length-1)),py=14+(max-v.value)/max*135;x.beginPath();x.arc(px,py,4,0,Math.PI*2);x.fill()})}
function render(){renderHeader();renderToday();renderTraining();renderNutrition();renderHistory();renderCalendar()}
$$('.tab').forEach(b=>b.onclick=()=>{$$('.tab').forEach(x=>x.classList.toggle('active',x===b));$$('.view').forEach(v=>v.classList.toggle('active',v.id===b.dataset.tab+'View'));if(b.dataset.tab==='history')drawChart()});
$('#openWorkoutBtn').onclick=()=>{$('[data-tab="training"]').click();if(plan[days[new Date().getDay()]])selectedDay=days[new Date().getDay()];renderTraining()};
$('#completeWorkoutBtn').onclick=()=>{if(!confirm('Only log this session if you are medically cleared and completed it safely. Did you complete it?'))return;if(completed(selectedDay))return;const p=plan[selectedDay],xp=25;state.workouts.push({day:selectedDay,name:p.name,date:key(),time:Date.now(),xp:xp});state.xp+=xp;save();toast('Quest complete · +25 XP')};
$('#addProteinBtn').onclick=()=>{const name=$('#proteinFood').value.trim(),grams=Number($('#proteinGrams').value);if(!name||!Number.isFinite(grams)||grams<=0){toast('Enter a food and valid amount');return}state.protein[key()]=state.protein[key()]||[];state.protein[key()].push({name:name,grams:grams});$('#proteinFood').value='';$('#proteinGrams').value='';save()};
$('#addSpendBtn').onclick=()=>{const name=$('#spendItem').value.trim(),amount=Number($('#spendAmount').value);if(!name||!Number.isFinite(amount)||amount<=0){toast('Enter an item and valid cost');return}state.spending[key()]=state.spending[key()]||[];state.spending[key()].push({name:name,amount:amount});$('#spendItem').value='';$('#spendAmount').value='';save()};
$('#addStrengthBtn').onclick=()=>{const exercise=$('#strengthExercise').value.trim(),value=Number($('#strengthValue').value);if(!exercise||!Number.isFinite(value)||value<=0){toast('Enter an exercise and valid result');return}state.strengthLogs.push({exercise:exercise,value:value,time:Date.now()});$('#strengthExercise').value='';$('#strengthValue').value='';save();toast('Strength result logged')};
$('#chartExercise').onchange=drawChart;window.addEventListener('resize',drawChart);
$('#calendarPrev').onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1,12);renderCalendar()};
$('#calendarNext').onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1,12);renderCalendar()};
$('#calendarToday').onclick=()=>{const now=new Date();calendarMonth=new Date(now.getFullYear(),now.getMonth(),1,12);calendarSelected=key();renderCalendar()};
$('#enableNotifBtn').onclick=async()=>{if(!('Notification'in window)){toast('Notifications are not supported');return}const p=await Notification.requestPermission();$('#notifStatus').textContent=p==='granted'?'Enabled':p==='denied'?'Blocked':'Not enabled'};
$('#saveRemindersBtn').onclick=()=>{state.reminders={workout:$('#workoutTime').value,meal:$('#mealTime').value,recovery:$('#recoveryTime').value};state.notified={};save();toast('Reminder times saved')};
function checkReminders(){if(!('Notification'in window)||Notification.permission!=='granted')return;const hm=new Date().toTimeString().slice(0,5),k=key();[['workout','Workout quest','Your scheduled training window is here.'],['meal','Meal check-in','Time for a balanced meal.'],['recovery','Recovery check','Wind down and make room for sleep.']].forEach(r=>{const token=k+'-'+r[0];if(state.reminders[r[0]]===hm&&!state.notified[token]){new Notification('Project 70 · '+r[1],{body:r[2],icon:'icon.svg'});state.notified[token]=true;localStorage.setItem('p70state',JSON.stringify(state))}})}
setInterval(checkReminders,30000);checkReminders();
$('#settingsBtn').onclick=()=>$('#settingsDialog').showModal();
$('#exportBtn').onclick=()=>{const a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.href=u;a.download='project70-backup.json';a.click();URL.revokeObjectURL(u)};
$('#resetBtn').onclick=()=>{if(confirm('Clear all Project 70 logs stored in this browser?')){state=JSON.parse(JSON.stringify(defaults));save();$('#settingsDialog').close()}};
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
$('#notifStatus').textContent=('Notification'in window&&Notification.permission==='granted')?'Enabled':'Not enabled';render();updateLiveClock();setInterval(updateLiveClock,1000);