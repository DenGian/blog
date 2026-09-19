"use client";
import { useState } from "react";
import { uploadCover } from "@/media/cloudinary";
export function MediaField({
  value,
  onChange,
  configured,
}: {
  value: string;
  onChange: (url: string) => void;
  configured: boolean;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="field">
      <label htmlFor="coverImage">Coverafbeelding</label>
      <input
        id="coverImage"
        name="coverImage"
        type="url"
        value={value}
        maxLength={2048}
        placeholder="https://…"
        onChange={(event) => onChange(event.target.value)}
      />
      <small>Een gevalideerde HTTPS-URL blijft beschikbaar als fallback.</small>
      {configured ? (
        <>
          <label className="upload-label" htmlFor="coverUpload">
            Of upload een afbeelding (max. 5 MB)
          </label>
          <input
            id="coverUpload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={busy}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setBusy(true);
              setMessage("");
              try {
                onChange(await uploadCover(file));
                setMessage("Afbeelding geüpload.");
              } catch (reason) {
                setMessage(
                  reason instanceof Error
                    ? reason.message
                    : "Uploaden is mislukt.",
                );
              } finally {
                setBusy(false);
              }
            }}
          />
        </>
      ) : (
        <p className="notice">
          Media-upload is niet geconfigureerd. Bestaande afbeeldingen en
          HTTPS-URL’s blijven werken.
        </p>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
