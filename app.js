/* Nova: TF-IDF intent chatbot with utilities, entities and confidence */
(function(){
'use strict';
const INTENTS=[
{id:'greet',t:['hello','hi','hey','good morning','good evening','hey there','hii','namaste','hello nova','hi there','yo'],r:["Hello! Good to see you. What can I do for you?","Hey! How can I help today?","Hi there! Ask me anything - math, jokes, the time, or just chat."]},
{id:'howareyou',t:['how are you','how are you doing','how do you feel','are you ok','how is it going','whats up','what is up'],r:["Running at full speed, thanks for asking! How about you?","All circuits happy here. How are you doing?","Doing great - every chat makes my day better. You?"]},
{id:'good',t:['i am good','i am fine','doing great','i am happy','feeling good','i am okay'],r:["Love to hear it! What shall we do next?","Great! Want a joke, a math trick, or something useful?"]},
{id:'bad',t:['i am sad','i feel bad','i am tired','feeling low','i am bored','not good','i am upset'],r:["Sorry to hear that. Want a joke to lift the mood, or a motivational quote?","Rough days happen. I can tell you a joke or share a quote - just say the word."]},
{id:'name',t:['what is your name','who are you','your name','tell me about yourself','what are you'],r:["I'm Nova, a chatbot that runs completely inside your browser. No servers, no accounts - just JavaScript and a TF-IDF brain."]},
{id:'myname',t:['my name is','call me','i am','this is'],r:null}, // handled specially
{id:'remember',t:['what is my name','do you know my name','who am i'],r:null},
{id:'joke',t:['tell me a joke','joke','make me laugh','another joke','funny','say something funny'],r:null},
{id:'quote',t:['motivate me','motivation','quote','inspire me','give me a quote','motivational quote'],r:null},
{id:'time',t:['what time is it','current time','time now','tell me the time','time please'],r:null},
{id:'date',t:['what is the date','today date','what day is it','day today','date today','which day'],r:null},
{id:'math',t:['calculate','what is','solve','math','compute','how much is'],r:null},
{id:'weather',t:['weather','is it raining','temperature outside','weather today'],r:["I can't see live weather (no network calls here), but for Mumbai-style humidity, carrying water is never wrong. For a real forecast, try a weather app."]},
{id:'thanks',t:['thank you','thanks','thank you so much','thx','thanks a lot'],r:["You're welcome!","Anytime!","Happy to help."]},
{id:'bye',t:['bye','goodbye','see you','good night','talk later','got to go'],r:["Bye! Come back anytime.","See you! I'll be right here, running offline as usual.","Good night! Take care."]},
{id:'help',t:['help','what can you do','features','commands','abilities','what all can you do'],r:null},
{id:'creator',t:['who made you','who created you','who built you','your developer','your creator'],r:["I was built by Akash Vishwakarma as a fully client-side chatbot. My whole brain is one JavaScript file you can read on GitHub."]},
{id:'age',t:['how old are you','your age','when were you born'],r:["I was compiled recently and I never age. Perks of being software."]},
{id:'love',t:['i love you','do you love me','i like you','you are cute'],r:["That's very kind! I like our chats too.","Aww. I'm flattered in binary."]},
{id:'coin',t:['flip a coin','coin flip','toss a coin','heads or tails'],r:null},
{id:'dice',t:['roll a dice','roll a die','dice roll','random number'],r:null},
{id:'count',t:['count words','word count','how many words','count letters'],r:null},
{id:'food',t:['i am hungry','what should i eat','food suggestions','best food'],r:["If you're in India: a hot vada pav or dosa rarely disappoints. I can't order food, but I support the craving."]},
{id:'study',t:['how to study','study tips','exam tips','how to focus'],r:["Try 25-minute focused blocks with 5-minute breaks (Pomodoro), phone in another room, and teach the topic out loud to check understanding. Works better than re-reading."]},
{id:'code',t:['can you code','write code','programming help','learn coding'],r:["I can chat about coding! For real code generation you'll want a bigger model, but I can share tips: start with small projects, read error messages fully, and build things you'd actually use."]},
{id:'sing',t:['sing a song','sing for me','sing'],r:["🎵 01101000 01100101 01101100 01101100 01101111... that's 'hello' in binary. I never claimed to be a good singer."]},
];
const JOKES=["Why do programmers prefer dark mode? Because light attracts bugs.","I told my computer I needed a break, and it said no problem - it will go to sleep.","Why did the math book look sad? Too many problems.","There are only 10 kinds of people: those who understand binary and those who don't.","Why do Java developers wear glasses? Because they don't C#.","My friend asked if I could stop making programming jokes. I said: I can't, it's a class thing.","A SQL query walks into a bar, sees two tables and asks... 'Can I join you?'","Why was the JavaScript developer sad? He didn't Node how to Express himself."];
const QUOTES=["Small progress every day beats a perfect plan that never starts.","You don't have to be great to start, but you have to start to be great.","Discipline is choosing what you want most over what you want now.","The expert in anything was once a beginner.","Done is better than perfect.","Your only limit is the one you accept."];

/* --- TF-IDF --- */
const tok=s=>s.toLowerCase().replace(/[^a-z0-9%\s']/g,' ').split(/\s+/).filter(Boolean);
const docs=INTENTS.map(it=>({id:it.id,vec:{},len:0}));
const df={};const allT=[];
INTENTS.forEach((it,di)=>{
  const tf={};
  it.t.forEach(p=>tok(p).forEach(w=>{tf[w]=(tf[w]||0)+1}));
  Object.keys(tf).forEach(w=>df[w]=(df[w]||0)+1);
  docs[di].tf=tf;
});
const N=INTENTS.length;
docs.forEach(d=>{
  let len=0;
  for(const w in d.tf){const idf=Math.log(1+N/df[w]);const v=d.tf[w]*idf;d.vec[w]=v;len+=v*v}
  d.len=Math.sqrt(len);
});
function match(input){
  const tf={};tok(input).forEach(w=>tf[w]=(tf[w]||0)+1);
  const vec={};let len=0;
  for(const w in tf){if(!df[w])continue;const v=tf[w]*Math.log(1+N/df[w]);vec[w]=v;len+=v*v}
  len=Math.sqrt(len);
  let best=null,score=0;
  docs.forEach((d,i)=>{
    if(!d.len||!len)return;
    let dot=0;for(const w in vec)if(d.vec[w])dot+=vec[w]*d.vec[w];
    const s=dot/(d.len*len);
    if(s>score){score=s;best=INTENTS[i]}
  });
  return{intent:best,score};
}

/* --- entities/utilities --- */
function tryMath(s){
  const m=s.match(/(-?\d+\.?\d*)\s*%\s*of\s*(-?\d+\.?\d*)/i);
  if(m)return `= ${(+m[1]/100*+m[2]).toLocaleString(undefined,{maximumFractionDigits:4})} (${m[1]}% of ${m[2]})`;
  const expr=s.replace(/what is|calculate|solve|compute|how much is|equals|\?/gi,'').trim();
  if(!/^[-+*/().\d\s^]+$/.test(expr)||!/\d/.test(expr)||!/[+\-*/^]/.test(expr))return null;
  try{
    const val=Function('"use strict";return ('+expr.replace(/\^/g,'**')+')')();
    if(typeof val==='number'&&isFinite(val))return `= ${+val.toFixed(6)}`;
  }catch(e){}
  return null;
}
let userName=sessionStorage.getItem('nova-name');
function respond(input){
  const low=input.toLowerCase().trim();
  // name capture
  let m=low.match(/(?:my name is|call me|i am)\s+([a-z]{2,20})\b/);
  if(m&&!/good|fine|ok|okay|sad|bad|tired|bored|happy|hungry|sure|not/.test(m[1])){
    userName=m[1][0].toUpperCase()+m[1].slice(1);sessionStorage.setItem('nova-name',userName);
    return{text:`Nice to meet you, ${userName}! I'll remember your name for this session.`,conf:1};
  }
  if(/what is my name|do you know my name|who am i/.test(low)){
    return{text:userName?`You're ${userName}!`:"You haven't told me yet. Say 'my name is ...' and I'll remember for this session.",conf:1};
  }
  const math=tryMath(input);
  if(math)return{text:math,conf:1};
  if(/flip a coin|coin flip|toss/.test(low))return{text:`🪙 It's **${Math.random()<0.5?'Heads':'Tails'}**!`.replace('**',''),conf:1};
  if(/roll a (dice|die)|dice roll/.test(low))return{text:`🎲 You rolled a ${1+Math.floor(Math.random()*6)}.`,conf:1};
  const wc=low.match(/count (?:the )?words? in[:\s]+(.+)/);
  if(wc){const t=input.slice(input.toLowerCase().indexOf(wc[1].toLowerCase()));return{text:`That has ${t.trim().split(/\s+/).length} words and ${t.trim().length} characters.`,conf:1}}
  const{intent,score}=match(input);
  if(!intent||score<0.28){
    return{text:"I'm not sure about that one, and I won't make things up. Try: a joke, 'what time is it', '25 * 48', 'motivate me', or 'what can you do'.",conf:score};
  }
  switch(intent.id){
    case 'joke':return{text:JOKES[Math.floor(Math.random()*JOKES.length)],conf:score};
    case 'quote':return{text:'"'+QUOTES[Math.floor(Math.random()*QUOTES.length)]+'"',conf:score};
    case 'time':return{text:`It's ${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} right now.`,conf:score};
    case 'date':return{text:`Today is ${new Date().toLocaleDateString([],{weekday:'long',year:'numeric',month:'long',day:'numeric'})}.`,conf:score};
    case 'help':return{text:"Here's what I'm good at:\n- Small talk and motivation\n- Math: '12% of 850', '25 * 48', '18^2'\n- 'flip a coin', 'roll a dice'\n- Time and date\n- 'count words in ...'\n- Remembering your name for this session",conf:score};
    default:return{text:intent.r[Math.floor(Math.random()*intent.r.length)],conf:score};
  }
}

/* --- UI --- */
const chat=$('#chat'),inp=$('#inp');
const CHIPS=['Tell me a joke','What can you do?','12% of 850','Motivate me','Flip a coin','What time is it?'];
function addMsg(text,who,conf){
  const d=document.createElement('div');d.className='msg '+who;
  d.textContent=text;
  const meta=document.createElement('span');meta.className='meta';
  meta.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  d.appendChild(meta);
  if(who==='bot'&&conf!==undefined){
    const c=document.createElement('span');c.className='conf';
    const pct=Math.round(Math.min(1,conf)*100);
    c.innerHTML=`confidence <span class="bar"><i style="width:${Math.max(6,pct)}%"></i></span> ${pct}%`;
    d.appendChild(c);
  }
  chat.appendChild(d);chat.scrollTop=chat.scrollHeight;
}
function typing(){
  const d=document.createElement('div');d.className='msg bot';d.id='typing';
  d.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';
  chat.appendChild(d);chat.scrollTop=chat.scrollHeight;
}
function send(text){
  const v=(text||inp.value).trim();if(!v)return;
  inp.value='';addMsg(v,'user');typing();
  setTimeout(()=>{
    $('#typing').remove();
    const r=respond(v);addMsg(r.text,'bot',r.conf);
  },450+Math.random()*500);
}
$('#sendBtn').addEventListener('click',()=>send());
inp.addEventListener('keydown',e=>{if(e.key==='Enter')send()});
const chipsEl=$('#chips');
CHIPS.forEach(c=>{const b=document.createElement('button');b.className='chip';b.textContent=c;b.addEventListener('click',()=>send(c));chipsEl.appendChild(b)});
$('#clearBtn').addEventListener('click',()=>{chat.innerHTML='';greet();toast('Chat cleared')});
$('#exportBtn').addEventListener('click',()=>{
  const lines=[...chat.querySelectorAll('.msg')].map(m=>`${m.classList.contains('user')?'You':'Nova'}: ${m.childNodes[0].textContent}`);
  const a=document.createElement('a');a.download='nova-chat.txt';a.href=URL.createObjectURL(new Blob([lines.join('\n\n')],{type:'text/plain'}));a.click();
});
function greet(){addMsg(`Hi${userName?' '+userName:''}! I'm Nova. I run fully offline in your browser. Try a suggestion below or ask me something.`,'bot',1)}
greet();
})();
