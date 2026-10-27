# Quiniela Lab para Android

Aplicación Android nativa con una vista web conectada a https://quiniela-lab-jose.onrender.com/.
Android 8 o posterior. Necesita Internet. Usa la contraseña configurada en la web; no se incluye ninguna contraseña en la aplicación.

El historial se guarda en este dispositivo, separado del navegador. La sesión sigue la duración definida por el servidor. La web y sus estadísticas se actualizan sin reinstalar el APK. El servidor gratuito puede tardar en arrancar.

## Compilar
Abrir esta carpeta en Android Studio con SDK 35, JDK 17 y Gradle 8.13; o ejecutar gradle -p android assembleRelease lintRelease desde la raíz del repositorio. El flujo GitHub Actions hace la misma compilación y produce un APK sin firma. Firmarlo con una clave privada del propietario antes de instalarlo.

Conservar la clave de firma fuera del repositorio: las actualizaciones deben firmarse con la misma clave e incrementar versionCode. No publicar claves ni contraseñas en GitHub. Esta entrega es para instalación directa; no está publicada en Google Play.
