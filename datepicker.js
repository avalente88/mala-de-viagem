(function(){
  function formatDate(date, fmt){
    const dd = String(date.getDate()).padStart(2,'0');
    const mm = String(date.getMonth()+1).padStart(2,'0');
    const yyyy = date.getFullYear();
    return fmt.replace('dd', dd).replace('mm', mm).replace('yyyy', yyyy);
  }
  function sameDate(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

  class MDSDatepicker{
    constructor(input, opts={}){
      this.input = input;
      this.opts = Object.assign({
        format: 'dd-mm-yyyy',
        firstDay: 1,
        i18n: { months: 'January February March April May June July August September October November December'.split(' '), weekdaysShort: 'S M T W T F S'.split(' ') },
        theme: 'mds',
        min: null,
        max: null
      }, opts);
      this.date = new Date();
      this.view = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
      this.selected = null;
      this._build();
      this._bind();
    }
    _build(){
      this.input.classList.add('mds-input');
      const wrap = document.createElement('div');
      wrap.className = 'mds-picker mds-hidden';
      wrap.setAttribute('role','dialog');
      wrap.innerHTML = `
        <header>
          <div class="mds-nav">
            <button type="button" data-act="prev" aria-label="Mês anterior">◀</button>
            <button type="button" data-act="next" aria-label="Mês seguinte">▶</button>
          </div>
          <div class="mds-title"></div>
        </header>
        <div class="mds-grid"></div>
        <div class="mds-footer"><button type="button" data-act="ok">OK</button></div>
      `;
      document.body.appendChild(wrap);
      this.popup = wrap;
      this.titleEl = wrap.querySelector('.mds-title');
      this.grid = wrap.querySelector('.mds-grid');
      this._render();
    }
    _bind(){
      const open = (ev)=>{
        ev && ev.preventDefault();
        this._position();
        this.popup.classList.remove('mds-hidden');
      };
      const close = ()=> this.popup.classList.add('mds-hidden');
      this.input.addEventListener('focus', open);
      this.input.addEventListener('click', open);

      this.popup.addEventListener('click', (e)=>{
        const act = e.target.getAttribute('data-act');
        if(act==='prev'){ this.view.setMonth(this.view.getMonth()-1); this._render(); }
        if(act==='next'){ this.view.setMonth(this.view.getMonth()+1); this._render(); }
        if(act==='ok'){ close(); }
        const day = e.target.getAttribute('data-day');
        if(day){
          const d = new Date(this.view.getFullYear(), this.view.getMonth(), Number(day));
          this.selected = d;
          this.input.value = formatDate(d, this.opts.format);
          this._render();
        }
      });
      document.addEventListener('click', (e)=>{
        if(!this.popup.contains(e.target) && e.target!==this.input){ this.popup.classList.add('mds-hidden'); }
      });
      window.addEventListener('resize', ()=> this._position());
      window.addEventListener('scroll', ()=> this._position(), true);
    }
    _position(){
      const rect = this.input.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 6;
      const left = rect.left + window.scrollX;
      this.popup.style.top = top + 'px';
      this.popup.style.left = left + 'px';
    }
    _render(){
      const y = this.view.getFullYear();
      const m = this.view.getMonth();
      const { months, weekdaysShort } = this.opts.i18n;
      this.titleEl.textContent = `${months[m]} ${y}`;
      const firstWeekday = (new Date(y, m, 1).getDay());
      const shift = (firstWeekday - this.opts.firstDay + 7) % 7;
      const daysInMonth = new Date(y, m+1, 0).getDate();

      const cells = [];
      for(let i=0;i<7;i++) cells.push(`<div class="mds-cell mds-dow">${weekdaysShort[(this.opts.firstDay+i)%7]}</div>`);
      for(let i=0;i<shift;i++) cells.push(`<div class="mds-cell mds-day mds-out"></div>`);
      for(let d=1; d<=daysInMonth; d++){
        const dt = new Date(y, m, d);
        const classes = ['mds-cell','mds-day'];
        if(sameDate(dt, new Date())) classes.push('mds-today');
        if(this.selected && sameDate(dt,this.selected)) classes.push('mds-selected');
        cells.push(`<div class="${classes.join(' ')}" data-day="${d}">${d}</div>`);
      }
      this.grid.innerHTML = cells.join('');
    }
  }
  window.MDSDatepicker = MDSDatepicker;
})();