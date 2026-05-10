export function formatDate(date: any) {
  var d = new Date(date);
  var month = '' + (d.getMonth() + 1);
  var day = '' + d.getDate();
  var year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}

export function daysDiff(date1: any, date2: any) {
  var diff = Math.abs(new Date(date1).getTime() - new Date(date2).getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
