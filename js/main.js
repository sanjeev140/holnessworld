/* ==========================================================================
   HOLNESS WORLD — interactions & animations (no libraries needed)
   ========================================================================== */
(function(){
  var doc=document.documentElement, body=document.body;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop=function(){return window.innerWidth>1000};

  /* ---------- Preloader (shown once per visit) ---------- */
  var pre=document.querySelector('.preloader');
  if(pre){
    var seen=false; try{seen=sessionStorage.getItem('hw-pre')==='1'}catch(e){}
    if(seen||reduce){pre.remove()}
    else{
      try{sessionStorage.setItem('hw-pre','1')}catch(e){}
      body.style.overflow='hidden';
      window.addEventListener('load',function(){
        setTimeout(function(){pre.classList.add('done');body.style.overflow='';setTimeout(function(){pre.remove()},1200)},1500);
      });
      setTimeout(function(){if(document.body.contains(pre)){pre.classList.add('done');body.style.overflow=''}},4500);
    }
  }

  /* ---------- Header, menu, progress ---------- */
  var header=document.querySelector('.site-header'), prog=document.querySelector('.progress'), lastY=0;
  var menuBtn=document.querySelector('.menu-btn');
  if(menuBtn){menuBtn.addEventListener('click',function(){body.classList.toggle('menu-open');menuBtn.setAttribute('aria-expanded',body.classList.contains('menu-open'))})}
  document.querySelectorAll('.mobile-menu a').forEach(function(a){a.addEventListener('click',function(){body.classList.remove('menu-open')})});

  /* ---------- Split words ---------- */
  document.querySelectorAll('[data-split]').forEach(function(el){
    var html=el.innerHTML.trim(), out='', i=0;
    // keep simple inline tags (em, br) intact
    html.split(/(<[^>]+>|\s+)/).forEach(function(part){
      if(!part)return;
      if(/^\s+$/.test(part)){out+=' ';return}
      if(/^</.test(part)){out+=part;return}
      out+='<span class="w"><span style="transition-delay:'+(i*0.045).toFixed(3)+'s">'+part+'</span></span>';i++;
    });
    el.innerHTML=out; el.classList.add('split');
  });

  /* ---------- Scroll-lit words ---------- */
  var lits=[];
  document.querySelectorAll('[data-lit]').forEach(function(el){
    var words=el.textContent.trim().split(/\s+/);
    el.innerHTML=words.map(function(w){return '<span class="lw">'+w+'</span>'}).join(' ');
    lits.push({el:el,spans:el.querySelectorAll('.lw')});
  });

  /* ---------- Reveal on view ---------- */
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}});
  },{threshold:.18,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('[data-reveal],[data-wipe],[data-split],.ft,.splitmodel,.layers').forEach(function(el){io.observe(el)});

  /* ---------- Hero mosaic ---------- */
  document.querySelectorAll('.tile').forEach(function(tile,t){
    var imgs=tile.querySelectorAll('img'), cap=tile.querySelector('.cap span'), dot=tile.querySelector('.cap i'), k=0;
    if(!imgs.length)return;
    imgs[0].classList.add('on');
    function show(n){imgs.forEach(function(im,j){im.classList.toggle('on',j===n)});if(cap){cap.textContent=imgs[n].dataset.cap||''}if(dot){dot.style.background=imgs[n].dataset.c||''}}
    show(0);
    if(imgs.length>1&&!reduce){setInterval(function(){k=(k+1)%imgs.length;show(k)},4200+t*900)}
  });

  /* ---------- Dimensions (aperture) ---------- */
  var dimWrap=document.querySelector('.dim-visual');
  if(dimWrap){
    var ang={0:-177,1:-124,2:-57,3:3,4:69,5:130};
    var items=document.querySelectorAll('.dim-list li'), center=dimWrap.querySelector('.dim-center span'), auto=true, idx=0;
    function setDim(n){
      items.forEach(function(li,j){li.classList.toggle('on',j===n)});
      var bl=(items[n].dataset.blades||'').split(',').map(Number);
      dimWrap.classList.add('focus');
      dimWrap.querySelectorAll('.b').forEach(function(b,j){
        var on=bl.indexOf(j)>-1, a=ang[j]*Math.PI/180, d=on?10:0;
        b.classList.toggle('on',on);
        b.style.transform='translate('+(Math.cos(a)*d).toFixed(2)+'px,'+(Math.sin(a)*d).toFixed(2)+'px)';
      });
      if(center){center.textContent=items[n].querySelector('h3').textContent}
    }
    items.forEach(function(li,j){
      li.addEventListener('mouseenter',function(){auto=false;setDim(j)});
      li.addEventListener('click',function(){auto=false;setDim(j)});
    });
    setDim(0);
    if(!reduce)setInterval(function(){if(!auto)return;idx=(idx+1)%items.length;setDim(idx)},3200);
  }

  /* ---------- Partner categories floating image ---------- */
  var cats=document.querySelector('.cats'), flt=document.querySelector('.cat-float');
  if(cats&&flt){
    var fimgs=flt.querySelectorAll('img'), fx=0,fy=0,cx=0,cy=0,run=false;
    cats.querySelectorAll('.cat').forEach(function(c,j){
      c.addEventListener('mouseenter',function(){flt.classList.add('show');fimgs.forEach(function(im,k){im.classList.toggle('on',k===j)})});
    });
    cats.addEventListener('mouseleave',function(){flt.classList.remove('show')});
    cats.addEventListener('mousemove',function(e){fx=e.clientX+190;fy=e.clientY;if(!run){run=true;loop()}});
    function loop(){cx+=(fx-cx)*.14;cy+=(fy-cy)*.14;flt.style.left=cx+'px';flt.style.top=cy+'px';if(Math.abs(fx-cx)>.5||Math.abs(fy-cy)>.5){requestAnimationFrame(loop)}else{run=false}}
  }

  /* ---------- HOLNESS Card: tilt + flip ---------- */
  var card=document.querySelector('.card3d');
  if(card){
    var flipped=false, rx=0, ry=0;
    function apply(){card.style.transform='rotateX('+rx+'deg) rotateY('+((flipped?180:0)+ry)+'deg)'}
    card.addEventListener('click',function(){flipped=!flipped;apply()});
    card.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();flipped=!flipped;apply()}});
    if(!reduce){
      card.addEventListener('mousemove',function(e){var r=card.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;ry=(px-.5)*16;rx=(.5-py)*12;card.style.setProperty('--gx',(px*100)+'%');card.style.setProperty('--gy',(py*100)+'%');card.style.transition='transform .15s';apply()});
      card.addEventListener('mouseleave',function(){rx=0;ry=0;card.style.transition='';apply()});
    }
  }

  /* ---------- Flywheel ---------- */
  var wheel=document.querySelector('.wheel');
  if(wheel){
    var nodes=wheel.querySelectorAll('.node'), steps=document.querySelectorAll('.fly-steps li'), n=nodes.length, R=44;
    var palette=['var(--blue)','var(--green)','var(--yellow)','var(--orange)','var(--charcoal)'];
    nodes.forEach(function(nd,i){var a=(-90+i*360/n)*Math.PI/180;nd.style.left=(50+R*Math.cos(a))+'%';nd.style.top=(50+R*Math.sin(a))+'%';nd.style.setProperty('--c',palette[i%5])});
    var dot=wheel.querySelector('.orbit-dot'), cur=-1, visible=false, t0=null;
    new IntersectionObserver(function(e){visible=e[0].isIntersecting},{threshold:.2}).observe(wheel);
    function tick(ts){
      if(visible&&!reduce){
        if(t0===null)t0=ts;
        var p=((ts-t0)/1200)%n, i=Math.floor(p);
        var a=(-90+p*360/n)*Math.PI/180;
        if(dot){dot.setAttribute('cx',(50+R*Math.cos(a)).toFixed(2));dot.setAttribute('cy',(50+R*Math.sin(a)).toFixed(2))}
        if(i!==cur){cur=i;nodes.forEach(function(nd,j){nd.classList.toggle('on',j<=i)});steps.forEach(function(s,j){s.classList.toggle('on',j===i)})}
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Scroll-driven: progress, header, lit words, manifesto, gallery, parallax ---------- */
  var hgal=document.querySelector('.hgal'), track=hgal&&hgal.querySelector('.hgal-track'), hbar=hgal&&hgal.querySelector('.hgal-progress i');
  function sizeGallery(){
    if(!hgal)return;
    if(desktop()){var extra=track.scrollWidth-window.innerWidth+parseFloat(getComputedStyle(track).paddingLeft);hgal.style.height=(window.innerHeight+Math.max(0,extra))+'px'}
    else{hgal.style.height='';track.style.transform=''}
  }
  var mf=document.querySelectorAll('.mf-lines li');
  var pars=document.querySelectorAll('[data-parallax]');
  var ticking=false;
  function onScroll(){
    var y=window.scrollY, vh=window.innerHeight;
    if(prog){var h=doc.scrollHeight-vh;prog.style.transform='scaleX('+(h>0?y/h:0)+')'}
    if(header){header.classList.toggle('scrolled',y>40);if(!body.classList.contains('menu-open')){header.classList.toggle('hide',y>lastY&&y>400)}lastY=y}
    lits.forEach(function(o){var r=o.el.getBoundingClientRect();var p=(vh*.85-r.top)/(r.height+vh*.35);p=Math.max(0,Math.min(1,p));var k=Math.round(p*o.spans.length);o.spans.forEach(function(s,i){s.classList.toggle('lit',i<k)})});
    mf.forEach(function(li){var r=li.getBoundingClientRect();li.classList.toggle('lit',r.top<vh*.68)});
    if(hgal&&desktop()){
      var r=hgal.getBoundingClientRect(), total=hgal.offsetHeight-vh, p=Math.max(0,Math.min(1,-r.top/total));
      var extra=track.scrollWidth-window.innerWidth+parseFloat(getComputedStyle(track).paddingLeft);
      track.style.transform='translate3d('+(-p*Math.max(0,extra))+'px,0,0)';
      if(hbar)hbar.style.width=(p*100)+'%';
    }
    if(!reduce)pars.forEach(function(el){var r=el.getBoundingClientRect();var s=parseFloat(el.dataset.parallax)||.1;var off=(r.top+r.height/2-vh/2)*s;el.style.transform='translate3d(0,'+(-off).toFixed(1)+'px,0)'});
    ticking=false;
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  window.addEventListener('resize',function(){sizeGallery();onScroll()});
  window.addEventListener('load',function(){sizeGallery();onScroll()});
  sizeGallery();onScroll();

  /* ---------- Contact page ---------- */
  var form=document.querySelector('#enquiry');
  if(form){
    var sel=form.querySelector('select[name=interest]');
    document.querySelectorAll('.path').forEach(function(p){
      p.addEventListener('click',function(){document.querySelectorAll('.path').forEach(function(q){q.classList.remove('sel')});p.classList.add('sel');if(sel)sel.value=p.dataset.value;form.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})});
    });
    var m=location.search.match(/interest=([a-z-]+)/);
    if(m&&sel){var map={partner:'Become a Delivery Partner',international:'Become an International Partner',invest:'Explore Investment Opportunities',join:'Join the Ecosystem',approved:'Apply for HOLNESS Approved',consult:'Book a Strategic Consultation',book:'Request the HOLNESS Book'};if(map[m[1]])sel.value=map[m[1]]}
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var d=new FormData(form), lines=[];
      d.forEach(function(v,k){lines.push(k.charAt(0).toUpperCase()+k.slice(1)+': '+v)});
      var to=form.dataset.to||'info@harleyoflondon.in';
      var href='mailto:'+to+'?subject='+encodeURIComponent('HOLNESS World enquiry — '+(d.get('interest')||''))+'&body='+encodeURIComponent(lines.join('\n'));
      document.querySelector('.form-done').style.display='block';
      try{window.location.href=href}catch(err){}
    });
  }
  document.querySelectorAll('.year').forEach(function(s){s.textContent=new Date().getFullYear()});
})();
