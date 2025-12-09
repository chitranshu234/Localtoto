import dayjs from 'dayjs';

export const extractNames = (value: string) => {
  if (!value) {
    return '';
  }
  const names = value?.split(' ');
  const initials = names?.map(name => name?.[0]?.toUpperCase());
  return initials?.join('');
};

export const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const isDisabledMorningSlot = (currentTime = dayjs()) => {
  const startTime = dayjs(currentTime).hour(22).minute(59).second(59);
  const endTime = dayjs(currentTime).hour(23).minute(59).second(59);

  return !(currentTime.isAfter(startTime) && currentTime.isBefore(endTime));
};

export const ShowImmediateButton = () => {
  const now = new Date();
  const currentHour = now.getHours();

  return currentHour >= 6 && currentHour < 21;
};

export const getTodayOrTomorrowBasedOnTime = () => {
  const now = dayjs();
  const fourPM = dayjs().hour(15).minute(59).second(59);

  const isAfter4PM = now.isAfter(fourPM);

  const labelDate = isAfter4PM ? dayjs().add(1, 'day') : dayjs();
  const label = isAfter4PM ? 'Tomorrow' : 'Today';

  return `${label}, ${labelDate.format('DD-MM-YYYY')}`;
};
export const getTodayOrTomorrowBasedDate = () => {
  const now = dayjs();
  const fourPM = dayjs().hour(15).minute(59).second(59);

  const isAfter4PM = now.isAfter(fourPM);

  const labelDate = isAfter4PM ? dayjs().add(1, 'day') : dayjs();

  return `${labelDate.format('DD-MM-YYYY')}`;
};
export const getTodayOrTomorrowBasedDay = () => {
  const now = dayjs();
  const fourPM = dayjs().hour(15).minute(59).second(59);

  const isAfter4PM = now.isAfter(fourPM);

  const label = isAfter4PM ? 'next_day' : 'same_day';

  return label;
};
