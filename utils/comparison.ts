import { PNG } from "pngjs";

export function applyIgnoreAreas(image: PNG, ignoreAreas: any): PNG {
  // console.log(ignoreAreas);
  ignoreAreas.forEach((area: any) => {
    for (
      let y = Math.round(area.y * area.scale);
      y <
      Math.min(Math.round((area.y + area.height) * area.scale), image.height);
      y++
    ) {
      for (
        let x = Math.round(area.x * area.scale);
        x <
        Math.min(Math.round((area.x + area.width) * area.scale), image.width);
        x++
      ) {
        const k = 4 * (image.width * y + x);
        image.data[k + 0] = 0;
        image.data[k + 1] = 0;
        image.data[k + 2] = 0;
        image.data[k + 3] = 0;
      }
    }
  });
  return image;
}
