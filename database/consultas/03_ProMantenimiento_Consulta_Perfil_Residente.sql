SELECT
    u.id AS usuario_id,
    u.firebase_uid,
    u.nombres,
    u.apellidos,
    u.correo,
    t.codigo AS torre,
    ur.piso,
    ur.numero AS departamento,
    uu.relacion,
    uu.es_principal
FROM bdpromantenimiento20262.usuario_perfil u
JOIN bdpromantenimiento20262.usuario_unidad uu
    ON uu.usuario_id = u.id
JOIN bdpromantenimiento20262.unidad_residencial ur
    ON ur.id = uu.unidad_id
JOIN bdpromantenimiento20262.torre t
    ON t.id = ur.torre_id
WHERE u.correo IN (
    'residente@gmail.com',
    'residente2@gmail.com'
);