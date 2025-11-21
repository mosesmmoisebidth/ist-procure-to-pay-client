import { useCallback, useState } from 'react';
import { Button } from './ui/Button';

interface Props {
  onFileSelect?: (file: File | null) => void;
  label?: string;
}

export const FileDropzone = ({ onFileSelect, label = 'Proforma document' }: Props) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const selected = files && files[0] ? files[0] : null;
      setFile(selected);
      onFileSelect?.(selected);
    },
    [onFileSelect],
  );

  return (
    <div>
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <div
        onDragOver={evt => {
          evt.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={evt => {
          evt.preventDefault();
          setDragActive(false);
        }}
        onDrop={evt => {
          evt.preventDefault();
          setDragActive(false);
          handleFiles(evt.dataTransfer.files);
        }}
        className={`mt-2 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-6 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'
        }`}
      >
        <p className="text-sm font-semibold text-slate-700">Drop file here or browse</p>
        <p className="text-xs text-slate-500">PDF, PNG, JPG up to 10 MB</p>
        <label className="mt-3 cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={evt => handleFiles(evt.target.files)}
          />
          <Button variant="secondary" type="button">
            Choose File
          </Button>
        </label>
      </div>
      {file && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleFiles(null)}>
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
