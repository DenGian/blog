import { useEffect, useRef } from 'react';

interface CommentsProps {
    slug: string;
}

const Comments = ({ slug }: CommentsProps) => {
    const commentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load the Giscus script
        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', 'DenGian/blog');
        script.setAttribute('data-repo-id', 'R_kgDONxT2YQ');
        script.setAttribute('data-category', 'General');
        script.setAttribute('data-category-id', 'DIC_kwDONxT2Yc4Cmj3X');
        script.setAttribute('data-mapping', 'pathname');
        script.setAttribute('data-strict', '0');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '0');
        script.setAttribute('data-input-position', 'bottom');
        script.setAttribute('data-theme', 'preferred_color_scheme');
        script.setAttribute('data-lang', 'en');
        script.crossOrigin = 'anonymous';
        script.async = true;

        const comments = commentRef.current;
        if (comments) comments.appendChild(script);

        // Cleanup
        return () => {
            const comments = commentRef.current;
            if (comments) {
                const giscusFrame = comments.querySelector('iframe');
                if (giscusFrame) {
                    comments.removeChild(giscusFrame);
                }
            }
        };
    }, []);

    return (
        <div className="mt-10 pt-10 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Comments</h2>
            <div ref={commentRef} />
        </div>
    );
};

export default Comments;