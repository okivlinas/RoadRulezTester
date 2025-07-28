
### 📘 API Маршруты и Описание Функций

| № | Метод | Маршрут | Контроллер | Метод контроллера | Роль | Описание |
|--:|:------|:--------|:-----------|:------------------|:-----|:----------|
| 1 | POST | `/user` | user.controller | `createUser` | Гость | Создание учетной записи в системе. |
| 2 | POST | `/auth/controller` | auth.controller | `login` | Гость | Вход в систему с учетными данными. |
| 3 | GET | `/catigories` | categories.controller | `findAll` | Гость, Пользователь | Ознакомление с категориями игр. |
| 4 | GET | `/board-game` | board-game.controller | `findAll` | Гость, Пользователь | Просмотр списка доступных игр. |
| 5 | GET | `/sessions` | sessions.controller | `findAll` | Пользователь | Ознакомление с существующими игровыми сессиями. |
| 6 | GET | `/catigories:filters` | categories.controller | `findAllFilters` | Гость, Пользователь | Поиск и фильтрация категорий по тегам. |
| 7 | GET | `/board-game:filters` | board-game.controller | `findAllFilters` | Гость, Пользователь | Поиск и фильтрация игр с учетом определенных тегов. |
| 8 | POST | `/players/record` | player.controller | `create` | Преподаватель | Запись на участие в событии. |
| 9 | DELETE | `/players/unrecord:id` | player.controller | `unrecord` | Пользователь | Отмена участия в запланированном событии. |
|10 | GET | `/sessions/my-session` | sessions.controller | `findMySessions` | Пользователь | Отображение запланированных событий. |
|11 | POST | `/sessions` | sessions.controller | `create` | Пользователь | Организация новых игровых событий. |
|12 | PATCH | `/sessions:id` | sessions.controller | `update` | Пользователь | Внесение изменений в созданные события. |
|13 | POST | `/history/createHostory:eventId` | history-games.controller | `createHistory` | Пользователь | Фиксация итогов проведенного события. |
|14 | PATCH | `/user/profile` | user.controller | `updateProfile` | Пользователь | Изменение личных данных в профиле. |
|15 | POST | `/user/profile/add/games` | user.controller | `addGameToProfile` | Пользователь | Добавление информации о навыках в игре. |
|16 | PATCH | `/user/profile/games/skills:id` | user.controller | `updateGameMastery` | Пользователь | Коррекция данных о мастерстве в игре. |
|17 | GET | `/user/generate-tg-token/:userId` | user.controller | `getTelegramToken` | Пользователь | Подписка на телеграм-уведомления об изменении статуса события. |
|18 | PATCH | `/user/unsubscribe` | user.controller | `unsubscribeFromTelegram` | Пользователь | Отписка от телеграм-уведомлений. |
|19 | POST | `/chat/message` | chat.controller | `getMessage` | Пользователь | Общение в чате сессии. |
|20 | PATCH | `/sessions/:id/status` | session.controller | `updateStatus` | Пользователь | Изменение статуса сессии. |
|21 | PATCH | `/admin/users/:id/role` | admin-user.controller | `updateUserRole` | Администратор | Назначение ролей, блокировка пользователей. |
|22 | POST | `/catigories/addCategory` | categories.controller | `addCategory` | Администратор | Добавление новых категорий игр. |
|23 | PATCH | `/catigories/updateCategory/:id` | categories.controller | `update` | Администратор | Изменение названий и параметров категорий. |
|24 | DELETE | `/catigories/deleteCategory/:id` | categories.controller | `remove` | Администратор | Удаление ненужных категорий. |
|25 | POST | `/catigories/addTagToCategory` | categories.controller | `addTag` | Администратор | Добавление новых тегов для категоризации. |
|26 | DELETE | `/catigories/deleteTagToCategory/:nameTag` | categories.controller | `removeTag` | Администратор | Удаление ненужных тегов. |
|27 | POST | `/board-games` | board-game.controller | `create` | Администратор | Добавление новых игр в систему. |
|28 | PATCH | `/board-games:id` | board-game.controller | `update` | Администратор | Обновление информации об играх. |
|29 | DELETE | `/board-games:id` | board-game.controller | `remove` | Администратор | Удаление устаревших или ненужных игр. |
|30 | POST | `/board-games/addTagToGame` | board-game.controller | `addTag` | Администратор | Добавление тегов для игр. |
|31 | DELETE | `/board-games/deleteTagToGame/:nameTag` | board-game.controller | `removeTag` | Администратор | Удаление неактуальных тегов для игр. |
