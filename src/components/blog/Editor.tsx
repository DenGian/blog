import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

interface EditorProps {
    content: string;
    onChange: (content: string) => void;
}

const Editor = ({ content, onChange }: EditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-gray-300 rounded-md">
            {/* Toolbar */}
            <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-2">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                    title="Bold"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="none" d="M0 0h24v24H0z"/>
                        <path d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z"/>
                    </svg>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                    title="Italic"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="none" d="M0 0h24v24H0z"/>
                        <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z"/>
                    </svg>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                    title="Heading"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="none" d="M0 0h24v24H0z"/>
                        <path d="M17 11V4h2v17h-2v-8H7v8H5V4h2v7z"/>
                    </svg>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                    title="Bullet List"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="none" d="M0 0h24v24H0z"/>
                        <path d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z"/>
                    </svg>
                </button>

                <button
                    onClick={() => {
                        const url = window.prompt('Enter URL');
                        if (url) {
                            editor.chain().focus().setLink({ href: url }).run();
                        }
                    }}
                    className={`p-2 rounded ${editor.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                    title="Add Link"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="none" d="M0 0h24v24H0z"/>
                        <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z"/>
                    </svg>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-2 rounded ${editor.isActive('codeBlock') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                    title="Code Block"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="none" d="M0 0h24v24H0z"/>
                        <path d="M16.95 8.464l1.414-1.414 4.95 4.95-4.95 4.95-1.414-1.414L20.485 12 16.95 8.464zm-9.9 0L3.515 12l3.535 3.536-1.414 1.414L.686 12l4.95-4.95L7.05 8.464z"/>
                    </svg>
                </button>
            </div>

            {/* Editor Content */}
            <div className="p-4">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default Editor;