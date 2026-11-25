type MathJax = {
  startup: { promise: Promise<void> };
  tex2svgPromise: (
    tex: string,
    options: { display: boolean },
  ) => Promise<HTMLElement>;
};

let loading: Promise<MathJax> | undefined;
export function loadMathJax(): Promise<MathJax> {
  if (loading) return loading;
  loading = new Promise<MathJax>((resolve, reject) => {
    const mathWindow = window as Window & { MathJax?: MathJax | object };
    mathWindow.MathJax = {
      startup: { typeset: false },
      svg: { fontCache: 'none' },
    };
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4.0.0/tex-svg.js';
    script.async = true;
    script.onload = async () => {
      try {
        const math = mathWindow.MathJax as MathJax;
        await math.startup.promise;
        resolve(math);
      } catch (error) {
        reject(error);
      }
    };
    script.onerror = () => {
      script.remove();
      reject(new Error('MathJax could not load'));
    };
    document.head.append(script);
  }).catch((error) => {
    loading = undefined;
    throw error;
  });
  return loading;
}
