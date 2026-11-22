# dabgestion
Sitio web de DAB Prevención y Gestión

## Comprobaciones sin servicios de pago

`python3 scripts/check_seo.py` comprueba sitemap, canónicas, redirecciones HTML,
encabezados, enlaces internos y JSON-LD. `--live` añade una comprobación HTTP de
las páginas del sitemap. No mide posiciones ni demuestra indexación en Google.

Los enlaces históricos conservan los parámetros de campaña y el fragmento al
llegar a su página final. Se mantiene el meta refresh inmediato como alternativa
sin JavaScript; en esa alternativa los parámetros no se conservan. En GitHub
Pages estas páginas responden HTTP 200: no son redirecciones HTTP 301.

IndexNow está preparado para avisar a los buscadores participantes de cambios
concretos. La clave de propiedad se sirve en `/indexnow-key.txt`. Para revisar
un envío sin ejecutarlo:

```sh
python3 scripts/submit_indexnow.py https://dabgestion.com/higiene-seguridad-godoy-cruz/
```

Añadir `--submit` después de publicar verifica la clave disponible en el dominio
y envía las URL indicadas una sola vez. Usar únicamente URL añadidas, modificadas
o eliminadas en esa publicación; no reenviar todo el sitemap periódicamente.
Una respuesta 200 o 202 confirma recepción, no rastreo, indexación ni posiciones.

Los clics de WhatsApp, teléfono o correo en Analytics son intentos de contacto.
Las consultas recibidas y los trabajos contratados necesitan registro comercial.
