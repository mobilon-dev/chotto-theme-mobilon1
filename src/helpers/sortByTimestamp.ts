export const sortByTimestamp = (messages) => {
  return messages.sort((a, b) => {
    if (Number(a.timestamp) < Number(b.timestamp)) return -1;
    if (Number(a.timestamp) > Number(b.timestamp)) return 1;
    return 0;
  });
};
