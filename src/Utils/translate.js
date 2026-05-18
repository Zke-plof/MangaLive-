export const translateTitle = async (text, sourceLang = 'auto') => {
    if (!text) return '';
    try {
        // Map standard languages if needed, but 'auto' works incredibly well
        const lang = sourceLang === 'zh-hk' ? 'zh' : sourceLang;
        const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=en&dt=t&q=${encodeURIComponent(text)}`
        );
        if (!response.ok) return text;
        const data = await response.json();
        return data?.[0]?.[0]?.[0] || text;
    } catch (e) {
        console.error('Translation failed:', e);
        return text;
    }
};
