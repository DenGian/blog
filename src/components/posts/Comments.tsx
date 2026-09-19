"use client";
import { useEffect, useRef } from "react";
export function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const config = {
      repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
      repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID,
      category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
    };
    if (!ref.current || Object.values(config).some((value) => !value)) return;
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    Object.entries({
      "data-repo": config.repo!,
      "data-repo-id": config.repoId!,
      "data-category": config.category!,
      "data-category-id": config.categoryId!,
      "data-mapping": "pathname",
      "data-strict": "1",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": "preferred_color_scheme",
      "data-lang": "nl",
    }).forEach(([key, value]) => script.setAttribute(key, value));
    ref.current.append(script);
    return () => script.remove();
  }, []);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_GISCUS_REPO &&
    process.env.NEXT_PUBLIC_GISCUS_REPO_ID &&
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY &&
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
  );
  return configured ? (
    <section className="comments" aria-labelledby="comments-title">
      <h2 id="comments-title">Reacties</h2>
      <div ref={ref} />
    </section>
  ) : null;
}
