(() => {
  const exprEl = document.getElementById('expr');
  const resultEl = document.getElementById('result');
  const keypad = document.querySelector('.keypad');
  const historyList = document.getElementById('historyList');
  const historyPreview = document.getElementById('historyPreview');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const themeSelect = document.getElementById('themeSelect'); // Tambahan: dropdown tema

  let expr = '';
  let history = JSON.parse(localStorage.getItem('calc_history') || '[]');
  let theme = localStorage.getItem('calc_theme') || 'light';

  document.documentElement.setAttribute('data-theme', theme);
  themeSelect.value = theme;

  function render(){
    exprEl.textContent = expr || '0';
    historyPreview.textContent = history.length ? history[0].expr + ' = ' + history[0].res : '';
    renderHistory();
  }

  function renderHistory(){
    historyList.innerHTML = '';
    history.slice(0,50).forEach((h) => {
      const li = document.createElement('li');
      li.textContent = `${h.expr} = ${h.res}`;
      li.title = 'Klik untuk menggunakan lagi';
      li.addEventListener('click', () => {
        expr = h.expr;
        render();
      });
      historyList.appendChild(li);
    });
  }

  function safeEvaluate(s){
    if(!/^[0-9+\-*/().\s^a-z]+$/.test(s)){
      throw new Error('Invalid characters');
    }

    // Tambahan: ubah simbol khusus ke JS
    s = s.replace(/÷/g,'/').replace(/x/g,'*');

    // Tambahan: dukungan fungsi matematika
    s = s.replace(/sqrt/gi, 'Math.sqrt')
         .replace(/sin/gi, 'Math.sin')
         .replace(/cos/gi, 'Math.cos')
         .replace(/tan/gi, 'Math.tan')
         .replace(/log/gi, 'Math.log10')
         .replace(/ln/gi, 'Math.log')
         .replace(/\^/g, '**'); // pangkat, misalnya 2^3 → 8

    return Function('return (' + s + ')')();
  }

  function calculate(){
    try{
      const val = safeEvaluate(expr);
      resultEl.textContent = val;
      history.unshift({expr: expr, res: val});
      localStorage.setItem('calc_history', JSON.stringify(history));
      render();
    }catch(e){
      resultEl.textContent = 'Error';
    }
  }

  keypad.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if(!btn) return;
    const v = btn.dataset.value;
    const action = btn.dataset.action;

    if(action === 'clear'){
      expr = '';
      resultEl.textContent = '';
      render();
      return;
    }
    if(action === 'delete'){
      expr = expr.slice(0,-1);
      render();
      return;
    }
    if(action === 'equals'){
      calculate();
      return;
    }

    expr += v;
    render();
  });

  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if(key === 'Enter' || key === '='){
      e.preventDefault(); calculate(); return;
    }
    if(key === 'Backspace'){
      expr = expr.slice(0,-1); render(); return;
    }
    if(key === 'Escape'){
      expr = ''; resultEl.textContent = ''; render(); return;
    }
    // Tambahan: izinkan huruf a-z untuk fungsi matematika
    if(/^[0-9+\-*/().^a-z]$/.test(key)){
      expr += key; render(); return;
    }
  });

  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('calc_history');
    render();
  });

  themeSelect.addEventListener('change', () => {
    theme = themeSelect.value; // Tambahan: simpan pilihan tema
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('calc_theme', theme);
  });

  render();
})();

