export function formatTimestamp(timestamp: string) {
  if(!timestamp || timestamp === '') return;

  const date: number = + new Date(Number(timestamp) * 1000);
  const now: number = + new Date();
  // console.log('date', timestamp, date, now)

  // Проверяем, сколько времени прошло
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  // Выбираем формат времени в зависимости от времени прошедшего
  if (days > 30) {
    return new Date(date).toLocaleDateString("ru-RU"); // Если больше месяца, показываем только дату
  } else if (days > 0) {
    return `${days} ${days === 1 ? 'день' : 'дня'} назад`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'час' : 'часа'} назад`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'минута' : 'минуты'} назад`;
  } else if (seconds > 0) {
    return `${seconds} ${seconds === 1 ? 'секунда' : 'секунды'} назад`;
  } else {
    return 'Только что';
  }
}
