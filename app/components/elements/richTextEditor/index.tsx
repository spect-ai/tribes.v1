import { modules } from "app/constants/constants";
import React from "react";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import { Delta } from "quill";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";

interface Props {
  value: Delta;
  onChange?: any;
  placeholder: string;
  id: string;
  isHtml: boolean;
}

const Editor = ({ value, placeholder, onChange, id, isHtml }: Props) => {
  return (
    <div className="">
      {isHtml ? (
        <ReactQuill
          theme="snow"
          modules={modules}
          onChange={(value, delta, user, editor) => {
            onChange(value);
          }}
          value={value || ""}
          placeholder={placeholder}
          id={id}
        />
      ) : (
        <ReactQuill
          theme="snow"
          modules={modules}
          onChange={(value, delta, user, editor) => {
            onChange(editor.getContents());
          }}
          defaultValue={value || ""}
          placeholder={placeholder}
          id={id}
        />
      )}
    </div>
  );
};

export default Editor;
