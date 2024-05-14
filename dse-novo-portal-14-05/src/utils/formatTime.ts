import { format, getTime, formatDistanceToNow } from 'date-fns';
import {ptBR as locale} from 'date-fns/locale';

// ----------------------------------------------------------------------

export function fDate(date: Date | string | number) {
  return format(new Date(date), 'dd MMMM yyyy', {locale});
}

export function fDateTime(date: Date | string | number) {
  return format(new Date(date), 'dd MMM yyyy p',{locale});
}

export function fTimestamp(date: Date | string | number) {
  return getTime(new Date(date));
}

export function fDateTimeSuffix(date: Date | string | number) {
  return format(new Date(date), 'dd/MM/yyyy hh:mm p',{locale});
}

export function fToNow(date: Date | string | number) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true
  });
}
