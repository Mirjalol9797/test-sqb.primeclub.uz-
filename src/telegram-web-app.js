// Инициализация Telegram Web App
let tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand(); // развернуть на весь экран

  // Адаптация под тему Telegram
  // document.body.style.backgroundColor = tg.themeParams.bg_color || "#ffffff";
  // document.body.style.color = tg.themeParams.text_color || "#000000";

  // Получить данные пользователя
  const user = tg.initDataUnsafe.user;

  // Добавить главную кнопку
  tg.MainButton.setText("Готово");
  tg.MainButton.show();
  tg.MainButton.onClick(() => {
    // действие при нажатии
    tg.close(); // закрыть приложение
  });

  // Отправить данные обратно в бот
  function sendToBot(data) {
    tg.sendData(JSON.stringify(data));
  }

  // Скрыть кнопку "Назад" если нужно
  tg.BackButton.hide();
}
