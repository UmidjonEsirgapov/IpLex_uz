'use client';

import { useEffect } from 'react';

export default function WwwUzCounter() {
  useEffect(() => {
    let top_js = '1.0';
    let top_r =
      'id=16197&r=' +
      encodeURIComponent(document.referrer) +
      '&pg=' +
      encodeURIComponent(window.location.href);
    document.cookie = 'smart_top=1; path=/';
    top_r += '&c=' + (document.cookie ? 'Y' : 'N');

    top_js = '1.1';
    top_r += '&j=' + (navigator.javaEnabled?.() ? 'Y' : 'N');

    top_js = '1.2';
    top_r +=
      '&wh=' +
      screen.width +
      'x' +
      screen.height +
      '&px=' +
      (navigator.appName?.substring(0, 3) === 'Mic' ? screen.colorDepth : screen.pixelDepth);

    top_js = '1.3';

    const top_rat = '&col=340F6E&t=ffffff&p=BD6F6F';
    top_r += '&js=' + top_js;

    const img = document.createElement('img');
    img.src = 'https://cnt0.www.uz/counter/collect?' + top_r + top_rat;
    img.width = 0;
    img.height = 0;
    img.alt = '';
    img.style.display = 'none';
    document.body.appendChild(img);
  }, []);

  return (
    <noscript>
      <img
        height={0}
        width={0}
        src="https://cnt0.www.uz/counter/collect?id=16197&pg=https%3A//iplex.uz&col=340F6E&t=ffffff&p=BD6F6F"
        alt=""
      />
    </noscript>
  );
}
