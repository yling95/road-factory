
// 判断是否是图片
export const isImage = (url: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg']
  return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext))
}
// 判断是否是视频
export const isVideo = (url: string) => {
  const videoExtensions = ['.mp4', '.avi', '.mov', '.webm']
  return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext))
}
