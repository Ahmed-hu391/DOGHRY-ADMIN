const SUPABASE_URL =
  'https://ubwutnxafcrcpylpvqgs.supabase.co';

const SUPABASE_KEY =
  'sb_publishable_NSZ3i0xOCLLx9bH3zgGJuQ_rWCjJoRJ';

const sb =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================
   Elements
========================= */

const $ = id =>
  document.getElementById(id);

const root =
  document.documentElement;

const app =
  $('app');

const loginScreen =
  $('loginScreen');

const loginForm =
  $('loginForm');

const loginBtn =
  $('loginBtn');

const listEl =
  $('contributionsList');

const modalBackdrop =
  $('modalBackdrop');


let allContributions = [];

let editingId = null;


/* =========================
   Labels
========================= */

const typeLabels = {

  route:
    '🚌 خط مواصلات',

  stop:
    '📍 موقف / نقطة ركوب',

  correction:
    '✏️ تصحيح معلومة',

  driver:
    '🚐 سائق'

};


const statusLabels = {

  pending:
    'تحت المراجعة',

  approved:
    'معتمدة',

  rejected:
    'مرفوضة'

};


const fieldLabels = {

  routeFrom:
    'من',

  routeTo:
    'إلى',

  routeStops:
    'المواقف',

  routeTransport:
    'نوع المواصلات',

  routeFare:
    'الأجرة',

  stopName:
    'اسم الموقف',

  stopArea:
    'المنطقة',

  stopDetails:
    'التفاصيل',

  stopTransport:
    'نوع المواصلات',

  correctionSubject:
    'المعلومة',

  correctionDetails:
    'التصحيح',

  driverRoute:
    'الخط',

  driverTransport:
    'نوع المواصلات',

  driverDetails:
    'التفاصيل',

  driverExtra:
    'ملاحظات'

};


/* =========================
   Theme
========================= */

function applyTheme(theme){

  root.dataset.theme =
    theme;

  const icon =
    $('themeIcon');

  if(icon){

    icon.textContent =
      theme === 'dark'
        ? '☀'
        : '☾';

  }

  localStorage.setItem(
    'dughri-admin-theme',
    theme
  );

}


applyTheme(

  localStorage.getItem(
    'dughri-admin-theme'
  ) || 'dark'

);


$('themeToggle')
  ?.addEventListener(
    'click',
    () => {

      applyTheme(

        root.dataset.theme === 'dark'
          ? 'light'
          : 'dark'

      );

    }
  );


/* =========================
   Toast
========================= */

function showToast(message){

  const toast =
    $('toast');

  if(!toast) return;

  toast.textContent =
    message;

  toast.classList.add(
    'show'
  );

  clearTimeout(
    showToast.timer
  );

  showToast.timer =
    setTimeout(() => {

      toast.classList.remove(
        'show'
      );

    },3200);

}


/* =========================
   Helpers
========================= */

function formatDate(value){

  try{

    return new Intl.DateTimeFormat(
      'ar-EG',
      {
        dateStyle:'medium',
        timeStyle:'short'
      }
    ).format(
      new Date(value)
    );

  }catch{

    return value || '';

  }

}


function escapeHtml(value){

  return String(
    value ?? ''
  ).replace(
    /[&<>"']/g,
    char => ({

      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'

    }[char])
  );

}


function getData(row){

  if(
    row &&
    row.data &&
    typeof row.data === 'object'
  ){

    return row.data;

  }

  return {};

}


/*
  Visibility is stored inside data.public_visible.

  This means we don't need to add
  another database column.
*/

function isPublicVisible(row){

  const data =
    getData(row);

  if(
    data.public_visible === undefined
  ){

    return true;

  }

  return (
    data.public_visible === true ||
    data.public_visible === 'true'
  );

}


/* =========================
   Details
========================= */

function contributionDetails(row){

  const data =
    getData(row);

  const entries =
    Object.entries(data)

      .filter(([key]) =>
        key !== 'phone' &&
        key !== 'public_visible'
      )

      .filter(([,value]) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ''
      );


  if(!entries.length){

    return `
      <div class="no-details">
        لا توجد تفاصيل إضافية.
      </div>
    `;

  }


  return `

    <div class="details-title">
      تفاصيل المعلومة
    </div>

    <div class="details-list">

      ${entries.map(
        ([key,value]) => `

          <div class="detail-row">

            <span>
              ${escapeHtml(
                fieldLabels[key] ||
                key
              )}
            </span>

            <strong>
              ${escapeHtml(value)}
            </strong>

          </div>

        `
      ).join('')}

    </div>

  `;

}


/* =========================
   Load Contributions
========================= */

async function loadContributions(){

  listEl.innerHTML = `

    <div class="loader">

      <div class="spinner"></div>

      <span>
        جاري تحديث البيانات...
      </span>

    </div>

  `;


  const {
    data,
    error
  } =
    await sb

      .from('contributions')

      .select('*')

      .order(
        'created_at',
        {
          ascending:false
        }
      );


  if(error){

    console.error(error);

    listEl.innerHTML = `

      <div class="empty">

        <strong>
          حصلت مشكلة في تحميل البيانات
        </strong>

        <span>
          راجع صلاحيات Supabase
          أو الاتصال وبعدين جرّب تحديث الصفحة.
        </span>

      </div>

    `;

    showToast(
      error.message ||
      'تعذر تحميل البيانات'
    );

    return;

  }


  allContributions =
    data || [];


  updateStats();

  renderList();

}


/* =========================
   Statistics
========================= */

function updateStats(){

  const total =
    allContributions.length;


  const pending =
    allContributions.filter(
      row =>
        row.status === 'pending'
    ).length;


  const approved =
    allContributions.filter(
      row =>
        row.status === 'approved'
    ).length;


  const rejected =
    allContributions.filter(
      row =>
        row.status === 'rejected'
    ).length;


  /*
    "Visible" means the admin chose
    to show it publicly.

    Status does NOT affect visibility.
  */

  const visible =
    allContributions.filter(
      row =>
        isPublicVisible(row)
    ).length;


  $('totalCount').textContent =
    total;

  $('pendingCount').textContent =
    pending;

  $('approvedCount').textContent =
    approved;

  $('rejectedCount').textContent =
    rejected;

  $('visibleCount').textContent =
    visible;

}


/* =========================
   Render List
========================= */

function renderList(){

  const query =
    $('searchInput')
      .value
      .trim()
      .toLowerCase();


  const filter =
    $('statusFilter')
      .value;


  const rows =
    allContributions.filter(
      row => {

        const searchableText = `

          ${row.contributor_name || ''}

          ${row.phone || ''}

          ${typeLabels[row.type] || ''}

          ${row.type || ''}

        `.toLowerCase();


        return (

          (
            !query ||
            searchableText.includes(
              query
            )
          )

          &&

          (
            filter === 'all' ||
            row.status === filter
          )

        );

      }
    );


  if(!rows.length){

    listEl.innerHTML = `

      <div class="empty">

        <strong>
          مفيش نتائج
        </strong>

        <span>
          جرّب تغيّر البحث أو الفلترة.
        </span>

      </div>

    `;

    return;

  }


  listEl.innerHTML =

    rows.map(
      row => {

        const initial =
          escapeHtml(
            (
              row.contributor_name ||
              'د'
            )
              .trim()
              .charAt(0)
              .toUpperCase()
          );


        const status =
          statusLabels[
            row.status
          ] ||
          row.status ||
          'غير محدد';


        const points =
          Number.isFinite(
            row.points
          )
            ? row.points
            : 0;


        const visible =
          isPublicVisible(row);


        return `

          <article
            class="card"
            data-id="${escapeHtml(row.id)}"
          >

            <div class="card-top">

              <div class="avatar">
                ${initial}
              </div>


              <div class="card-main">

                <strong>
                  ${escapeHtml(
                    row.contributor_name
                  )}
                </strong>

                <small>

                  ${escapeHtml(
                    typeLabels[row.type] ||
                    row.type ||
                    'مساهمة'
                  )}

                  ·

                  ${escapeHtml(
                    formatDate(
                      row.created_at
                    )
                  )}

                </small>

              </div>


              <span
                class="status
                ${escapeHtml(
                  row.status
                )}"
              >

                ${escapeHtml(
                  status
                )}

              </span>

            </div>


            <div class="visibility-line">

              <span
                class="
                  visibility-badge
                  ${visible
                    ? 'visible'
                    : 'hidden'}
                "
              >

                ${visible
                  ? '● ظاهر'
                  : '○ مخفي'}

              </span>


              <span>

                ${visible
                  ? 'المساهمة ظاهرة للمساهمين'
                  : 'المساهمة مخفية عن المساهمين'}

              </span>

            </div>


            <div class="info-grid">

              <div class="info-box">

                <span>
                  الموبايل
                </span>

                <strong dir="ltr">
                  ${escapeHtml(
                    row.phone
                  )}
                </strong>

              </div>


              <div class="info-box">

                <span>
                  النقاط
                </span>

                <strong>
                  ${points}
                </strong>

              </div>

            </div>


            <div class="details-container">

              ${contributionDetails(row)}

            </div>


            <div class="card-actions">

              <button
                class="
                  action
                  action-primary
                "
                data-action="edit"
                data-id="${row.id}"
              >
                تعديل
              </button>


              <button
                class="
                  action
                  action-visibility
                "
                data-action="visibility"
                data-id="${row.id}"
              >

                ${visible
                  ? 'إخفاء'
                  : 'إظهار'}

              </button>


              ${
                row.status === 'pending'

                ? `

                  <button
                    class="
                      action
                      action-success
                    "
                    data-action="approve"
                    data-id="${row.id}"
                  >
                    اعتماد
                  </button>


                  <button
                    class="
                      action
                      action-danger
                    "
                    data-action="reject"
                    data-id="${row.id}"
                  >
                    رفض
                  </button>

                `

                : ''

              }


              <button
                class="
                  action
                  action-delete
                "
                data-action="delete"
                data-id="${row.id}"
              >
                حذف
              </button>

            </div>

          </article>

        `;

      }
    ).join('');

}


/* =========================
   Update Status
========================= */

async function updateStatus(
  id,
  status
){

  const {
    error
  } =

    await sb

      .from('contributions')

      .update({
        status
      })

      .eq(
        'id',
        id
      );


  if(error){

    console.error(error);

    showToast(
      'تعذر تحديث الحالة'
    );

    return;

  }


  showToast(

    status === 'approved'

      ? 'تم اعتماد المساهمة.'

      : 'تم رفض المساهمة.'

  );


  await loadContributions();

}


/* =========================
   Update Visibility
========================= */

async function updateVisibility(
  id,
  visible
){

  const row =
    allContributions.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if(!row) return;


  const oldData =
    getData(row);


  const newData = {

    ...oldData,

    public_visible:
      visible

  };


  const {
    error
  } =

    await sb

      .from('contributions')

      .update({

        data:
          newData

      })

      .eq(
        'id',
        id
      );


  if(error){

    console.error(error);

    showToast(
      'تعذر تغيير ظهور المساهمة'
    );

    return;

  }


  showToast(

    visible

      ? 'المساهمة أصبحت ظاهرة.'

      : 'المساهمة أصبحت مخفية.'

  );


  await loadContributions();

}


/* =========================
   Delete
========================= */

async function removeContribution(
  id
){

  const confirmed =
    confirm(
      'متأكد إنك عايز تحذف المساهمة دي نهائيًا؟'
    );


  if(!confirmed)
    return;


  const {
    error
  } =

    await sb

      .from('contributions')

      .delete()

      .eq(
        'id',
        id
      );


  if(error){

    console.error(error);

    showToast(
      'تعذر حذف المساهمة'
    );

    return;

  }


  showToast(
    'تم حذف المساهمة.'
  );


  await loadContributions();

}


/* =========================
   Open Edit
========================= */

function openEdit(row){

  editingId =
    row.id;


  $('editName').value =
    row.contributor_name ||
    '';


  $('editPhone').value =
    row.phone ||
    '';


  $('editType').value =
    row.type ||
    'route';


  $('editStatus').value =
    row.status ||
    'pending';


  $('editPoints').value =
    Number.isFinite(
      row.points
    )
      ? row.points
      : 0;


  $('editVisibility').value =
    isPublicVisible(row)
      ? 'true'
      : 'false';


  $('editData').value =
    JSON.stringify(
      getData(row),
      null,
      2
    );


  modalBackdrop.classList.add(
    'open'
  );


  setTimeout(
    () => {

      $('editName')?.focus();

    },
    180
  );

}


/* =========================
   Close Modal
========================= */

function closeModal(){

  editingId =
    null;

  modalBackdrop.classList.remove(
    'open'
  );

}


/* =========================
   Save Edit
========================= */

$('editForm')
  .addEventListener(
    'submit',
    async event => {

      event.preventDefault();


      if(!editingId)
        return;


      const points =
        Math.max(
          0,
          parseInt(
            $('editPoints').value,
            10
          ) || 0
        );


      let data;


      try{

        data =
          JSON.parse(
            $('editData').value ||
            '{}'
          );

      }

      catch{

        showToast(
          'تفاصيل المساهمة لازم تكون JSON صحيح.'
        );

        return;

      }


      data.public_visible =
        $('editVisibility').value ===
        'true';


      const payload = {

        contributor_name:
          $('editName')
            .value
            .trim(),

        phone:
          $('editPhone')
            .value
            .trim(),

        type:
          $('editType')
            .value,

        status:
          $('editStatus')
            .value,

        points,

        data

      };


      const {
        error
      } =

        await sb

          .from('contributions')

          .update(
            payload
          )

          .eq(
            'id',
            editingId
          );


      if(error){

        console.error(error);

        showToast(
          'فشل حفظ التعديلات'
        );

        return;

      }


      closeModal();


      showToast(
        'تم حفظ التعديلات بنجاح.'
      );


      await loadContributions();

    }
  );


/* =========================
   Card Actions
========================= */

listEl.addEventListener(
  'click',
  async event => {

    const button =
      event.target.closest(
        '[data-action]'
      );


    if(!button)
      return;


    const row =
      allContributions.find(
        item =>
          String(item.id) ===
          String(
            button.dataset.id
          )
      );


    if(!row)
      return;


    const action =
      button.dataset.action;


    if(
      action === 'approve'
    ){

      await updateStatus(
        row.id,
        'approved'
      );

    }


    else if(
      action === 'reject'
    ){

      await updateStatus(
        row.id,
        'rejected'
      );

    }


    else if(
      action === 'visibility'
    ){

      await updateVisibility(
        row.id,
        !isPublicVisible(row)
      );

    }


    else if(
      action === 'delete'
    ){

      await removeContribution(
        row.id
      );

    }


    else if(
      action === 'edit'
    ){

      openEdit(row);

    }

  }
);


/* =========================
   Search
========================= */

$('searchInput')
  ?.addEventListener(
    'input',
    renderList
  );


$('statusFilter')
  ?.addEventListener(
    'change',
    renderList
  );


$('refreshBtn')
  ?.addEventListener(
    'click',
    loadContributions
  );


/* =========================
   Modal Controls
========================= */

$('modalClose')
  ?.addEventListener(
    'click',
    closeModal
  );


$('cancelEdit')
  ?.addEventListener(
    'click',
    closeModal
  );


modalBackdrop.addEventListener(
  'click',
  event => {

    if(
      event.target ===
      modalBackdrop
    ){

      closeModal();

    }

  }
);


document.addEventListener(
  'keydown',
  event => {

    if(
      event.key === 'Escape' &&
      modalBackdrop.classList.contains(
        'open'
      )
    ){

      closeModal();

    }

  }
);


/* =========================
   Login
========================= */

loginForm.addEventListener(
  'submit',
  async event => {

    event.preventDefault();


    loginBtn.disabled =
      true;

    loginBtn.textContent =
      'جاري الدخول...';


    const {
      error
    } =

      await sb.auth.signInWithPassword({

        email:
          $('email')
            .value
            .trim(),

        password:
          $('password')
            .value

      });


    loginBtn.disabled =
      false;

    loginBtn.textContent =
      'دخول لوحة الإدارة';


    if(error){

      console.error(error);

      showToast(
        'البريد أو كلمة المرور غير صحيحة.'
      );

      return;

    }


    showApp();

  }
);


/* =========================
   Logout
========================= */

$('logoutBtn')
  ?.addEventListener(
    'click',
    async () => {

      await sb.auth.signOut();

      showLogin();

    }
  );


/* =========================
   Auth
========================= */

function showApp(){

  loginScreen.classList.add(
    'hidden'
  );

  app.hidden =
    false;

  loadContributions();

}


function showLogin(){

  app.hidden =
    true;

  loginScreen.classList.remove(
    'hidden'
  );

}


sb.auth.onAuthStateChange(
  (_event, session) => {

    if(session){

      showApp();

    }else{

      showLogin();

    }

  }
);


/* =========================
   Initial Session
========================= */

(async () => {

  const {
    data
  } =
    await sb.auth.getSession();


  if(data.session){

    showApp();

  }else{

    showLogin();

  }

})();
