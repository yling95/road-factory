interface Option {
  label: string;
  value: number | string;
}

export function findLabelByValue(array: Option[], value: number | string, defaultLabel: string = "未知"): string {
  const item = array.find((element) => element.value === value)
  return item ? item.label : defaultLabel
}

export const getImgUrlByUrl = (url: string) => {
  return import.meta.env.VITE_SERVE + url
}
