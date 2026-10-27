# Tu aplicación independiente

Esta copia contiene el código de Quiniela Lab y un servidor con contraseña propia. No necesita ChatGPT para abrirse ni para funcionar. La aplicación está alojada en la cuenta del propietario en Render; este paquete también permite trasladarla a otro alojamiento compatible.

## Qué incluye

- La aplicación completa y sus modelos de goles, córners y remates.
- Acceso mediante una contraseña compartida, para uso personal. No incluye registro, correo ni recuperación de contraseña.
- Sesiones firmadas de 8 horas y cookies HttpOnly. En producción, las cookies requieren HTTPS.
- Bloqueo temporal tras 5 contraseñas incorrectas en 15 minutos por dirección de conexión. Está pensado para una sola instancia. Para varias instancias se necesita un limitador de intentos compartido.
- Los archivos y las estadísticas incluidas están protegidos por el servidor. No coloques `public/` en un alojamiento estático por separado: omitiría la protección.
- La quiniela se guarda por navegador; no se sincroniza entre dispositivos.
- El historial utiliza IndexedDB. Guarda automáticamente los primeros pronósticos de los próximos 14 días con fuente consultada y registra tus elecciones por separado. Los porcentajes originales permanecen fijos. Revisa resultados cuando se abre o actualiza la app, no con el navegador cerrado. Exporta CSV para conservar una copia.
- Fiabilidad evalúa una competición, modelo y línea a la vez: bandas de probabilidad, cumplimiento observado, intervalos, Brier y ECE. Solo usa registros automáticos previos al inicio; no inventa un historial previo ni mezcla jugadores experimentales o elecciones duplicadas. No reajusta los porcentajes con la misma muestra evaluada.
- Cada análisis desglosa producción propia, concesiones del rival, localía, tamaño de muestra y datos ausentes.
- Manifest, iconos y botón de instalación en dispositivos compatibles. En iPhone/iPad se muestra el procedimiento de añadir a la pantalla de inicio. El trabajador de servicio solo guarda un aviso público sin conexión; no cachea páginas privadas, scripts protegidos, datos o contraseñas.

## Publicarla en una cuenta tuya

1. Crea tu propia cuenta en un alojamiento que permita ejecutar Node.js 22.13 o posterior y proporcione HTTPS. Un alojamiento de archivos estáticos no ejecuta este servidor.
2. Sube este proyecto a tu repositorio o al alojamiento. Comando de inicio: `npm start`. No requiere instalar paquetes ni compilar.
3. En el panel privado del alojamiento configura estas variables:
   - `APP_PASSWORD`: contraseña larga y única, de al menos 12 caracteres. Créala tú; no la pongas en el código ni en este chat.
   - `SESSION_SECRET`: secreto aleatorio de al menos 32 caracteres. Puedes generarlo en tu ordenador con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Guárdalo solo en el panel privado.
   - `NODE_ENV`: `production`.
   - `PUBLIC_ORIGIN`: dirección HTTPS exacta del sitio, sin rutas. Primero usa la dirección proporcionada por tu alojamiento; al conectar un dominio propio, actualiza este valor.
4. El proveedor suele establecer `PORT` automáticamente. Comprueba que su comprobación de salud, si existe, use `/health`.
5. Abre la dirección del alojamiento. Aparecerá la pantalla de contraseña. Si después compras un dominio, conéctalo siguiendo las instrucciones de ese proveedor y actualiza `PUBLIC_ORIGIN`.

La sesión se puede cerrar desde el botón «Salir» en la cabecera. Para invalidar todas las sesiones, cambia `SESSION_SECRET` y reinicia la aplicación. Para cambiar tu contraseña, cambia `APP_PASSWORD` y también `SESSION_SECRET`.

## Probarla en tu ordenador

1. Instala Node.js desde su sitio oficial si todavía no lo tienes.
2. Copia `.env.example` a `.env`, sustituye los dos valores de ejemplo y mantén `NODE_ENV=development`.
3. Desde esta carpeta ejecuta `npm run start:local`.
4. Abre `http://localhost:3000`. La contraseña de prueba solo viaja por HTTP en tu ordenador; utiliza siempre HTTPS para publicar.

## Datos y límites

Los datos proceden de las interfaces públicas de ESPN, que pueden cambiar o no estar disponibles. Se incluye una copia real fechada de 2026/27. La aplicación muestra cuándo usa esa copia. Las consultas de resultados se hacen desde el navegador y requieren conexión a ESPN; las fichas de jugadores se pueden completar desde el análisis de cada partido.

Las probabilidades no tienen fiabilidad futura demostrada. Los goleadores son estimaciones experimentales condicionadas a participar; no hay minutos, alineaciones o bajas confirmadas. La comparación histórica no garantiza resultados.

No hay pagos, casas de apuestas ni cuentas de usuario con datos personales. El acceso con contraseña usa variables privadas del servidor, no una contraseña oculta en JavaScript. Este paquete no configura copias de seguridad, monitorización, correo ni escalado del alojamiento.
