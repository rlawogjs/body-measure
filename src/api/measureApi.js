// ✅ 지금은 "서버가 없으니" mock으로 동작
// 나중에 여기만 fetch로 바꾸면 됨.

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 업로드/포즈추정(가짜)
 * @returns {Promise<{imageId:string, previewUrl:string, keypoints:Array<{x:number,y:number,score:number,name:string}>}>}
 */
export async function analyzeImage({ dataUrl }) {
  await sleep(700);

  // 간단한 더미 키포인트(예시)
  const keypoints = [
    { name: "head_top", x: 0.5, y: 0.12, score: 0.92 },
    { name: "neck", x: 0.5, y: 0.20, score: 0.93 },
    { name: "left_shoulder", x: 0.42, y: 0.24, score: 0.91 },
    { name: "right_shoulder", x: 0.58, y: 0.24, score: 0.91 },
    { name: "left_hip", x: 0.46, y: 0.52, score: 0.89 },
    { name: "right_hip", x: 0.54, y: 0.52, score: 0.89 },
    { name: "left_ankle", x: 0.47, y: 0.88, score: 0.87 },
    { name: "right_ankle", x: 0.53, y: 0.88, score: 0.87 },
  ];

  return {
    imageId: "img_" + Math.random().toString(16).slice(2),
    previewUrl: dataUrl,
    keypoints,
  };
}

/**
 * 기준길이(키 등)로 스케일 계산 + 측정 결과(가짜)
 * @returns {Promise<{scaleMmPerPx:number, measures:Array<{label:string,mm:number,confidence:number}>}>}
 */
export async function measureWithCalibration({ calibrationMm }) {
  await sleep(700);

  // 그냥 예시로 “스케일”과 “측정 결과”를 만들어줌
  const scaleMmPerPx = 2.1; // dummy

  const measures = [
    { label: "키(추정)", mm: calibrationMm, confidence: 0.92 },
    { label: "어깨너비", mm: Math.round(calibrationMm * 0.23), confidence: 0.86 },
    { label: "상체 길이", mm: Math.round(calibrationMm * 0.30), confidence: 0.82 },
    { label: "하체 길이", mm: Math.round(calibrationMm * 0.52), confidence: 0.80 },
    { label: "팔 길이(좌)", mm: Math.round(calibrationMm * 0.33), confidence: 0.78 },
    { label: "팔 길이(우)", mm: Math.round(calibrationMm * 0.33), confidence: 0.78 },
  ];

  return { scaleMmPerPx, measures };
}