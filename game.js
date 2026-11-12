import * as THREE from 'three';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050814);
scene.fog = new THREE.FogExp2(0x080f22, 0.0065);
const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, .1, 180);
camera.position.set(0, 1.2, -15.5);
camera.lookAt(0, 0, 22);
scene.add(new THREE.HemisphereLight(0x9acfff, 0x11112b, 1.2));
const keyLight = new THREE.DirectionalLight(0xc0eaff, 2.3); keyLight.position.set(-4, 8, -8); scene.add(keyLight);
const pinkLight = new THREE.PointLight(0xff3f98, 18, 30); pinkLight.position.set(5, 2, 15); scene.add(pinkLight);
const cyanLight = new THREE.PointLight(0x30ddff, 18, 26); cyanLight.position.set(-4, -2, -4); scene.add(cyanLight);

const mat = (color, emissive = 0x000000, intensity = 0, metalness = .4, roughness = .3) => new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: intensity, metalness, roughness });
const shipMat = mat(0x344c68, 0x07192b, .45, .82, .25);
const trimMat = mat(0x9ceeff, 0x20bde9, 1.7, .65, .25);
const darkMat = mat(0x0b162b, 0x070b1e, .6, .7, .3);
const enemyMat = mat(0x9c456d, 0x8d123f, 1.05, .6, .27);
const enemyGlow = mat(0xffa4c4, 0xff286a, 2.3, .3, .22);
const asteroidMat = mat(0x75401f, 0x321205, .32, .3, .88);
const asteroidFlameOuter = new THREE.MeshBasicMaterial({ color: 0xff5418, transparent: true, opacity: .9, depthWrite: false });
const asteroidFlameInner = new THREE.MeshBasicMaterial({ color: 0xffd05a, transparent: true, opacity: .92, depthWrite: false });
const asteroidFlameGeo = new THREE.ConeGeometry(.42, 1.65, 8);
const asteroidFlameCoreGeo = new THREE.ConeGeometry(.23, 1.05, 7);
const bulletMat = new THREE.MeshBasicMaterial({ color: 0x68f7ff });
const starGeo = new THREE.BufferGeometry();
const starPositions = new Float32Array(1800 * 3);
for (let i=0;i<1800;i++){ starPositions[i*3]=(Math.random()-.5)*100; starPositions[i*3+1]=(Math.random()-.5)*70; starPositions[i*3+2]=Math.random()*125-25; }
starGeo.setAttribute('position',new THREE.BufferAttribute(starPositions,3));
const stars = new THREE.Points(starGeo,new THREE.PointsMaterial({color:0x9bbdff,size:.11,transparent:true,opacity:.8,sizeAttenuation:true})); scene.add(stars);
const farStarsGeo = new THREE.BufferGeometry();
const farPos = new Float32Array(720*3);
for(let i=0;i<720;i++){farPos[i*3]=(Math.random()-.5)*130;farPos[i*3+1]=(Math.random()-.5)*90;farPos[i*3+2]=Math.random()*140-30;}
farStarsGeo.setAttribute('position',new THREE.BufferAttribute(farPos,3));
scene.add(new THREE.Points(farStarsGeo,new THREE.PointsMaterial({color:0x596da7,size:.19,transparent:true,opacity:.5})));

// Soft distant nebulae give the flight lane depth without obscuring hazards.
for(let i=0;i<5;i++){
 const cloud=new THREE.Mesh(new THREE.SphereGeometry(1,20,16),new THREE.MeshBasicMaterial({color:[0x192a62,0x331943,0x173b58,0x34214e,0x16355b][i],transparent:true,opacity:.12,side:THREE.BackSide,depthWrite:false}));
 cloud.scale.set(18+Math.random()*12,10+Math.random()*9,2); cloud.position.set((Math.random()-.5)*32,(Math.random()-.5)*18,25+i*24); scene.add(cloud);
}

function makePlayer(){
 const g=new THREE.Group();
 const body=new THREE.Mesh(new THREE.ConeGeometry(.48,2.7,7),shipMat); body.rotation.x=Math.PI/2; body.position.z=.15; g.add(body);
 const belly=new THREE.Mesh(new THREE.ConeGeometry(.42,1.9,6),darkMat); belly.rotation.x=Math.PI/2; belly.position.set(0,-.17,-.08); g.add(belly);
 const wingGeo=new THREE.BufferGeometry(); wingGeo.setAttribute('position',new THREE.Float32BufferAttribute([-0.38,0,.35,-2.25,-.28,-.85,-.55,.14,-.65, .38,0,.35,.55,.14,-.65,2.25,-.28,-.85],3)); wingGeo.setIndex([0,1,2,3,4,5]); wingGeo.computeVertexNormals();
 const wings=new THREE.Mesh(wingGeo,new THREE.MeshStandardMaterial({color:0x718ba4,metalness:.64,roughness:.3,side:THREE.DoubleSide,emissive:0x152a3a,emissiveIntensity:.7}));g.add(wings);
 const trimGeo=new THREE.BufferGeometry(); trimGeo.setAttribute('position',new THREE.Float32BufferAttribute([-0.5,.1,-.5,-2.02,-.25,-.77, .5,.1,-.5,2.02,-.25,-.77],3));
 const trim=new THREE.LineSegments(trimGeo,new THREE.LineBasicMaterial({color:0x62eaff,transparent:true,opacity:.85}));g.add(trim);
 const cockpit=new THREE.Mesh(new THREE.SphereGeometry(.31,16,12),mat(0x3e9bbb,0x42caff,1.5,.7,.15));cockpit.scale.set(.74,.48,1.5);cockpit.position.set(0,.27,.15);g.add(cockpit);
 const engineMat=new THREE.MeshBasicMaterial({color:0x42dcff});
 for(const x of [-.54,.54]){const engine=new THREE.Mesh(new THREE.CylinderGeometry(.13,.21,.56,10),darkMat);engine.rotation.x=Math.PI/2;engine.position.set(x,-.1,-.68);g.add(engine);const flame=new THREE.Mesh(new THREE.ConeGeometry(.14,.8,8),engineMat);flame.rotation.x=-Math.PI/2;flame.position.set(x,-.1,-1.23);g.add(flame);}
 const point=new THREE.PointLight(0x34dfff,3,7);point.position.set(0,0,-1.5);g.add(point);
 return g;
}
const player=makePlayer();player.position.set(0,0,0);scene.add(player);
const playerShadow=new THREE.Mesh(new THREE.CircleGeometry(1.5,32),new THREE.MeshBasicMaterial({color:0x16b9ff,transparent:true,opacity:.09,depthWrite:false}));playerShadow.rotation.x=-Math.PI/2;playerShadow.position.set(0,-2.4,-.8);scene.add(playerShadow);

const enemies=[], asteroids=[], bullets=[], particles=[], popups=[];
function makeEnemy(){
 const group=new THREE.Group();
 const hull=mat(0x8e9ba8,0x343b53,.45,.82,.24);
 const underside=mat(0x34384e,0x74194b,.7,.72,.3);
 const glass=mat(0x56dbe0,0x25dcea,1.8,.48,.14);
 // Tilt the saucer toward the flight lane so its classic disc-and-dome profile reads clearly.
 const craft=new THREE.Group();craft.rotation.x=-.82;group.add(craft);
 const rim=new THREE.Mesh(new THREE.CylinderGeometry(.56,.78,.2,28,1),hull);craft.add(rim);
 const lowerRim=new THREE.Mesh(new THREE.CylinderGeometry(.77,.64,.12,28,1),underside);lowerRim.position.y=-.12;craft.add(lowerRim);
 const dome=new THREE.Mesh(new THREE.SphereGeometry(.43,20,12,0,Math.PI*2,0,Math.PI/2),glass);dome.position.y=.095;craft.add(dome);
 const band=new THREE.Mesh(new THREE.TorusGeometry(.68,.045,8,32),enemyGlow);band.rotation.x=Math.PI/2;band.position.y=-.015;craft.add(band);
 const undersideCore=new THREE.Mesh(new THREE.SphereGeometry(.2,14,10),enemyGlow);undersideCore.scale.set(1,.52,1);undersideCore.position.y=-.2;craft.add(undersideCore);
 const portholeGeo=new THREE.SphereGeometry(.075,10,8);
 for(let i=0;i<10;i++){const angle=i/10*Math.PI*2;const porthole=new THREE.Mesh(portholeGeo,i%2?enemyGlow:glass);porthole.position.set(Math.cos(angle)*.66,-.02,Math.sin(angle)*.66);porthole.scale.set(1,.72,1);craft.add(porthole);}
 const light=new THREE.PointLight(0xff2673,1.6,7);light.position.set(0,-.2,0);group.add(light);
 group.userData={radius:1.02,baseX:0,phase:Math.random()*6.28,speed:14,wobble:1};return group;
}
function makeAsteroid(size=1){
 const group=new THREE.Group();
 const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(1,1),asteroidMat.clone());
 rock.material.color.setHSL(.055+Math.random()*.035,.52+Math.random()*.2,.2+Math.random()*.13);
 const positions=rock.geometry.attributes.position;
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
  const r=Math.hypot(x,y,z);
  const warp=.75 + Math.random()*.9;
  const nx=x*warp + (Math.random()-.5)*.7;
  const ny=y*warp + (Math.random()-.5)*.7;
  const nz=z*warp + (Math.random()-.5)*.7;
  const len=Math.hypot(nx,ny,nz) || 1;
  positions.setXYZ(i,nx*(1.05+r*.06)/len,ny*(1.05+r*.06)/len,nz*(1.05+r*.06)/len);
 }
 rock.geometry.computeVertexNormals();
 const chunkMat=new THREE.MeshStandardMaterial({color:0x754421,metalness:.12,roughness:.94,emissive:0x301204,emissiveIntensity:.24});
 for(let i=0;i<4;i++){
  const shard=new THREE.Mesh(new THREE.IcosahedronGeometry(.28 + Math.random()*.18,0),chunkMat);
  shard.position.set((Math.random()-.5)*1.4,(Math.random()-.5)*1.2,(Math.random()-.5)*1.4);
  shard.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
  shard.scale.set(1.3 + Math.random()*.9,1.1 + Math.random()*.8,1.2 + Math.random()*.9);
  group.add(shard);
 }
 group.add(rock);
  const flames=[];
  for(const [x,y,scale] of [[0,0,1],[-.48,.22,.62],[.42,-.3,.55]]){
   const flame=new THREE.Group();flame.position.set(x,y,.72);flame.rotation.x=Math.PI/2;flame.rotation.z=(Math.random()-.5)*.5;flame.scale.setScalar(scale);flame.userData.baseScale=scale;
   const outer=new THREE.Mesh(asteroidFlameGeo,asteroidFlameOuter);outer.position.y=.35;flame.add(outer);
   const inner=new THREE.Mesh(asteroidFlameCoreGeo,asteroidFlameInner);inner.position.y=.2;flame.add(inner);
   group.add(flame);flames.push(flame);
  }
 const wire=new THREE.Mesh(new THREE.IcosahedronGeometry(1.08,0),new THREE.MeshBasicMaterial({color:0xc67b3a,wireframe:true,transparent:true,opacity:.12}));
 wire.scale.set(1.18,1.12,1.18);
 group.add(wire);
 const s=size*(.78+Math.random()*.58);
 group.scale.set(s*(.72+Math.random()*.42),s*(.7+Math.random()*.45),s*(.78+Math.random()*.4));
 group.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
 group.userData={radius:s*.92,spinX:(Math.random()-.5)*1.5,spinY:(Math.random()-.5)*1.7,drift:(Math.random()-.5)*.8,flames,flamePhase:Math.random()*6.28,hits:0};return group;
}
function makeBullet(x,y,z){
 const g=new THREE.Group();
 for(const dx of [-.16,.16]){const beam=new THREE.Mesh(new THREE.CylinderGeometry(.045,.07,1.45,7),bulletMat);beam.rotation.x=Math.PI/2;beam.position.set(dx,0,.4);g.add(beam);}
 const light=new THREE.PointLight(0x40f3ff,1,3);g.add(light);g.position.set(x,y,z);scene.add(g);bullets.push({mesh:g,speed:45});
}
function sweptHit(bx0,by0,bz0,bx1,by1,bz1,tx0,ty0,tz0,tx1,ty1,tz1,radius){
 const rx=bx0-tx0,ry=by0-ty0,rz=bz0-tz0,dx=(bx1-tx1)-rx,dy=(by1-ty1)-ry,dz=(bz1-tz1)-rz;
 const t=clamp(-(rx*dx+ry*dy+rz*dz)/(dx*dx+dy*dy+dz*dz||1),0,1);
 return (rx+dx*t)**2+(ry+dy*t)**2+(rz+dz*t)**2<=radius*radius;
}
function burst(position,color=0x6cf5ff,count=12,power=5){
 for(let i=0;i<count;i++){
  const p=new THREE.Mesh(new THREE.IcosahedronGeometry(.06+Math.random()*.08,0),new THREE.MeshBasicMaterial({color,transparent:true,opacity:1}));p.position.copy(position);scene.add(p);
  const dir=new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize();particles.push({mesh:p,velocity:dir.multiplyScalar(power*(.35+Math.random()*.9)),life:.4+Math.random()*.5,max:.9});
 }
}

let state='menu',score=0,kills=0,hull=3,best=Number(localStorage.getItem('starfall-best')||0),elapsed=0,spawnTimer=0,shootTimer=0,damageTimer=0,comboTimer=0,combo=0,scoreCarry=0,pausedFrom='playing';
let moveX=0,moveY=0,moveVX=0,moveVY=0,keys={},fireHeld=false,soundOn=false,audioCtx=null,lastTime=0,toastTimer=0,shake=0;
const scoreNode=document.querySelector('#score'),bestNode=document.querySelector('#best'),killsNode=document.querySelector('#kills'),multNode=document.querySelector('#multiplier');
bestNode.textContent=String(best).padStart(6,'0');
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function playTone(freq=520,duration=.07,type='sine',volume=.035){
 if(!soundOn)return;try{audioCtx ||= new AudioContext();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration);}catch{}
}
function setScore(v){score=v;scoreNode.textContent=String(score).padStart(6,'0');}
function showToast(text){const node=document.querySelector('#toast');node.textContent=text;node.classList.add('show');toastTimer=1.5;}
function updateHealth(){document.querySelectorAll('#health i').forEach((el,i)=>el.classList.toggle('empty',i>=hull));}
function showPoints(position,points,color){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.width=256;canvas.height=96;
 ctx.font='800 52px Inter, system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor=`#${color.toString(16).padStart(6,'0')}`;ctx.shadowBlur=18;ctx.fillStyle=`#${color.toString(16).padStart(6,'0')}`;ctx.fillText(`+${points}`,128,48);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));sprite.position.copy(position);sprite.position.y+=1.25;sprite.scale.set(2.5,.95,1);scene.add(sprite);popups.push({mesh:sprite,life:1,max:1,texture});
}
function setState(next){state=next;document.querySelector('#startScreen').classList.toggle('hidden',next!=='menu');document.querySelector('#pauseScreen').classList.toggle('hidden',next!=='paused');document.querySelector('#gameOverScreen').classList.toggle('hidden',next!=='over');document.querySelector('#pauseBtn').style.visibility=(next==='playing'||next==='paused')?'visible':'hidden';}
function resetGame(){
 for(const list of [enemies,asteroids,bullets,particles,popups])for(const o of list){scene.remove(o.mesh||o);if(o.mesh?.geometry)o.mesh.geometry.dispose();if(o.texture)o.texture.dispose();if(o.mesh?.material?.map)o.mesh.material.map.dispose();}
 enemies.length=asteroids.length=bullets.length=particles.length=popups.length=0;elapsed=0;spawnTimer=.45;shootTimer=.1;damageTimer=0;comboTimer=0;combo=0;kills=0;hull=3;scoreCarry=0;setScore(0);killsNode.textContent='000';multNode.textContent='×1.0';updateHealth();player.position.set(0,0,0);player.rotation.set(0,0,0);moveVX=moveVY=0;state='countdown';document.querySelectorAll('.center-message').forEach(el=>el.classList.add('hidden'));document.querySelector('#countdown').classList.remove('hidden');
 let n=3;const node=document.querySelector('#countdown');node.textContent=n;const tick=()=>{if(state!=='countdown')return;if(n===0){node.classList.add('hidden');setState('playing');return;}node.textContent=n;node.animate([{transform:'translate(-50%,-50%) scale(1.4)',opacity:0},{transform:'translate(-50%,-50%) scale(1)',opacity:1}],{duration:480});playTone(320+n*80,.12,'sine',.04);n--;setTimeout(tick,700);};setTimeout(tick,100);
}
function spawnEnemy(){const e=makeEnemy();e.userData.baseX=(Math.random()-.5)*13;e.position.set(e.userData.baseX,(Math.random()-.5)*7,55+Math.random()*15);scene.add(e);enemies.push(e);}
function spawnRock(){const a=makeAsteroid(.8+Math.random()*.75);a.position.set((Math.random()-.5)*17,(Math.random()-.5)*10,57+Math.random()*18);scene.add(a);asteroids.push(a);}
function damage(){if(damageTimer>0||state!=='playing')return;damageTimer=1.6;hull--;updateHealth();shake=.55;document.querySelector('#shieldFlash').classList.add('on');setTimeout(()=>document.querySelector('#shieldFlash').classList.remove('on'),180);burst(player.position,0xff557e,24,7);playTone(115,.28,'sawtooth',.06);if(hull<=0)gameOver();}
function gameOver(){setState('over');document.querySelector('#finalScore').textContent=score.toLocaleString();document.querySelector('#finalKills').textContent=kills;if(score>best){best=score;localStorage.setItem('starfall-best',String(best));bestNode.textContent=String(best).padStart(6,'0');document.querySelector('#recordNote').textContent='NEW PERSONAL RECORD · WELL FLOWN';playTone(880,.3,'triangle',.07);}else document.querySelector('#recordNote').textContent='PERSONAL RECORD · '+best.toLocaleString();}
function registerKill(e,points,color){scene.remove(e);const enemyIndex=enemies.indexOf(e),rockIndex=asteroids.indexOf(e);if(enemyIndex>=0)enemies.splice(enemyIndex,1);if(rockIndex>=0)asteroids.splice(rockIndex,1);kills++;killsNode.textContent=String(kills).padStart(3,'0');combo=Math.min(combo+1,12);comboTimer=3.1;const mult=1+Math.floor(combo/3)*.5;multNode.textContent='×'+mult.toFixed(1);scoreCarry+=points;setScore(Math.floor(scoreCarry));showPoints(e.position,points,color);burst(e.position,color,18,6);playTone(580+Math.min(combo,8)*55,.1,'triangle',.035);if(combo>0&&combo%3===0)showToast('STREAK · ×'+mult.toFixed(1));}

function update(dt,time){
 if(state!=='playing'){
  const t=time*.001;player.position.y=Math.sin(t*1.1)*.12;player.rotation.z=Math.sin(t*.8)*.025;
  if(state==='menu'){for(const e of enemies){e.position.z-=dt*4;if(e.position.z<2)e.position.z=65;}for(const a of asteroids){a.position.z-=dt*5;if(a.position.z<2)a.position.z=72;}}
  return;
 }
 elapsed+=dt;damageTimer=Math.max(0,damageTimer-dt);comboTimer=Math.max(0,comboTimer-dt);if(comboTimer===0&&combo){combo=0;multNode.textContent='×1.0';}
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)document.querySelector('#toast').classList.remove('show');}
 const aspect=innerWidth/innerHeight, limitX=Math.min(9,Math.max(4.3,6.8*aspect)), limitY=innerHeight<innerWidth?4.1:5.1;
 let dx=moveX,dy=moveY;
 if(keys.ArrowLeft||keys.KeyA)dx-=1;if(keys.ArrowRight||keys.KeyD)dx+=1;if(keys.ArrowUp||keys.KeyW)dy+=1;if(keys.ArrowDown||keys.KeyS)dy-=1;
 const inputLen=Math.hypot(dx,dy);if(inputLen>1){dx/=inputLen;dy/=inputLen;}
 moveVX=THREE.MathUtils.damp(moveVX,dx*13.5,11,dt);moveVY=THREE.MathUtils.damp(moveVY,dy*12,11,dt);player.position.x=clamp(player.position.x+moveVX*dt,-limitX,limitX);
 player.position.y=clamp(player.position.y+moveVY*dt,-limitY,limitY);
 player.rotation.z=THREE.MathUtils.damp(player.rotation.z,-moveVX/13.5*.28,7,dt);
 player.rotation.x=THREE.MathUtils.damp(player.rotation.x,moveVY/12*.12,7,dt);
 player.position.z=Math.sin(time*.006)*.09;
 player.children.forEach((child)=>{if(child.geometry?.type==='ConeGeometry'&&child.material===bulletMat){} });
 // The cannon runs continuously; the touch/space input tightens the firing cadence.
 shootTimer-=dt;if(shootTimer<=0){makeBullet(player.position.x,player.position.y,1.3);shootTimer=fireHeld ? .105 : .21;playTone(760,.035,'square',.012);}
 spawnTimer-=dt;const difficulty=Math.min(2.4,elapsed/45);if(spawnTimer<=0){spawnEnemy();if(Math.random()<.36+difficulty*.1)spawnEnemy();spawnTimer=Math.max(.56,1.4-difficulty*.25+Math.random()*.38);}
 if(Math.random()<dt*(.12+difficulty*.04))spawnRock();
 const speed=15+Math.min(11,elapsed*.12);
 for(let i=enemies.length-1;i>=0;i--){const e=enemies[i],d=e.userData;e.position.z-=dt*(speed*(.88+Math.sin(d.phase)*.06));e.position.x=d.baseX+Math.sin(time*.0015+d.phase)*d.wobble;e.position.y+=Math.sin(time*.002+d.phase)*dt*.42;e.rotation.z=Math.sin(time*.0014+d.phase)*.18;e.rotation.y+=dt*.7;
  if(e.position.z<=2&&e.position.z>=-1){const dist=Math.hypot(e.position.x-player.position.x,e.position.y-player.position.y);if(dist<d.radius+1.05){damage();burst(e.position,0xff579b,12,4);scene.remove(e);enemies.splice(i,1);} }
  if(e.position.z< -3){scene.remove(e);enemies.splice(i,1);}
 }
 for(let i=asteroids.length-1;i>=0;i--){const a=asteroids[i],d=a.userData;a.position.z-=dt*(speed*.82);a.position.x+=d.drift*dt;a.rotation.x+=d.spinX*dt;a.rotation.y+=d.spinY*dt;for(let j=0;j<d.flames.length;j++){const f=d.flames[j],pulse=.78+.22*Math.sin(time*.018+d.flamePhase+j*1.7);f.scale.y=f.userData.baseScale*pulse;}
  if(a.position.z<=2&&a.position.z>=-1){const dist=Math.hypot(a.position.x-player.position.x,a.position.y-player.position.y);if(dist<d.radius+1.15){damage();burst(a.position,0xffa64d,14,4.5);scene.remove(a);asteroids.splice(i,1);}}
  if(a.position.z< -4){scene.remove(a);asteroids.splice(i,1);}
 }
 for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];b.mesh.position.z+=b.speed*dt;let hit=false;
  const previousZ=b.mesh.position.z-b.speed*dt,previousX=b.mesh.position.x,previousY=b.mesh.position.y;
  for(let j=enemies.length-1;j>=0;j--){const e=enemies[j],d=e.userData,previousTargetZ=e.position.z+dt*(speed*(.88+Math.sin(d.phase)*.06)),previousTargetX=d.baseX+Math.sin((time-dt*1000)*.0015+d.phase)*d.wobble,previousTargetY=e.position.y-Math.sin(time*.002+d.phase)*dt*.42;if(sweptHit(previousX,previousY,previousZ,b.mesh.position.x,b.mesh.position.y,b.mesh.position.z,previousTargetX,previousTargetY,previousTargetZ,e.position.x,e.position.y,e.position.z,1.12)){registerKill(e,20,0xff70ad);hit=true;break;}}
  if(!hit){for(let j=asteroids.length-1;j>=0;j--){const a=asteroids[j],previousTargetZ=a.position.z+dt*(speed*.82),previousTargetX=a.position.x-a.userData.drift*dt;if(sweptHit(previousX,previousY,previousZ,b.mesh.position.x,b.mesh.position.y,b.mesh.position.z,previousTargetX,a.position.y,previousTargetZ,a.position.x,a.position.y,a.position.z,a.userData.radius+.3)){a.userData.hits++;burst(b.mesh.position,0xffb458,5,2.2);hit=true;if(a.userData.hits>=3)registerKill(a,50,0xffc36a);break;}}}
   if(hit||b.mesh.position.z>68){scene.remove(b.mesh);bullets.splice(i,1);}
 }
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.mesh.position.addScaledVector(p.velocity,dt);p.velocity.multiplyScalar(Math.max(0,1-dt*1.8));p.mesh.material.opacity=Math.max(0,p.life/p.max);p.mesh.scale.multiplyScalar(1+dt*.65);if(p.life<=0){scene.remove(p.mesh);particles.splice(i,1);}}
 for(let i=popups.length-1;i>=0;i--){const p=popups[i];p.life-=dt;p.mesh.position.y+=dt*.85;p.mesh.material.opacity=Math.max(0,p.life/p.max);const scale=1+(.95-p.life)*.18;p.mesh.scale.set(2.5*scale,.95*scale,1);if(p.life<=0){scene.remove(p.mesh);p.mesh.material.map.dispose();p.mesh.material.dispose();popups.splice(i,1);}}
  const pos=starGeo.attributes.position.array;for(let i=0;i<pos.length;i+=3){pos[i+2]-=dt*(8+elapsed*.03);if(pos[i+2]<-22)pos[i+2]=103;}starGeo.attributes.position.needsUpdate=true;
 stars.position.z=0;scoreCarry+=dt*(8+Math.min(12,elapsed*.06));setScore(Math.floor(scoreCarry));
 playerShadow.position.x=player.position.x;playerShadow.material.opacity=.065+Math.sin(time*.008)*.018;
 if(shake>0)shake=Math.max(0,shake-dt);camera.position.x=THREE.MathUtils.damp(camera.position.x,player.position.x*.09+(Math.random()-.5)*shake,3,dt);camera.lookAt(player.position.x*.035,0,22);
}

function render(time){requestAnimationFrame(render);const dt=Math.min(.04,(time-lastTime)/1000||0);lastTime=time;update(dt,time);renderer.render(scene,camera);}
requestAnimationFrame(render);
function resize(){renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);

function togglePause(){if(state==='playing'){pausedFrom=state;setState('paused');}else if(state==='paused'){setState(pausedFrom);}}
document.querySelector('#startBtn').addEventListener('click',resetGame);
document.querySelector('#retryBtn').addEventListener('click',resetGame);
document.querySelector('#resumeBtn').addEventListener('click',togglePause);
document.querySelector('#pauseBtn').addEventListener('click',togglePause);
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;if(e.code==='Space')fireHeld=true;if((e.code==='KeyP'||e.code==='Escape')&&!e.repeat)togglePause();if(e.code==='Enter'&&(state==='menu'||state==='over'))resetGame();});
window.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='Space')fireHeld=false;});
window.addEventListener('blur',()=>{keys={};fireHeld=false;if(state==='playing')togglePause();});
const soundBtn=document.querySelector('#soundBtn');soundBtn.addEventListener('click',()=>{soundOn=!soundOn;soundBtn.style.borderColor=soundOn?'#6cf5ff':'#8da7d32a';document.querySelector('#soundIcon').style.color=soundOn?'#6cf5ff':'#a8bddb';playTone(660,.1);});
const stick=document.querySelector('#stick'),knob=document.querySelector('#knob');let stickPointer=null;
function moveStick(e){const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.36,d=Math.hypot(dx,dy),scale=d>max?max/d:1;moveX=clamp(dx*scale/max,-1,1);moveY=clamp(-dy*scale/max,-1,1);knob.style.transform=`translate(calc(-50% + ${dx*scale}px),calc(-50% + ${dy*scale}px))`;}
stick.addEventListener('pointerdown',e=>{e.preventDefault();stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);});
stick.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)moveStick(e);});
function releaseStick(e){if(e.pointerId!==stickPointer)return;stickPointer=null;moveX=moveY=0;knob.style.transform='translate(-50%,-50%)';}
stick.addEventListener('pointerup',releaseStick);stick.addEventListener('pointercancel',releaseStick);
const fireBtn=document.querySelector('#fireBtn');fireBtn.addEventListener('pointerdown',e=>{e.preventDefault();fireHeld=true;fireBtn.setPointerCapture(e.pointerId);});fireBtn.addEventListener('pointerup',()=>fireHeld=false);fireBtn.addEventListener('pointercancel',()=>fireHeld=false);

// A few distant contacts make the opening screen feel alive, but stay out of the flight lane.
for(let i=0;i<3;i++){const e=makeEnemy();e.userData.baseX=(Math.random()-.5)*15;e.position.set(e.userData.baseX,(Math.random()-.5)*9,25+i*18);scene.add(e);enemies.push(e);}
for(let i=0;i<2;i++){const a=makeAsteroid(.8+Math.random()*.9);a.position.set((Math.random()-.5)*20,(Math.random()-.5)*12,35+i*17);scene.add(a);asteroids.push(a);}
setState('menu');
