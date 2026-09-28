<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>دُغري | Admin</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg: #f5f7fb;
      --card: #ffffff;
      --soft: #f1f5f9;
      --text: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;

      --blue: #2563eb;
      --green: #16a34a;
      --red: #dc2626;
      --orange: #d97706;
      --gold: #c58b22;

      --shadow: 0 15px 45px rgba(15, 23, 42, .08);
    }

    :root[data-theme="dark"] {
      --bg: #07111f;
      --card: #0f172a;
      --soft: #172236;
      --text: #f8fafc;
      --muted: #94a3b8;
      --border: #243247;

      --blue: #60a5fa;
      --green: #4ade80;
      --red: #f87171;
      --orange: #fbbf24;
      --gold: #f2c05c;

      --shadow: 0 20px 60px rgba(0,0,0,.25);
    }

    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      font-family: "Cairo", sans-serif;
      background:
        radial-gradient(circle at 10% 0%, rgba(37,99,235,.08), transparent 25%),
        radial-gradient(circle at 90% 10%, rgba(197,139,34,.07), transparent 25%),
        var(--bg);
      color: var(--text);
      transition: .3s;
    }

    button,
    input,
    textarea,
    select {
      font-family: inherit;
    }

    button {
      cursor: pointer;
    }

    .hidden {
      display: none !important;
    }

    /* LOGIN */

    .login-screen {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 20px;
    }

    .login-card {
      width: min(430px, 100%);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 28px;
      box-shadow: var(--shadow);
      animation: rise .6s ease;
    }

    .login-logo {
      width: 58px;
      height: 58px;
      border-radius: 18px;
      display: grid;
      place-items: center;
      background: linear-gradient(145deg,#2563eb,#0f172a);
      color: white;
      font-size: 25px;
      font-weight: 800;
      margin-bottom: 15px;
    }

    .login-card h1 {
      margin: 0;
      font-size: 23px;
    }

    .login-card p {
      color: var(--muted);
      font-size: 11px;
      line-height: 1.8;
      margin: 5px 0 22px;
    }

    .field {
      margin-bottom: 12px;
    }

    .field label {
      display: block;
      color: var(--muted);
      font-size: 10px;
      margin-bottom: 5px;
    }

    .field input,
    .field select,
    .field textarea {
      width: 100%;
      border: 1px solid var(--border);
      background: var(--soft);
      color: var(--text);
      border-radius: 14px;
      padding: 12px;
      outline: none;
    }

    .field input,
    .field select {
      height: 48px;
    }

    .field textarea {
      min-height: 120px;
      resize: vertical;
    }

    .field input:focus,
    .field select:focus,
    .field textarea:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 4px rgba(37,99,235,.08);
    }

    .primary-btn {
      width: 100%;
      height: 50px;
      border: 0;
      border-radius: 15px;
      background: var(--blue);
      color: white;
      font-weight: 800;
      box-shadow: 0 12px 25px rgba(37,99,235,.18);
    }

    /* APP */

    .app {
      width: min(1250px, 100%);
      margin: auto;
      padding: 15px;
    }

    .topbar {
      position: sticky;
      top: 12px;
      z-index: 50;

      display: flex;
      align-items: center;
      gap: 12px;

      background: rgba(255,255,255,.75);
      backdrop-filter: blur(20px);

      border: 1px solid var(--border);
      border-radius: 20px;

      padding: 12px 15px;

      box-shadow: var(--shadow);
    }

    :root[data-theme="dark"] .topbar {
      background: rgba(15,23,42,.78);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }

    .brand-icon {
      width: 43px;
      height: 43px;
      border-radius: 14px;
      background: linear-gradient(145deg,#2563eb,#0f172a);
      display: grid;
      place-items: center;
      color: white;
      font-weight: 800;
    }

    .brand strong {
      display: block;
      font-size: 14px;
    }

    .brand span {
      display: block;
      font-size: 9px;
      color: var(--muted);
    }

    .top-actions {
      display: flex;
      gap: 7px;
    }

    .icon-btn,
    .logout-btn {
      border: 1px solid var(--border);
      background: var(--soft);
      color: var(--text);
      border-radius: 13px;
      height: 42px;
      padding: 0 13px;
    }

    .icon-btn {
      width: 42px;
      padding: 0;
    }

    .logout-btn {
      color: var(--red);
    }

    /* HERO */

    .hero {
      margin-top: 18px;
      padding: 28px;
      border-radius: 28px;
      background:
        radial-gradient(circle at 90% 20%,rgba(37,99,235,.13),transparent 25%),
        var(--card);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      animation: rise .6s ease;
    }

    .hero small {
      color: var(--blue);
      font-weight: 700;
    }

    .hero h2 {
      margin: 6px 0;
      font-size: clamp(25px,5vw,38px);
    }

    .hero p {
      margin: 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 2;
      max-width: 650px;
    }

    /* STATS */

    .stats {
      display: grid;
      grid-template-columns: repeat(4,1fr);
      gap: 12px;
      margin-top: 14px;
    }

    .stat {
      padding: 18px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: var(--shadow);
    }

    .stat span {
      color: var(--muted);
      font-size: 10px;
    }

    .stat strong {
      display: block;
      font-size: 28px;
      margin-top: 5px;
    }

    /* MAIN PANEL */

    .panel {
      margin-top: 15px;
      padding: 18px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 25px;
      box-shadow: var(--shadow);
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 15px;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 18px;
    }

    .panel-header p {
      margin: 3px 0 0;
      color: var(--muted);
      font-size: 10px;
    }

    .filters {
      display: grid;
      grid-template-columns: 1fr 190px;
      gap: 10px;
      margin-bottom: 15px;
    }

    .filters input,
    .filters select {
      height: 47px;
      border: 1px solid var(--border);
      background: var(--soft);
      color: var(--text);
      border-radius: 14px;
      padding: 0 13px;
      outline: none;
    }

    /* CONTRIBUTIONS */

    .contributions {
      display: grid;
      gap: 14px;
    }

    .contribution {
      background: var(--soft);
      border: 1px solid var(--border);
      border-radius: 22px;
      padding: 17px;
      transition: .25s;
    }

    .contribution:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(15,23,42,.07);
    }

    .contribution-head {
      display: flex;
      align-items: flex-start;
      gap: 11px;
    }

    .avatar {
      width: 48px;
      height: 48px;
      flex: 0 0 48px;
      border-radius: 15px;
      display: grid;
      place-items: center;
      color: white;
      background: linear-gradient(145deg,#2563eb,#1e3a8a);
      font-weight: 800;
    }

    .person {
      flex: 1;
      min-width: 0;
    }

    .person strong {
      display: block;
      font-size: 14px;
    }

    .person small {
      color: var(--muted);
      font-size: 9px;
    }

    .status {
      padding: 6px 9px;
      border-radius: 999px;
      font-size: 9px;
      font-weight: 700;
    }

    .status.pending {
      background: rgba(217,119,6,.12);
      color: var(--orange);
    }

    .status.approved {
      background: rgba(22,163,74,.12);
      color: var(--green);
    }

    .status.rejected {
      background: rgba(220,38,38,.12);
      color: var(--red);
    }

    /* DATA */

    .data-section {
      margin-top: 14px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 18px;
      overflow: hidden;
    }

    .data-title {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      font-size: 11px;
      font-weight: 800;
    }

    .data-grid {
      display: grid;
      grid-template-columns: repeat(2,1fr);
    }

    .data-item {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
    }

    .data-item:nth-child(odd) {
      border-left: 1px solid var(--border);
    }

    .data-item span {
      display: block;
      color: var(--muted);
      font-size: 8px;
      margin-bottom: 3px;
    }

    .data-item strong {
      display: block;
      font-size: 11px;
      line-height: 1.7;
      word-break: break-word;
    }

    /* CONTROL */

    .control-panel {
      margin-top: 14px;
      padding: 14px;
      border-radius: 18px;
      background: var(--card);
      border: 1px solid var(--border);
    }

    .control-title {
      font-size: 10px;
      color: var(--muted);
      margin-bottom: 9px;
    }

    .controls {
      display: grid;
      grid-template-columns: repeat(4,1fr);
      gap: 8px;
    }

    .control-btn {
      height: 43px;
      border-radius: 13px;
      border: 1px solid var(--border);
      background: var(--soft);
      color: var(--text);
      font-weight: 700;
      font-size: 10px;
      transition: .2s;
    }

    .control-btn:hover {
      transform: translateY(-1px);
    }

    .approve {
      background: rgba(22,163,74,.12);
      color: var(--green);
    }

    .reject {
      background: rgba(220,38,38,.1);
      color: var(--red);
    }

    .visible {
      background: rgba(37,99,235,.12);
      color: var(--blue);
    }

    .points {
      background: rgba(197,139,34,.12);
      color: var(--gold);
    }

    .delete {
      background: rgba(220,38,38,.08);
      color: var(--red);
    }

    /* EMPTY */

    .empty {
      text-align: center;
      padding: 45px 15px;
      border: 1px dashed var(--border);
      border-radius: 18px;
      color: var(--muted);
    }

    .empty strong {
      display: block;
      color: var(--text);
      margin-bottom: 5px;
    }

    /* MODAL */

    .modal-bg {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: none;
      place-items: center;
      padding: 15px;
      background: rgba(2,6,23,.55);
      backdrop-filter: blur(7px);
    }

    .modal-bg.open {
      display: grid;
    }

    .modal {
      width: min(720px,100%);
      max-height: 92vh;
      overflow-y: auto;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 25px;
      padding: 20px;
      box-shadow: 0 30px 100px rgba(0,0,0,.25);
      animation: rise .3s ease;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
    }

    .modal-header h3 {
      margin: 0;
    }

    .close {
      width: 38px;
      height: 38px;
      border: 0;
      border-radius: 12px;
      background: var(--soft);
      color: var(--text);
      font-size: 20px;
    }

    .modal-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .modal-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }

    .save-btn,
    .cancel-btn {
      height: 47px;
      border: 0;
      border-radius: 14px;
      font-weight: 800;
    }

    .save-btn {
      background: var(--blue);
      color: white;
    }

    .cancel-btn {
      background: var(--soft);
      color: var(--text);
      border: 1px solid var(--border);
    }

    /* TOAST */

    .toast {
      position: fixed;
      left: 50%;
      bottom: 20px;
      transform: translate(-50%,20px);
      opacity: 0;
      pointer-events: none;
      z-index: 200;
      background: #0f172a;
      color: white;
      padding: 11px 17px;
      border-radius: 13px;
      font-size: 10px;
      transition: .3s;
    }

    .toast.show {
      opacity: 1;
      transform: translate(-50%,0);
    }

    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media(max-width:750px) {

      .stats {
        grid-template-columns: 1fr 1fr;
      }

      .filters {
        grid-template-columns: 1fr;
      }

      .controls {
        grid-template-columns: 1fr 1fr;
      }

      .data-grid {
        grid-template-columns: 1fr;
      }

      .data-item:nth-child(odd) {
        border-left: 0;
      }

      .modal-grid {
        grid-template-columns: 1fr;
      }
    }

    @media(max-width:480px) {

      .app {
        padding: 9px;
      }

      .hero {
        padding: 21px;
      }

      .stats {
        gap: 8px;
      }

      .stat {
        padding: 14px;
      }

      .stat strong {
        font-size: 23px;
      }

      .contribution {
        padding: 13px;
      }

      .controls {
        grid-template-columns: 1fr 1fr;
      }

      .brand span {
        display: none;
      }

      .logout-btn {
        font-size: 10px;
      }
    }
  </style>
</head>

<body>

  <!-- LOGIN -->

  <section class="login-screen" id="loginScreen">

    <div class="login-card">

      <div class="login-logo">د</div>

      <h1>دُغري — لوحة الإدارة</h1>

      <p>
        إدارة المساهمات ومراجعة المعلومات والتحكم في ظهورها للمساهمين.
      </p>

      <form id="loginForm">

        <div class="field">
          <label>البريد الإلكتروني</label>
          <input id="email" type="email" required>
        </div>

        <div class="field">
          <label>كلمة المرور</label>
          <input id="password" type="password" required>
        </div>

        <button class="primary-btn" id="loginBtn">
          دخول لوحة الإدارة
        </button>

      </form>

    </div>

  </section>


  <!-- APP -->

  <div class="app hidden" id="app">

    <header class="topbar">

      <div class="brand">

        <div class="brand-icon">د</div>

        <div>
          <strong>دُغري</strong>
          <span>لوحة إدارة المساهمات</span>
        </div>

      </div>

      <div class="top-actions">

        <button class="icon-btn" id="themeBtn">
          ☾
        </button>

        <button class="logout-btn" id="logoutBtn">
          خروج
        </button>

      </div>

    </header>


    <section class="hero">

      <small>CONTROL CENTER</small>

      <h2>
        كل معلومة في مكانها.
      </h2>

      <p>
        راجع البيانات، نظّم معلومات المساهمين، اعتمد المساهمات،
        حدّد النقاط، وتحكم في ظهور كل مساهمة على الموقع العام.
      </p>

    </section>


    <section class="stats">

      <div class="stat">
        <span>كل المساهمات</span>
        <strong id="total">0</strong>
      </div>

      <div class="stat">
        <span>تحت المراجعة</span>
        <strong id="pending">0</strong>
      </div>

      <div class="stat">
        <span>المعتمدة</span>
        <strong id="approved">0</strong>
      </div>

      <div class="stat">
        <span>الظاهرة للمساهمين</span>
        <strong id="visible">0</strong>
      </div>

    </section>


    <section class="panel">

      <div class="panel-header">

        <div>
          <h3>المساهمات</h3>
          <p>
            كل مساهمة هنا قابلة للمراجعة والتعديل.
          </p>
        </div>

        <button class="icon-btn" id="refreshBtn">
          ↻
        </button>

      </div>


      <div class="filters">

        <input
          id="search"
          placeholder="ابحث بالاسم أو الموبايل أو نوع المساهمة..."
        >

        <select id="filter">

          <option value="all">
            كل الحالات
          </option>

          <option value="pending">
            تحت المراجعة
          </option>

          <option value="approved">
            معتمدة
          </option>

          <option value="rejected">
            مرفوضة
          </option>

        </select>

      </div>


      <div class="contributions" id="list">

        <div class="empty">
          <strong>جاري تحميل البيانات...</strong>
          انتظر لحظة.
        </div>

      </div>

    </section>

  </div>


  <!-- EDIT MODAL -->

  <div class="modal-bg" id="modal">

    <div class="modal">

      <div class="modal-header">

        <h3>
          تعديل المساهمة
        </h3>

        <button class="close" id="closeModal">
          ×
        </button>

      </div>


      <form id="editForm">

        <div class="modal-grid">

          <div class="field">
            <label>اسم المساهم</label>
            <input id="editName" required>
          </div>

          <div class="field">
            <label>رقم الموبايل</label>
            <input id="editPhone" required>
          </div>

          <div class="field">
            <label>نوع المساهمة</label>

            <select id="editType">

              <option value="route">
                أضيف خط مواصلات
              </option>

              <option value="stop">
                أضيف موقف أو نقطة ركوب
              </option>

              <option value="correction">
                أصحح معلومة
              </option>

              <option value="driver">
                أنا سائق
              </option>

            </select>

          </div>

          <div class="field">
            <label>الحالة</label>

            <select id="editStatus">

              <option value="pending">
                تحت المراجعة
              </option>

              <option value="approved">
                معتمدة
              </option>

              <option value="rejected">
                مرفوضة
              </option>

            </select>

          </div>

          <div class="field">
            <label>النقاط</label>
            <input id="editPoints" type="number" min="0" required>
          </div>

          <div class="field">
            <label>ظهور المساهمة للمساهمين</label>

            <select id="editVisibility">

              <option value="true">
                تظهر للمساهمين
              </option>

              <option value="false">
                مخفية عن المساهمين
              </option>

            </select>

          </div>

        </div>


        <div class="field">

          <label>
            بيانات المساهمة
          </label>

          <textarea
            id="editData"
            dir="ltr"
            spellcheck="false"
            required
          ></textarea>

        </div>


        <div class="modal-actions">

          <button
            type="button"
            class="cancel-btn"
            id="cancelEdit"
          >
            إلغاء
          </button>

          <button
            type="submit"
            class="save-btn"
          >
            حفظ التعديلات
          </button>

        </div>

      </form>

    </div>

  </div>


  <div class="toast" id="toast"></div>


  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="admin.js"></script>

</body>
</html>
