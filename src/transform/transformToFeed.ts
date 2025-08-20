import {sortByTimestamp, formatTimestamp, insertDaySeparators} from '../helpers';

export const transformToFeed = (objects: Array<{direction: string; timestamp: number}>, outPreviousDay: number | null = null) => {
  // а. сортировка по timestamp
  const messages1 = sortByTimestamp(objects);

  // б. переформатирование
  const messages2 = messages1.map((m: {direction: string; timestamp: number}) => {
    return {
      ...m,
      position: m.direction === 'outgoing' ? 'right' : 'left',
      time: formatTimestamp(m.timestamp),
    };
  });

  // в. вставка временных отсечек
  const messages3 = insertDaySeparators(messages2, outPreviousDay);
  return messages3;
}
