
    // IMPORTANT: use only the publishable key in the browser. Never place the service_role/secret key here.
    const SUPABASE_URL = 'https://ubwutnxafcrcpylpvqgs.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_NSZ3i0xOCLLx9bH3zgGJuQ_rWCjJoRJ';
    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const $ = (id) => document.getElementById(id);
    const root = document.documentElement;
    const app = $('app');
    const loginScreen = $('loginScreen');
    const loginForm = $('loginForm');
    const loginBtn = $('loginBtn');
    const listEl = $('contributionsList');
    const modalBackdrop = $('modalBackdrop');
    let allContributions = [];
    let editingId = null;

    const typeLabels = {
      route: 'أضيف خط مواصلات',
      stop: 'أضيف موقف أو نقطة ركوب',
      correction: 'أصحح معلومة',
      driver: 'أنا سائق'
    };
    const statusLabels = { pending:'تحت المراجعة', approved:'معتمدة', rejected:'مرفوضة' };
    const fieldLabels = {
      routeFrom:'من', routeTo:'إلى', routeStops:'المواقف', routeTransport:'نوع المواصلات', routeFare:'الأجرة',
      stopName:'اسم الموقف', stopArea:'المنطقة', stopDetails:'تفاصيل', stopTransport:'نوع المواصلات',
      correctionSubject:'المعلومة', correctionDetails:'التصحيح',
      driverRoute:'الخط', driverTransport:'نوع المواصلات', driverDetails:'التفاصيل', driverExtra:'ملاحظات'
    };

    function applyTheme(theme){
      root.dataset.theme = theme;
      $('themeIcon').textContent = theme === 'dark' ? '☀' : '☾';
      localStorage.setItem('dughri-admin-theme', theme);
    }
    applyTheme(localStorage.getItem('dughri-admin-theme') || 'dark');
    $('themeToggle').addEventListener('click',()=>applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

    function showToast(msg){
      const toast = $('toast'); toast.textContent = msg; toast.classList.add('show');
      clearTimeout(showToast.t); showToast.t = setTimeout(()=>toast.classList.remove('show'),3400);
    }
    function formatDate(value){
      try{return new Intl.DateTimeFormat('ar-EG',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}
      catch{return value || '';}
    }
    function safeJson(value){return JSON.stringify(value || {}, null, 2)}
    function escapeHtml(value){return String(value ?? '').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
    function contributionDetails(row){
      const data = row.data || {};
      return Object.entries(data).filter(([k])=>k!=='phone').map(([k,v])=>`<b>${escapeHtml(fieldLabels[k]||k)}:</b> ${escapeHtml(v)}`).join(' · ');
    }

    async function loadContributions(){
      listEl.innerHTML='<div class="loader"><div class="spinner"></div>جاري تحديث البيانات...</div>';
      const {data,error} = await sb.from('contributions').select('*').order('created_at',{ascending:false});
      if(error){
        console.error(error);
        listEl.innerHTML='<div class="empty"><strong>حصلت مشكلة في تحميل البيانات</strong>راجع صلاحيات Supabase أو الاتصال وبعدين جرّب تحديث الصفحة.</div>';
        showToast(error.message || 'تعذر تحميل البيانات');
        return;
      }
      allContributions = data || [];
      updateStats(); renderList();
    }

    function updateStats(){
      $('totalCount').textContent = allContributions.length;
      $('pendingCount').textContent = allContributions.filter(x=>x.status==='pending').length;
      $('approvedCount').textContent = allContributions.filter(x=>x.status==='approved').length;
      $('rejectedCount').textContent = allContributions.filter(x=>x.status==='rejected').length;
    }

    function renderList(){
      const q = $('searchInput').value.trim().toLowerCase();
      const filter = $('statusFilter').value;
      const rows = allContributions.filter(row=>{
        const text = `${row.contributor_name||''} ${row.phone||''} ${typeLabels[row.type]||row.type||''}`.toLowerCase();
        return (!q || text.includes(q)) && (filter==='all' || row.status===filter);
      });
      if(!rows.length){ listEl.innerHTML='<div class="empty"><strong>مفيش نتائج</strong><span>جرّب تغير البحث أو حالة الفلترة.</span></div>';return; }
      listEl.innerHTML = rows.map(row=>{
        const initial = escapeHtml((row.contributor_name||'د').trim().charAt(0).toUpperCase());
        const status = escapeHtml(statusLabels[row.status] || row.status);
        const points = Number.isFinite(row.points) ? row.points : 0;
        return `<article class="card">
          <div class="card-top">
            <div class="avatar">${initial}</div>
            <div class="card-main"><strong>${escapeHtml(row.contributor_name)}</strong><small>${escapeHtml(typeLabels[row.type]||row.type||'مساهمة')} · ${escapeHtml(formatDate(row.created_at))}</small></div>
            <span class="status ${escapeHtml(row.status)}">${status}</span>
          </div>
          <div class="info-grid">
            <div class="info-box"><span>الموبايل</span><strong dir="ltr">${escapeHtml(row.phone)}</strong></div>
            <div class="info-box"><span>النقاط</span><strong>${points}</strong></div>
          </div>
          <div class="detail-preview">${contributionDetails(row) || 'مفيش تفاصيل إضافية.'}</div>
          <div class="card-actions">
            ${row.status==='pending' ? `<button class="action action-primary" data-action="approve" data-id="${row.id}">اعتماد</button><button class="action action-ghost" data-action="edit" data-id="${row.id}">تعديل</button><button class="action action-danger" data-action="reject" data-id="${row.id}">رفض</button>` : `<button class="action action-primary" data-action="edit" data-id="${row.id}">تعديل</button><button class="action action-ghost" data-action="toggle" data-id="${row.id}">${row.status==='approved'?'رفض':'اعتماد'}</button><button class="action action-danger" data-action="delete" data-id="${row.id}">حذف</button>`}
          </div>
        </article>`;
      }).join('');
    }

    async function updateStatus(id,status){
      const {error}=await sb.from('contributions').update({status}).eq('id',id);
      if(error){showToast('تعذر تحديث الحالة');console.error(error);return;}
      showToast(status==='approved'?'تم اعتماد المساهمة.':'تم رفض المساهمة.');
      await loadContributions();
    }

    async function removeContribution(id){
      if(!confirm('متأكد إنك عايز تحذف المساهمة دي نهائيًا؟')) return;
      const {error}=await sb.from('contributions').delete().eq('id',id);
      if(error){showToast('تعذر حذف المساهمة');console.error(error);return;}
      showToast('تم حذف المساهمة.'); await loadContributions();
    }

    function openEdit(row){
      editingId = row.id;
      $('editName').value = row.contributor_name || '';
      $('editPhone').value = row.phone || '';
      $('editType').value = row.type || 'route';
      $('editStatus').value = row.status || 'pending';
      $('editPoints').value = Number.isFinite(row.points) ? row.points : 0;
      $('editData').value = safeJson(row.data);
      modalBackdrop.classList.add('open');
    }
    function closeModal(){editingId=null;modalBackdrop.classList.remove('open');}

    $('editForm').addEventListener('submit',async e=>{
      e.preventDefault();
      const points=Math.max(0,parseInt($('editPoints').value,10)||0);
      let data;
      try{data=JSON.parse($('editData').value||'{}');}catch{showToast('بيانات المساهمة مش JSON صحيح');return;}
      const payload={
        contributor_name:$('editName').value.trim(),
        phone:$('editPhone').value.trim(),
        type:$('editType').value,
        status:$('editStatus').value,
        points,
        data
      };
      const {error}=await sb.from('contributions').update(payload).eq('id',editingId);
      if(error){console.error(error);showToast('فشل حفظ التعديلات');return;}
      closeModal(); showToast('تم حفظ التعديلات.'); await loadContributions();
    });

    listEl.addEventListener('click',async e=>{
      const btn=e.target.closest('[data-action]'); if(!btn) return;
      const row=allContributions.find(x=>String(x.id)===String(btn.dataset.id)); if(!row) return;
      const action=btn.dataset.action;
      if(action==='approve') await updateStatus(row.id,'approved');
      else if(action==='reject') await updateStatus(row.id,'rejected');
      else if(action==='toggle') await updateStatus(row.id,row.status==='approved'?'rejected':'approved');
      else if(action==='delete') await removeContribution(row.id);
      else if(action==='edit') openEdit(row);
    });

    $('searchInput').addEventListener('input',renderList);
    $('statusFilter').addEventListener('change',renderList);
    $('refreshBtn').addEventListener('click',loadContributions);
    $('modalClose').addEventListener('click',closeModal);
    $('cancelEdit').addEventListener('click',closeModal);
    modalBackdrop.addEventListener('click',e=>{if(e.target===modalBackdrop)closeModal()});

    loginForm.addEventListener('submit',async e=>{
      e.preventDefault(); loginBtn.disabled=true; loginBtn.textContent='جاري الدخول...';
      const {error}=await sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
      loginBtn.disabled=false; loginBtn.textContent='دخول';
      if(error){showToast('البريد أو كلمة المرور غير صحيحة.');console.error(error);return;}
      showApp();
    });

    $('logoutBtn').addEventListener('click',async()=>{await sb.auth.signOut();showLogin();});

    function showApp(){loginScreen.classList.add('hidden');app.hidden=false;loadContributions();}
    function showLogin(){app.hidden=true;loginScreen.classList.remove('hidden');}

    sb.auth.onAuthStateChange((_event,session)=>{ if(session) showApp(); else showLogin(); });
    (async()=>{const {data}=await sb.auth.getSession();if(data.session)showApp();else showLogin();})();
  
