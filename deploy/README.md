# Деплой sportnis

CI/CD (GitHub Actions) на push в `develop`: собирает образы `sportnis-api` / `sportnis-web`,
пушит в Docker Hub, по SSH разворачивает `docker-compose.prod.yml` на сервере
(`~/sportnis`). Наружу торчит только контейнер `web` на `127.0.0.1:8082`; публично его
отдаёт **хостовый nginx** (реверс-прокси + TLS), который уже слушает 80/443.

## GitHub Secrets (Settings → Secrets and variables → Actions)
- `DOCKER_HUB_LOGIN`, `DOCKER_HUB_TOKEN`
- `SERVER_USER`, `SERVER_PASSWORD`
- `POSTGRES_PASSWORD` — `openssl rand -base64 24` (задаётся один раз, не меняется)
- `APP_JWT_SECRET` — `openssl rand -base64 48`

## Хостовый nginx: маршрут для sportnis.ru
Создать `/etc/nginx/sites-available/sportnis.ru` (или файл в `/etc/nginx/conf.d/`):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name sportnis.ru;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активировать и перезагрузить:
```bash
sudo ln -s /etc/nginx/sites-available/sportnis.ru /etc/nginx/sites-enabled/   # если используешь sites-enabled
sudo nginx -t && sudo systemctl reload nginx
```

## HTTPS (после того как A-запись sportnis.ru → 82.146.48.183 прогрелась)
```bash
sudo certbot --nginx -d sportnis.ru
```
certbot сам допишет 443, сертификат и редирект с http→https в этот server-блок.

## Порядок первого запуска
1. Добавить секреты (выше).
2. Открыть проброс на хостовом nginx (server-блок + reload). DNS указать на сервер.
3. Смёржить `feature/add-ci-cd` → `develop` → пайплайн соберёт и задеплоит.
4. Проверить: `curl -I http://127.0.0.1:8082` на сервере (контейнер web), затем `http://sportnis.ru`.
5. Выпустить сертификат (certbot).

## Заметки
- `спортнис.рф` / `wwwsportnis.ru` — добавляются аналогично отдельными server-блоками
  (для `.рф` в `server_name` нужен punycode `xn--...`) и своими certbot-сертификатами. Позже.
- Данные БД — в docker volume `sportnis-db-data`, переживают редеплой.
- Логи: `sudo docker compose -f ~/sportnis/docker-compose.prod.yml logs -f api`.
