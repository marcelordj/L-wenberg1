(() => {
  function wrapLabel(image, canvas) {
    const width=600, height=900, segments=300, angle=1.22;
    const source=document.createElement('canvas');
    source.width=width;source.height=height;
    const art=source.getContext('2d');
    const context=canvas.getContext('2d');
    if(!art||!context||!image.naturalWidth||!image.naturalHeight)return false;
    canvas.width=width;canvas.height=height;
    art.fillStyle='#f5eddb';art.fillRect(0,0,width,height);
    const scale=Math.min(width/image.naturalWidth,height/image.naturalHeight);
    const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
    art.drawImage(image,(width-w)/2,(height-h)/2,w,h);
    context.imageSmoothingEnabled=true;
    context.imageSmoothingQuality='high';
    const extent=Math.sin(angle),edgeDepth=1-Math.cos(angle);
    // Project vertical artwork strips onto the visible arc of a cylinder.
    for(let i=0;i<segments;i++){
      const u=i/segments,next=(i+1)/segments;
      const theta=(u*2-1)*angle,thetaNext=(next*2-1)*angle;
      const x=width*(.5+Math.sin(theta)/(2*extent));
      const end=width*(.5+Math.sin(thetaNext)/(2*extent));
      const inset=(1-Math.cos((theta+thetaNext)/2))/edgeDepth*height*.035;
      context.drawImage(source,u*width,0,width/segments,height,x,inset,end-x+.5,height-inset*2);
    }
    context.globalCompositeOperation='source-atop';
    const shadow=context.createLinearGradient(0,0,width,0);
    [[0,'rgba(18,10,3,.7)'],[.09,'rgba(30,18,5,.32)'],[.28,'rgba(0,0,0,.02)'],[.55,'rgba(0,0,0,0)'],[.8,'rgba(18,10,3,.12)'],[.94,'rgba(18,10,3,.4)'],[1,'rgba(18,10,3,.75)']].forEach(([stop,color])=>shadow.addColorStop(stop,color));
    context.fillStyle=shadow;context.fillRect(0,0,width,height);
    context.globalCompositeOperation='source-over';
    return true;
  }
  function mount(){
    document.querySelectorAll('.art-label').forEach(label=>{
      const image=label.querySelector('img');
      if(!image)return;
      const canvas=document.createElement('canvas');
      canvas.className='label-surface';canvas.setAttribute('aria-hidden','true');
      const draw=()=>{
        if(wrapLabel(image,canvas)){
          if(!canvas.parentNode)label.appendChild(canvas);
          label.classList.add('surface-ready');
        }
      };
      image.addEventListener('load',draw);
      if(image.complete&&image.naturalWidth)draw();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
