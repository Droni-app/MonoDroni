# AppiV2

AdonisJS API — desplegado en `appi.droni.vip`.

## Despliegue con Docker

### 1. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con APP_KEY, DB_USER, DB_PASSWORD, DB_DATABASE, credenciales de mail, etc.
```

### 2. Levantar el contenedor

```bash
docker compose up -d --build
```

### 3. Correr migraciones

```bash
docker compose exec app node ace migration:run --force
```

### Otros comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f app

# Rollback de migraciones
docker compose exec app node ace migration:rollback

# Abrir consola REPL de Adonis
docker compose exec app node ace repl

# Reiniciar el contenedor
docker compose restart app

# Detener
docker compose down
```
