(() => {
  const beers = [
    {name:'Pilsen',word:'PILSEN',bg:'#131512',accent:'#d1ad65',label:'#9b742e',description:'Dourada e leve. Um convite para desacelerar e aproveitar o encontro.',taste:['LEVEZA','FRESCOR'],detail:'LEVE · DOURADA · REFRESCANTE'},
    {name:'IPA',word:'IPA',bg:'#102822',accent:'#c4d791',label:'#316447',description:'A presença do lúpulo. Notas cítricas e um amargor que deixa sua assinatura.',taste:['CÍTRICA','INTENSA'],detail:'LÚPULO · AROMA · PERSONALIDADE'},
    {name:'Weiss',word:'WEISS',bg:'#401b23',accent:'#f0c7a0',label:'#8b3540',description:'A suavidade do trigo. Aromas delicados e um sabor feito para ficar na memória.',taste:['TRIGO','SUAVIDADE'],detail:'TRIGO · LEVEZA · EQUILÍBRIO'}
  ];
  const $ = selector => document.querySelector(selector);
  const section=$('.experience'), product=$('.product'), root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const labelTemplate=$('.bottle-label'), infoTemplate=$('.beer-info'), wordTemplate=$('.giant-type');
  const labelShell=document.createElement('div');
  labelShell.className='label-shell';
  product.appendChild(labelShell);
  labelShell.appendChild(labelTemplate);
  const layers=beers.map((beer,i)=>{
    const label=i?labelTemplate.cloneNode(true):labelTemplate;
    const info=i?infoTemplate.cloneNode(true):infoTemplate;
    const word=i?wordTemplate.cloneNode(true):wordTemplate;
    if(i){labelShell.appendChild(label);infoTemplate.after(info);wordTemplate.after(word)}
    label.style.setProperty('--label',beer.label);
    label.querySelector('img').src=`assets/label-${['pilsen','ipa','weiss'][i]}-portrait.png`;
    label.querySelector('img').alt=`Rótulo ilustrado Löwenberg ${beer.name}`;
    label.querySelector('.label-name').textContent=beer.word;
    label.querySelector('.label-detail').textContent=beer.detail;
    info.querySelector('.beer-title').textContent=beer.name;
    info.querySelector('.beer-description').textContent=beer.description;
    info.querySelector('.counter').textContent=`0${i+1} / 03`;
    info.querySelector('.taste-a').textContent=beer.taste[0];
    info.querySelector('.taste-b').textContent=beer.taste[1];
    info.removeAttribute('aria-live');
    word.textContent=beer.word;
    return {label,info,word};
  });
  let active=-1, frame=0, displayed=0, previousTime=0;
  const clamp=value=>Math.max(0,Math.min(1,value));
  const ease=value=>value*value*(3-2*value);
  const mixColor=(a,b,t)=>`rgb(${[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t)).join(',')})`;
  const targetProgress=()=>clamp((scrollY-section.offsetTop)/Math.max(1,section.offsetHeight-$('.stage').offsetHeight));
  function render(progress){
    // Persistent layers blend throughout each turn; visible text is never replaced.
    const first=ease(clamp((progress-.06)/.42));
    const second=ease(clamp((progress-.52)/.42));
    const leg=progress<.5?0:1;
    const turn=leg===0?first:second;
    const index=leg+(turn>=.5?1:0);
    const mobile=innerWidth<=650;
    const left=mobile?29:32;
    const right=mobile?71:68;
    const x=left+(right-left)*(first-second);
    product.style.setProperty('--label-glint',`${36+Math.sin(turn*Math.PI)*(leg===0?16:-12)}%`);
    const from=beers[leg],to=beers[leg+1];
    root.style.setProperty('--bg',mixColor(from.bg,to.bg,turn));
    root.style.setProperty('--accent',mixColor(from.accent,to.accent,turn));
    const weights=[1-first,first-second,second];
    layers.forEach(({label,info,word},i)=>{
      const weight=reduced.matches?Number(i===index):weights[i];
      const offset=i===0?-first:i===1?1-first-second:1-second;
      const direction=leg===0?1:-1;
      label.style.opacity=String(weight);
      label.style.transform=reduced.matches?'none':`translateX(${offset*direction*28}%) scaleX(${1-Math.abs(offset)*.42})`;
      label.style.filter=reduced.matches?'none':`brightness(${1-Math.abs(offset)*.28})`;
      label.setAttribute('aria-hidden','true');
      info.style.left=`${!reduced.matches&&i===1?6:(mobile?63:72)}%`;
      info.style.right='auto';
      info.style.opacity=String(weight);
      info.style.transform=reduced.matches?'none':`translateY(${offset*55}px)`;
      info.setAttribute('aria-hidden',String(i!==index));
      word.style.opacity=String(weight*.13);
      word.style.transform=reduced.matches?'none':`translate(${offset*direction*-65}px,${offset*35}px) scale(${1-Math.abs(offset)*.08})`;
    });
    if(index!==active){
      active=index;const beer=beers[index];
      product.setAttribute('aria-label',`Garrafa Löwenberg com rótulo ${beer.name}`);
      document.querySelectorAll('[data-beer]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    }
    $('.neck-label').style.background=mixColor(from.accent,to.accent,turn);
    $('.intro').style.opacity=String(1-ease(clamp(progress/.08)));
    $('.intro').style.visibility=progress>=.08?'hidden':'visible';
    if(!reduced.matches){
      product.style.left=`${x}%`;
      const arc=Math.sin(turn*Math.PI);
      const lean=-12+24*(first-second)+Math.sin(turn*Math.PI*2)*(leg===0?18:-18);
      product.style.transform=`translateX(-50%) translateY(${-arc*(mobile?35:65)}px) rotate(${lean}deg) scale(${1+arc*.08}) scaleX(${1-arc*.12})`;
    }else{
      product.style.left=mobile?'30%':'35%';
      product.style.transform='translateX(-50%)';
    }
    $('.progress').style.transform=`scaleX(${progress})`;
  }
  function tick(time){
    const target=targetProgress();
    const delta=previousTime?Math.min(64,time-previousTime):16;
    previousTime=time;
    const step=(target-displayed)*(1-Math.exp(-delta/110));
    const limit=delta*.0011;
    displayed=reduced.matches?target:displayed+Math.max(-limit,Math.min(limit,step));
    if(Math.abs(target-displayed)<.0001)displayed=target;
    render(displayed);
    if(displayed!==target)frame=requestAnimationFrame(tick);
    else{frame=0;previousTime=0;}
  }
  const queue=()=>{if(!frame)frame=requestAnimationFrame(tick)};
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);reduced.addEventListener('change',queue);
  document.querySelectorAll('[data-beer]').forEach(button=>button.addEventListener('click',()=>{const i=Number(button.dataset.beer);scrollTo({top:section.offsetTop+(section.offsetHeight-$('.stage').offsetHeight)*[0,.5,1][i],behavior:reduced.matches?'instant':'smooth'})}));
  displayed=targetProgress();render(displayed);
})();
