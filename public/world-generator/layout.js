// Fit a 2:1 map into the clear space between the page controls.
export function mapFraming(width,height,{top=0,bottom=0}={}) {
  const available=Math.max(1,height-top-bottom);
  const fit=Math.min(width*.92/(2*Math.PI),available/Math.PI);
  return {scale:[fit*2/width,fit*2/height],offsetY:(bottom-top)/height};
}
