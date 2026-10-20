// 📌 Política de reservas y cancelaciones — un solo texto para toda la plataforma
(function () {
  const HTML = `<div class="pol">
  <p class="pol-k">MRARRIETA.COM – RealTalk®</p>
  <h2 class="pol-t">Política de reservas y cancelaciones</h2>
  <p class="pol-only">Aplica para estudiantes <b>Premium</b> (4 u 8 clases al mes): las clases individuales son exclusivas de estos planes.</p>
  <section><h3>1. Reservas</h3><ul>
    <li><b>¿Cuándo reservar?</b> Desde <b>mañana</b> y hasta <b>5 días adelante</b>. Para hoy no se puede reservar. Eliges profe, fecha y hora desde tu perfil.</li>
    <li>Las clases de tu plan <b>no son acumulables</b>: úsalas dentro de tu periodo mensual; las que no uses se vencen y no se recuperan.</li>
    <li>Las <b>clases adicionales</b> que compres valen solo dentro de tu plan vigente.</li></ul></section>
  <section><h3>2. Cancelaciones</h3><ul>
    <li><b>Cancelar gratis:</b> hasta <b>12 horas antes</b> de la clase. La clase vuelve a tu saldo.</li>
    <li><b>Si cancelas con menos de 12 horas o no te conectas,</b> la clase se descuenta de tu plan y no se repone.</li></ul></section>
  <section><h3>3. Si tu profe no se conecta</h3><ul>
    <li>Repórtalo desde tu perfil con el botón <b>"Mi profe no se conectó"</b> (hasta 24 horas después de la clase).</li>
    <li>Administración lo revisa en máximo 24 horas y, si se confirma, <b>la clase vuelve a tu saldo</b>.</li></ul></section>
  <section><h3>4. Horario de la escuela</h3><p><b>Lunes a viernes:</b> 7:00 a. m. a 9:00 p. m. (jornada continua) · <b>Sábados:</b> 7:00 a. m. a 5:00 p. m. · <b>Domingos y festivos de Colombia:</b> no hay clases ni atención por chat. (Hora Colombia)</p></section>
  <section><h3>5. Duración y puntualidad</h3><ul>
    <li>Todas las clases individuales duran <b>50 minutos</b>, contados desde la hora reservada.</li>
    <li><b>Si llegas tarde, la clase no se extiende.</b> Ejemplo: si tu clase es a las 9:00 a. m. y te conectas a las 9:10 a. m., la clase termina a las 9:50 a. m. Los profes tienen otras clases asignadas que no pueden verse afectadas.</li>
    <li><b>Si a los 15 minutos no te has conectado,</b> el profe se retira y la clase se descuenta de tu plan.</li>
    <li>Si es el <b>profe</b> quien no se conecta en 15 minutos, usa el botón <b>"Mi profe no se conectó"</b> y, si se confirma, la clase vuelve a tu saldo.</li></ul></section>
  <section><h3>6. Cancelaciones por parte de MRARRIETA.COM</h3>
    <p>Si MRARRIETA.COM cancela una clase, esta será reprogramada sin costo para el estudiante.</p></section>
  <p class="pol-imp"><b>Importante:</b> los tiempos mínimos de reserva y cancelación se cuentan hacia atrás desde la hora de inicio de cada clase.</p>
</div>`;
  // 🧑‍🏫 política redactada PARA el profe
  const THTML = `<div class="pol">
  <p class="pol-k">MRARRIETA.COM – RealTalk®</p>
  <h2 class="pol-t">Política de clases para profesores</h2>
  <section><h3>1. Disponibilidad y reservas</h3><ul>
    <li>Publica en <b>Mi disponibilidad</b> solo los horarios en los que realmente puedes dictar.</li>
    <li>Los estudiantes reservan desde <b>mañana</b> y hasta <b>5 días adelante</b>. Nunca se reservan clases para el mismo día.</li>
    <li>Los estudiantes no tienen profe fijo: cualquier estudiante Premium puede reservar contigo.</li>
    <li><b>Antes de cada clase prepárate:</b> en <b>Resumen</b> o <b>Mis clases</b>, toca <b>"📝 Tablero"</b> en la clase. Ahí verás el <b>nivel y avance</b> del estudiante, el tema que quiere reforzar y, en <b>"Clases anteriores"</b>, lo que trabajaron otros profes con él.</li></ul></section>
  <section><h3>2. Duración y puntualidad</h3><ul>
    <li>Cada clase dura <b>50 minutos</b>, contados desde la hora reservada. Conéctate puntual.</li>
    <li><b>Si el estudiante llega tarde, la clase no se extiende.</b> Ejemplo: clase a las 9:00 a. m., el estudiante entra a las 9:10 a. m., la clase termina a las 9:50 a. m. Así no se afectan tus siguientes clases.</li>
    <li><b>Si a los 15 minutos el estudiante no se ha conectado,</b> puedes retirarte. Espera los 15 minutos completos y marca la clase como <b>"No asistió"</b>.</li></ul></section>
  <section><h3>3. Después de cada clase</h3><ul>
    <li>Marca la clase como <b>"Dictada"</b> o <b>"No asistió"</b> el mismo día.</li>
    <li>Escribe en el <b>tablero de la clase</b> lo que trabajaste (vocabulario, correcciones, tarea). El estudiante lo verá en su historial y el próximo profe sabrá qué se vio.</li></ul></section>
  <section><h3>4. Si no te conectas</h3><ul>
    <li>El estudiante puede reportarlo con el botón <b>"Mi profe no se conectó"</b>. Si se confirma, la clase vuelve a su saldo y se te descuentan <b>{PEN}</b> de tu pago del mes por esa clase.</li>
    <li>Si tienes un imprevisto, cancela desde <b>Mis clases → Cancelar clase</b>. Con <b>12 horas o más</b> de anticipación no hay multa (esa clase no se paga). Con <b>menos de 12 horas</b> se descuentan <b>{PEN}</b> de tu pago del mes. En ambos casos la clase vuelve al saldo del estudiante.</li></ul></section>
  <section><h3>5. Pagos</h3><ul>
    <li>Cada clase <b>dictada</b> (50 minutos) se paga a <b>{RATE}</b>.</li>
    <li>Si te conectas, esperas los 15 minutos y el estudiante no asiste, se pagan <b>{NOSHOW}</b>.</li>
    <li>Las clases canceladas (a tiempo o tarde) y las no dictadas no se pagan. Consulta tu detalle en <b>Mis pagos</b>.</li></ul></section>
  <section><h3>6. Horario de la escuela</h3><p><b>Lunes a viernes:</b> 7:00 a. m. a 9:00 p. m. · <b>Sábados:</b> 7:00 a. m. a 5:00 p. m. · <b>Domingos y festivos de Colombia:</b> no hay clases. (Hora Colombia)</p></section>
</div>`;
  function showTeacher(R) { R = R || {}; const cop = (n) => '$' + Number(n).toLocaleString('es-CO') + ' COP';
    const html = THTML.replace('{RATE}', cop(R.rate || 21800)).replace('{NOSHOW}', cop(R.noshow || 10000)).replace(/{PEN}/g, cop(R.penalty || 10000));
    const m = document.createElement('div'); m.className = 'modal pol-modal'; m.setAttribute('role', 'dialog'); m.innerHTML = `<div class="modal-card card pol-card">${html}<div style="text-align:center;margin-top:12px"><button class="btn k" id="pol-ok" style="padding:10px 26px;font-size:15px">✅ Leí y acepto</button></div></div>`; document.body.appendChild(m); m.querySelector('#pol-ok').onclick = () => { m.remove(); R.onAccept && R.onAccept(); }; return m; }
  function show(opts) {
    opts = opts || {};
    const m = document.createElement('div'); m.className = 'modal pol-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = `<div class="modal-card card pol-card">${opts.first ? '<p class="pol-first">👋 Antes de empezar, lee nuestra política. La encuentras siempre en tu perfil.</p>' : ''}${HTML}<div style="text-align:center;margin-top:12px"><button class="btn k" id="pol-ok" style="padding:10px 26px;font-size:15px">${opts.btn || '✅ Leí y acepto'}</button></div></div>`;
    document.body.appendChild(m);
    const close = () => { m.remove(); opts.onClose && opts.onClose(); };
    m.querySelector('#pol-ok').onclick = close; if (opts.btn) m.onclick = (e) => { if (e.target === m) close(); };
    return m;
  }
  // 🔗 «Ver condiciones» en los planes: abre la política completa (reservas, cancelaciones y vencimiento)
  document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-cond]'); if (!b) return; e.preventDefault(); e.stopPropagation(); show({ btn: 'Entendido' }); }, true);
  window.MRPOLICY = { html: HTML, teacherHtml: THTML, show, showTeacher, url: 'politica.html' };
})();
