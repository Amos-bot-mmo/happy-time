(function(){
const planets={Sun:'太陽',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星'};
const signs=['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'];
function instant(p){
 const [y,m,d]=p.date.split('-').map(Number),[h,n]=(p.certainty==='unknown'?'12:00':p.time).split(':').map(Number);
 const desired=Date.UTC(y,m-1,d,h,n); const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:p.zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const wall=t=>{const v=Object.fromEntries(fmt.formatToParts(new Date(t)).map(x=>[x.type,x.value]));return Date.UTC(+v.year,+v.month-1,+v.day,+v.hour,+v.minute)};
 let t=desired;for(let i=0;i<8;i++){let diff=desired-wall(t);t+=diff;if(!diff)break;}
 if(wall(t)!==desired)throw Error('此時間遇到夏令時間跳時，請改選時間。');
 if(wall(t-3600000)===desired||wall(t+3600000)===desired||wall(t-1800000)===desired||wall(t+1800000)===desired)throw Error('此時間因夏令時間結束而重複，試用版無法辨識；請改選時間。');
 return new Date(t);
}
function chart(p,full=true){if(!globalThis.Astronomy)throw Error('星曆引擎未載入，請確認 vendor 檔案已上傳。');const t=instant(p);return Object.fromEntries((full?Object.keys(planets):['Sun','Moon','Mercury','Venus','Mars']).map(k=>[k,Astronomy.Ecliptic(Astronomy.GeoVector(k,t,true)).elon]));}
function aspect(a,b){const delta=Math.abs(a-b)%360,distance=Math.min(delta,360-delta);const i=AstroRules.aspects.findIndex(x=>Math.abs(distance-x.angle)<=x.orb);return {distance,index:i,...(i<0?{name:'無相位',error:null}: {...AstroRules.aspects[i],error:Math.abs(distance-AstroRules.aspects[i].angle)})};}
function score(a,b){let sum=0,count=0;const rows=[];for(const g of AstroRules.groups){for(const [x,y] of g.pairs){const asp=aspect(a[x],b[y]);const coefficient=asp.index<0?0:g.c[asp.index];const contribution=.5*g.weight*coefficient/g.pairs.length;sum+=contribution;if(asp.index>=0)count++;rows.push({group:g.name,x,y,...asp,contribution});}}return {value:50+sum,count,rows,version:AstroRules.version};}
function position(deg){return signs[Math.floor(deg/30)%12]+' '+(deg%30).toFixed(2)+'°';}
globalThis.AstroEngine={planets,signs,instant,chart,aspect,score,position};
})();
